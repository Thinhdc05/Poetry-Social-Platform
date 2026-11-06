import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'
import { useAuth } from '../auth'

const BOOKMARKS_KEY = 'tho_moc_bookmarked_poem_ids_v1'
const INITIAL_BOOKMARKS: string[] = []

function loadLocalBookmarks(): string[] {
  if (typeof window === 'undefined') return INITIAL_BOOKMARKS
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY)
    if (!raw) return INITIAL_BOOKMARKS
    const parsed = JSON.parse(raw) as string[]
    return parsed.filter((id) => id !== '1' && id !== '2' && id !== '3' && id !== '4' && id !== '5')
  } catch {
    return INITIAL_BOOKMARKS
  }
}

export function useBookmarks() {
  const { user } = useAuth()
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(loadLocalBookmarks)

  // Tải từ Supabase nếu đã đăng nhập, ngược lại đọc từ localStorage
  useEffect(() => {
    let isMounted = true

    async function fetchServerBookmarks() {
      if (!user || !isSupabaseConfigured) {
        setBookmarkedIds(loadLocalBookmarks())
        return
      }

      try {
        const { data, error } = await supabase
          .from('poem_bookmarks')
          .select('poem_id')
          .eq('user_id', user.id)

        if (!error && data && isMounted) {
          const ids = data.map((b) => b.poem_id)
          setBookmarkedIds(ids)
          localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids))
          return
        }
      } catch {
        // Fallback local
      }

      if (isMounted) setBookmarkedIds(loadLocalBookmarks())
    }

    fetchServerBookmarks()

    const handleStorage = () => setBookmarkedIds(loadLocalBookmarks())
    window.addEventListener('tho-moc-bookmarks-changed', handleStorage)
    return () => {
      isMounted = false
      window.removeEventListener('tho-moc-bookmarks-changed', handleStorage)
    }
  }, [user])

  const toggleBookmark = useCallback(
    async (poemId: string) => {
      const exists = bookmarkedIds.includes(poemId)
      const updated = exists
        ? bookmarkedIds.filter((id) => id !== poemId)
        : [poemId, ...bookmarkedIds]

      // Cập nhật lạc quan (optimistic)
      setBookmarkedIds(updated)
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event('tho-moc-bookmarks-changed'))

      // Đồng bộ vào Supabase nếu có tài khoản
      if (user && isSupabaseConfigured) {
        try {
          if (exists) {
            await supabase
              .from('poem_bookmarks')
              .delete()
              .eq('user_id', user.id)
              .eq('poem_id', poemId)
          } else {
            await supabase
              .from('poem_bookmarks')
              .insert({ user_id: user.id, poem_id: poemId })
          }
        } catch (err) {
          console.warn('Lỗi đồng bộ bookmark lên Supabase:', err)
        }
      }
    },
    [bookmarkedIds, user]
  )

  const isBookmarked = useCallback(
    (poemId: string) => bookmarkedIds.includes(poemId),
    [bookmarkedIds]
  )

  return {
    bookmarkedIds,
    toggleBookmark,
    isBookmarked,
  }
}
