import { useState, type FormEvent } from 'react'
import { reportPoem } from '../../features/poems'
import { Flag, X, CheckCircle2 } from 'lucide-react'

interface ReportPoemModalProps {
  poemId: string
  poemTitle: string
  isOpen: boolean
  onClose: () => void
  currentUserId?: string
}

export function ReportPoemModal({
  poemId,
  poemTitle,
  isOpen,
  onClose,
  currentUserId,
}: ReportPoemModalProps) {
  const [reason, setReason] = useState('copyright')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await reportPoem(poemId, reason, details, currentUserId)
    setSubmitting(false)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      onClose()
    }, 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fade-in font-serif">
      <div className="w-full max-w-md bg-white dark:bg-[#1c1a18] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-start justify-between border-b border-stone-150 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
              <Flag className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Báo Cáo Bài Thơ
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-xs">
                &ldquo;{poemTitle}&rdquo;
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
              Đã ghi nhận báo cáo của bạn
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Ban quản trị Thơ Mộc sẽ kiểm tra tác quyền và xử lý trong thời gian sớm nhất.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-medium text-stone-700 dark:text-stone-300 block">
                Lý do báo cáo:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-700"
              >
                <option value="copyright">Vi phạm bản quyền / Quyền tác giả</option>
                <option value="incorrect_author">Sai tên tác giả / Nguồn trích</option>
                <option value="inappropriate">Nội dung không phù hợp chuẩn mực</option>
                <option value="spam">Spam / Bài thơ trùng lặp</option>
                <option value="other">Lý do khác</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-stone-700 dark:text-stone-300 block">
                Chi tiết bổ sung (tùy chọn):
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Cung cấp link gốc hoặc thông tin sở hữu trí tuệ để đối chiếu..."
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-700 resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-150 dark:border-stone-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-stone-50 font-medium cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

