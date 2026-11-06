import { useState } from 'react'
import type { LineNote, SavedVerseHighlight } from '../../features/line-annotations'

interface MarginaliaPanelProps {
  selectedLineIndex: number | null
  selectedLineText: string
  notes: LineNote[]
  highlights: SavedVerseHighlight[]
  currentUserName: string
  currentUserId?: string
  lines: string[]
  onSelectLine: (index: number | null) => void
  onToggleHighlight: (index: number, text: string) => void
  onAddNote: (
    index: number,
    text: string,
    authorName: string,
    note: string,
    isPrivate?: boolean,
    authorId?: string
  ) => void
}

export function MarginaliaPanel({
  selectedLineIndex,
  selectedLineText,
  notes,
  highlights,
  currentUserName,
  currentUserId,
  lines,
  onSelectLine,
  onToggleHighlight,
  onAddNote,
}: MarginaliaPanelProps) {
  const [noteTab, setNoteTab] = useState<'public' | 'private'>('public')
  const [noteInput, setNoteInput] = useState('')
  const [isPrivateInput, setIsPrivateInput] = useState(false)

  const selectedLineNotes = notes.filter((n) => n.lineIndex === selectedLineIndex)
  const isSelectedHighlighted = highlights.some(
    (h) => h.lineIndex === selectedLineIndex
  )

  const publicNotes = selectedLineNotes.filter((n) => !n.isPrivate)
  const privateNotes = selectedLineNotes.filter(
    (n) => n.isPrivate && (currentUserId ? n.authorId === currentUserId : true)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedLineIndex === null || !noteInput.trim()) return
    onAddNote(
      selectedLineIndex,
      selectedLineText,
      currentUserName,
      noteInput,
      isPrivateInput,
      currentUserId
    )
    setNoteInput('')
  }

  // Danh sách các câu được nhiều người gạch chân nhất
  const topHighlightedLines = lines
    .map((line, idx) => ({
      line,
      idx,
      isHighlighted: highlights.some((h) => h.lineIndex === idx),
      notesCount: notes.filter((n) => n.lineIndex === idx).length,
    }))
    .filter((item) => item.line.trim().length > 0 && (item.isHighlighted || item.notesCount > 0))

  return (
    <aside className="sticky top-20 space-y-4">
      {selectedLineIndex !== null && selectedLineText ? (
        /* Hộp Marginalia chi tiết khi đang chọn câu thơ */
        <div className="bg-white/95 dark:bg-[#1a1816] border border-amber-300/80 dark:border-amber-700/60 rounded-2xl p-5 sm:p-6 shadow-md transition-all space-y-4">
          <div className="flex items-start justify-between gap-2 border-b border-stone-200/80 dark:border-stone-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-serif tracking-widest text-amber-800 dark:text-amber-400 font-semibold block">
                ✨ Lề Sách Tri Âm • Câu {selectedLineIndex + 1}
              </span>
              <p className="font-serif italic font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base mt-1 line-clamp-2">
                &ldquo;{selectedLineText}&rdquo;
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectLine(null)}
              title="Đóng chú giải"
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 text-xs cursor-pointer rounded-md"
            >
              ✕
            </button>
          </div>

          {/* Nút gạch chân câu này */}
          <button
            type="button"
            onClick={() => onToggleHighlight(selectedLineIndex, selectedLineText)}
            className={`w-full py-2 px-3 rounded-xl text-xs font-serif font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
              isSelectedHighlighted
                ? 'bg-amber-800 border-amber-800 text-stone-50 shadow-2xs'
                : 'bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:border-amber-500'
            }`}
          >
            <span>✨</span>
            <span>{isSelectedHighlighted ? 'Đã gạch chân tâm đắc' : 'Gạch chân câu thơ này'}</span>
          </button>

          {/* Tabs: Tri âm bạn đọc vs Ghi chú của tôi */}
          <div className="flex border-b border-stone-200 dark:border-stone-800 text-xs font-serif">
            <button
              type="button"
              onClick={() => setNoteTab('public')}
              className={`pb-2 px-3 border-b-2 font-medium cursor-pointer transition-colors ${
                noteTab === 'public'
                  ? 'border-amber-700 text-amber-800 dark:text-amber-400 dark:border-amber-400'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Tri Âm ({publicNotes.length})
            </button>
            <button
              type="button"
              onClick={() => setNoteTab('private')}
              className={`pb-2 px-3 border-b-2 font-medium cursor-pointer transition-colors ${
                noteTab === 'private'
                  ? 'border-amber-700 text-amber-800 dark:text-amber-400 dark:border-amber-400'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Ghi Chú Của Tôi ({privateNotes.length})
            </button>
          </div>

          {/* Danh sách lời bình câu thơ */}
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {noteTab === 'public' ? (
              publicNotes.length > 0 ? (
                publicNotes.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-stone-50/90 dark:bg-[#23201d] border border-stone-200/70 dark:border-stone-800 text-xs font-serif space-y-1"
                  >
                    <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {n.authorName}
                      </span>
                      <time className="text-[10px]">{n.createdAt}</time>
                    </div>
                    <p className="text-stone-700 dark:text-stone-200 leading-relaxed">
                      {n.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs font-serif italic text-stone-500 dark:text-stone-400 py-3 text-center">
                  Chưa có lời bình tri âm nào cho câu thơ này. Hãy là người đầu tiên đặt bút!
                </p>
              )
            ) : privateNotes.length > 0 ? (
              privateNotes.map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-xl bg-stone-50/90 dark:bg-[#23201d] border border-stone-200/70 dark:border-stone-800 text-xs font-serif space-y-1"
                >
                  <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                    <span className="font-bold text-amber-800 dark:text-amber-400">🔒 Riêng tư</span>
                    <time className="text-[10px]">{n.createdAt}</time>
                  </div>
                  <p className="text-stone-700 dark:text-stone-200 leading-relaxed">
                    {n.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs font-serif italic text-stone-500 dark:text-stone-400 py-3 text-center">
                Bạn chưa có ghi chú riêng tư nào cho câu thơ này.
              </p>
            )}
          </div>

          {/* Form thêm chú giải */}
          <form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t border-stone-150 dark:border-stone-800">
            <textarea
              rows={2}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Viết cảm nhận / lời bàn về câu thơ này..."
              required
              className="w-full px-3 py-2 text-xs font-serif bg-stone-50 dark:bg-[#23201d] border border-stone-200 dark:border-stone-700 rounded-xl text-stone-850 dark:text-stone-100 focus:outline-none focus:border-amber-700 resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[11px] font-serif text-stone-500 dark:text-stone-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivateInput}
                  onChange={(e) => setIsPrivateInput(e.target.checked)}
                  className="rounded accent-amber-800"
                />
                <span>Chỉ mình tôi thấy</span>
              </label>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-serif font-medium bg-amber-800 hover:bg-amber-900 text-stone-50 rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                Gửi lời bình
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Hướng dẫn và các câu thơ tâm đắc khi chưa bấm câu nào */
        <div className="space-y-4">
          <div className="bg-white/95 dark:bg-[#1a1816] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-5 text-xs font-serif space-y-2 shadow-2xs">
            <span className="font-bold text-amber-800 dark:text-amber-400 block uppercase tracking-wider text-[11px]">
              📜 Đàm Đạo Theo Dòng Thơ
            </span>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Chạm vào bất kỳ câu thơ nào bên cạnh để đọc chú giải tri âm, gạch chân tâm đắc hoặc gửi gắm cảm nhận của riêng bạn.
            </p>
          </div>

          {topHighlightedLines.length > 0 && (
            <div className="bg-white/95 dark:bg-[#1a1816] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-5 space-y-3 shadow-2xs">
              <h5 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200 border-b border-stone-150 dark:border-stone-800 pb-2">
                ✨ Câu Thơ Tâm Đắc Trong Bài
              </h5>
              <div className="space-y-2 divide-y divide-stone-100 dark:divide-stone-800">
                {topHighlightedLines.map((item) => (
                  <button
                    key={item.idx}
                    type="button"
                    onClick={() => onSelectLine(item.idx)}
                    className="w-full text-left pt-2 first:pt-0 group cursor-pointer block"
                  >
                    <p className="font-serif italic text-xs text-stone-800 dark:text-stone-200 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                      &ldquo;{item.line}&rdquo;
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-400">
                      <span>Câu {item.idx + 1}</span>
                      {item.isHighlighted && <span>• ✨ Đã gạch chân</span>}
                      {item.notesCount > 0 && <span>• 💬 {item.notesCount} lời bàn</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}

