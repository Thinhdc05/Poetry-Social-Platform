import { useState, useMemo } from 'react'
import { generatePoemCardImage, downloadPoemCard } from '../../features/share-card'

interface SharePoemModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  author: string
  content: string
}

export function SharePoemModal({
  isOpen,
  onClose,
  title,
  author,
  content,
}: SharePoemModalProps) {
  const [cardTheme, setCardTheme] = useState<'paper' | 'sepia' | 'ink'>('paper')

  const lines = useMemo(() => {
    return content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .slice(0, 8)
  }, [content])

  const previewUrl = useMemo(() => {
    if (!isOpen) return ''
    return generatePoemCardImage({
      title,
      author,
      lines,
      theme: cardTheme,
    })
  }, [isOpen, title, author, lines, cardTheme])

  if (!isOpen) return null

  const handleDownload = () => {
    if (!previewUrl) return
    downloadPoemCard(previewUrl, `tho-moc-${title.toLowerCase().replace(/\s+/g, '-')}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-stone-150 dark:border-stone-800 pb-3">
          <h3 className="text-base font-serif font-bold text-stone-800 dark:text-stone-100">
            Tạo Thẻ Thơ Để Chia Sẻ
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Chọn màu thẻ */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-500 font-serif">Chất liệu thẻ:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCardTheme('paper')}
              className={`px-3 py-1 rounded-lg text-xs font-serif border cursor-pointer ${
                cardTheme === 'paper'
                  ? 'bg-stone-100 border-amber-800 text-amber-900 font-medium'
                  : 'border-stone-200 text-stone-600'
              }`}
            >
              Giấy dó
            </button>
            <button
              type="button"
              onClick={() => setCardTheme('sepia')}
              className={`px-3 py-1 rounded-lg text-xs font-serif border cursor-pointer ${
                cardTheme === 'sepia'
                  ? 'bg-amber-100 border-amber-800 text-amber-950 font-medium'
                  : 'border-stone-200 text-stone-600'
              }`}
            >
              Cổ điển (Sepia)
            </button>
            <button
              type="button"
              onClick={() => setCardTheme('ink')}
              className={`px-3 py-1 rounded-lg text-xs font-serif border cursor-pointer ${
                cardTheme === 'ink'
                  ? 'bg-stone-850 border-amber-600 text-stone-100 font-medium'
                  : 'border-stone-200 text-stone-600'
              }`}
            >
              Mực đêm
            </button>
          </div>
        </div>

        {/* Khung xem trước */}
        <div className="flex justify-center bg-stone-100 dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800 max-h-[360px] overflow-hidden">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Xem trước thẻ thơ"
              className="max-h-[320px] rounded-lg shadow-sm object-contain"
            />
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-500 hover:text-stone-700 cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-stone-50 text-xs font-medium rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>↓</span>
            <span>Tải ảnh thẻ thơ</span>
          </button>
        </div>
      </div>
    </div>
  )
}

