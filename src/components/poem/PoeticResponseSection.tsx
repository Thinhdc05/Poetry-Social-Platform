import { useState } from 'react'
import type { PoeticResponse } from '../../features/poetic-duels'

interface PoeticResponseSectionProps {
  poemTitle: string
  poemAuthor: string
  responses: PoeticResponse[]
  currentUserName: string
  currentUserId?: string
  onSubmitResponse: (input: {
    authorName: string
    authorId?: string
    content: string
    rhymeNote?: string
  }) => void
  onLikeResponse: (id: string) => void
  onToggleEndorse: (id: string) => void
}

export function PoeticResponseSection({
  poemTitle,
  poemAuthor,
  responses,
  currentUserName,
  currentUserId,
  onSubmitResponse,
  onLikeResponse,
  onToggleEndorse,
}: PoeticResponseSectionProps) {
  const [isComposing, setIsComposing] = useState(false)
  const [content, setContent] = useState('')
  const [rhymeNote, setRhymeNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    onSubmitResponse({
      authorName: currentUserName,
      authorId: currentUserId,
      content,
      rhymeNote,
    })
    setContent('')
    setRhymeNote('')
    setIsComposing(false)
  }

  return (
    <div className="space-y-6">
      {/* Đầu mục Xướng - Họa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl p-4 sm:p-5">
        <div>
          <span className="text-[11px] font-serif uppercase tracking-wider text-amber-800 dark:text-amber-400 font-semibold">
            ⚔️ Thi Đàn Xướng – Họa (Bài gốc luôn giữ nguyên vẹn)
          </span>
          <p className="text-xs text-stone-600 dark:text-stone-400 font-serif mt-0.5">
            Cảm tác hoặc nối vần cùng bài <strong>&ldquo;{poemTitle}&rdquo;</strong> của{' '}
            <strong>{poemAuthor}</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsComposing((prev) => !prev)}
          className="shrink-0 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-stone-50 text-xs font-serif font-medium transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          {isComposing ? 'Đóng khung họa thơ' : '✒️ Họa lại bài này'}
        </button>
      </div>

      {/* Form sáng tác bài họa */}
      {isComposing && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/95 dark:bg-stone-900/95 border border-amber-300/80 dark:border-amber-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-sm text-stone-850 dark:text-stone-100">
              Đặt bút họa thơ cùng {poemAuthor}
            </h4>
            <span className="text-[11px] text-stone-400 font-serif">
              Bút danh: {currentUserName}
            </span>
          </div>

          <input
            type="text"
            value={rhymeNote}
            onChange={(e) => setRhymeNote(e.target.value)}
            placeholder="Ghi chú thể thơ / vần điệu (VD: Họa vần lục bát, Cảm tác 4 câu...)"
            className="w-full px-3.5 py-2 text-xs font-serif bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-700"
          />

          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={'Gõ những câu thơ họa đáp của bạn tại đây...\nGiữ nguyên ngắt dòng cho từng câu thơ.'}
            required
            className="w-full px-4 py-3 text-sm font-serif bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-850 dark:text-stone-100 focus:outline-none focus:border-amber-700 leading-relaxed"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsComposing(false)}
              className="px-3.5 py-1.5 text-xs font-serif text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-serif font-medium bg-stone-900 dark:bg-amber-700 text-stone-50 rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Gửi bài thơ họa
            </button>
          </div>
        </form>
      )}

      {/* Danh sách thẻ thơ họa có trục dây mực nối */}
      {responses.length === 0 ? (
        <div className="text-center py-10 bg-white/70 dark:bg-stone-900/60 rounded-2xl border border-stone-200/70 dark:border-stone-800 p-6">
          <p className="text-xs font-serif italic text-stone-500 dark:text-stone-400">
            Chưa có bài họa nào. Hãy là người đầu tiên đối ẩm vài câu thơ với tác giả!
          </p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-5 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-4 before:w-0.5 before:bg-amber-800/30 dark:before:bg-amber-500/30">
          {responses.map((resp) => (
            <div
              key={resp.id}
              className="relative bg-white/95 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-2xs transition-all hover:border-amber-700/50"
            >
              {/* Nút thắt dây mực */}
              <span className="absolute -left-[19px] sm:-left-[23px] top-6 w-3 h-3 rounded-full bg-amber-800 dark:bg-amber-500 ring-4 ring-stone-50 dark:ring-stone-950" />

              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-stone-100 dark:border-stone-800 text-xs font-serif">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    ✒️ {resp.authorName}
                  </span>
                  {resp.rhymeNote && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                      {resp.rhymeNote}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {resp.isAuthorEndorsed && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-900/10 dark:bg-red-950/60 border border-red-800/30 text-red-800 dark:text-red-300 text-[11px] font-serif font-semibold">
                      印 Tri Âm Tác Giả
                    </span>
                  )}
                  <time className="text-[11px] text-stone-400">{resp.createdAt}</time>
                </div>
              </div>

              <div className="font-serif text-stone-850 dark:text-stone-100 whitespace-pre-line italic leading-relaxed text-sm sm:text-base pl-3 border-l-2 border-amber-700/40 my-2">
                {resp.content}
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between text-xs font-serif text-stone-500 dark:text-stone-400">
                <button
                  type="button"
                  onClick={() => onLikeResponse(resp.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100/70 dark:hover:bg-amber-950/40 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                >
                  <span>🍵</span>
                  <span>Thưởng trà ({resp.likesCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleEndorse(resp.id)}
                  title="Đóng dấu ấn Tri Âm cho bài họa xuất sắc"
                  className="text-[11px] text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  {resp.isAuthorEndorsed ? 'Gỡ ấn Tri Âm' : 'Đóng ấn Tri Âm 印'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

