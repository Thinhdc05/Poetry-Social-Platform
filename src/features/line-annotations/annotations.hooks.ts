import { useState, useEffect, useCallback } from 'react'
import type { LineNote, SavedVerseHighlight } from './annotations.types'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'

const NOTES_STORAGE_KEY = 'tho_moc_line_notes_v1'
const HIGHLIGHTS_STORAGE_KEY = 'tho_moc_saved_highlights_v1'

const INITIAL_LINE_NOTES: LineNote[] = []
const INITIAL_HIGHLIGHTS: SavedVerseHighlight[] = []

function loadNotes(): LineNote[] {
  if (typeof window === 'undefined') return INITIAL_LINE_NOTES
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY)
    if (!raw) return INITIAL_LINE_NOTES
    const parsed = JSON.parse(raw) as LineNote[]
    return parsed.filter((n) => n.poemId !== '1' && n.poemId !== '2' && n.poemId !== '3')
  } catch {
    return INITIAL_LINE_NOTES
  }
}

export function getSavedHighlights(): SavedVerseHighlight[] {
  if (typeof window === 'undefined') return INITIAL_HIGHLIGHTS
  try {
    const raw = localStorage.getItem(HIGHLIGHTS_STORAGE_KEY)
    if (!raw) return INITIAL_HIGHLIGHTS
    const parsed = JSON.parse(raw) as SavedVerseHighlight[]
    return parsed.filter((h) => h.poemId !== '1' && h.poemId !== '2' && h.poemId !== '3')
  } catch {
    return INITIAL_HIGHLIGHTS
  }
}

export function useLineAnnotations(
  poemId: string | undefined,
  poemTitle: string,
  poemAuthor: string
) {
  const [notes, setNotes] = useState<LineNote[]>([])
  const [highlights, setHighlights] = useState<SavedVerseHighlight[]>([])
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!poemId) return
    let isMounted = true

    // Đọc ngay từ local trước
    setNotes(loadNotes().filter((n) => n.poemId === poemId))
    setHighlights(getSavedHighlights().filter((h) => h.poemId === poemId))
    setSelectedLineIndex(null)

    // Đồng bộ từ Supabase nếu có
    async function fetchFromSupabase() {
      if (!isSupabaseConfigured || !poemId) return
      try {
        const [notesRes, highlightsRes] = await Promise.all([
          supabase
            .from('marginalia_notes')
            .select('id, poem_id, user_id, author_name, line_index, line_text, content, is_private, created_at')
            .eq('poem_id', poemId)
            .order('created_at', { ascending: false }),
          supabase
            .from('verse_highlights')
            .select('id, poem_id, line_index, line_text, created_at')
            .eq('poem_id', poemId),
        ])

        if (!notesRes.error && notesRes.data && isMounted) {
          const dbNotes: LineNote[] = notesRes.data.map((n) => ({
            id: n.id,
            poemId: n.poem_id,
            lineIndex: n.line_index,
            lineText: n.line_text,
            authorName: n.author_name,
            authorId: n.user_id,
            content: n.content,
            createdAt: new Date(n.created_at).toLocaleDateString('vi-VN'),
            isPrivate: n.is_private,
          }))
          setNotes(dbNotes)
        }

        if (!highlightsRes.error && highlightsRes.data && isMounted) {
          const dbHighlights: SavedVerseHighlight[] = highlightsRes.data.map((h) => ({
            id: h.id,
            poemId: h.poem_id,
            poemTitle,
            poemAuthor,
            lineIndex: h.line_index,
            lineText: h.line_text,
            savedAt: new Date(h.created_at).toLocaleDateString('vi-VN'),
          }))
          setHighlights(dbHighlights)
        }
      } catch {
        // Fallback local
      }
    }

    fetchFromSupabase()

    return () => {
      isMounted = false
    }
  }, [poemId, poemTitle, poemAuthor])

  const addLineNote = useCallback(
    async (
      lineIndex: number,
      lineText: string,
      authorName: string,
      content: string,
      isPrivate = false,
      authorId?: string
    ) => {
      if (!poemId || !content.trim()) return
      const newNote: LineNote = {
        id: `ln-${Date.now()}`,
        poemId,
        lineIndex,
        lineText,
        authorName: authorName || 'Bạn thơ',
        authorId,
        content: content.trim(),
        createdAt: new Date().toLocaleDateString('vi-VN'),
        isPrivate,
      }

      // Optimistic update
      const all = loadNotes()
      const updated = [newNote, ...all]
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updated))
      setNotes(updated.filter((n) => n.poemId === poemId))

      // Lưu lên Supabase
      if (isSupabaseConfigured) {
        try {
          await supabase.from('marginalia_notes').insert({
            poem_id: poemId,
            user_id: authorId || null,
            author_name: authorName || 'Bạn thơ',
            line_index: lineIndex,
            line_text: lineText,
            content: content.trim(),
            is_private: isPrivate,
          })
        } catch (err) {
          console.warn('Lỗi lưu marginalia lên Supabase:', err)
        }
      }
    },
    [poemId]
  )

  const toggleHighlightLine = useCallback(
    async (lineIndex: number, lineText: string) => {
      if (!poemId) return
      const all = getSavedHighlights()
      const exists = all.some(
        (h) => h.poemId === poemId && h.lineIndex === lineIndex
      )
      let updated: SavedVerseHighlight[]
      if (exists) {
        updated = all.filter(
          (h) => !(h.poemId === poemId && h.lineIndex === lineIndex)
        )
      } else {
        const item: SavedVerseHighlight = {
          id: `hl-${Date.now()}`,
          poemId,
          poemTitle,
          poemAuthor,
          lineIndex,
          lineText,
          savedAt: new Date().toLocaleDateString('vi-VN'),
        }
        updated = [item, ...all]
      }
      localStorage.setItem(HIGHLIGHTS_STORAGE_KEY, JSON.stringify(updated))
      setHighlights(updated.filter((h) => h.poemId === poemId))

      // Đồng bộ DB nếu có user
      if (isSupabaseConfigured) {
        try {
          const userRes = await supabase.auth.getUser()
          const userId = userRes.data?.user?.id
          if (userId) {
            if (exists) {
              await supabase
                .from('verse_highlights')
                .delete()
                .eq('user_id', userId)
                .eq('poem_id', poemId)
                .eq('line_index', lineIndex)
            } else {
              await supabase.from('verse_highlights').insert({
                user_id: userId,
                poem_id: poemId,
                line_index: lineIndex,
                line_text: lineText,
              })
            }
          }
        } catch (err) {
          console.warn('Lỗi đồng bộ highlight lên Supabase:', err)
        }
      }
    },
    [poemId, poemTitle, poemAuthor]
  )

  return {
    notes,
    highlights,
    selectedLineIndex,
    setSelectedLineIndex,
    addLineNote,
    toggleHighlightLine,
  }
}
