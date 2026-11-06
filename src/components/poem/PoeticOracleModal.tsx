import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ORACLE_DOMAINS,
  drawPoeticOracle,
  type OracleDomain,
  type PoeticOracleResult,
} from '../../features/oracle'
import { usePoems } from '../../features/poems'

interface PoeticOracleModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PoeticOracleModal({ isOpen, onClose }: PoeticOracleModalProps) {
  const { poems } = usePoems()
  const [selectedDomain, setSelectedDomain] = useState<OracleDomain>('love')
  const [drawnResult, setDrawnResult] = useState<PoeticOracleResult | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  if (!isOpen) return null

  const handleDraw = () => {
    setIsDrawing(true)
    setSavedSuccess(false)
    setTimeout(() => {
      const result = drawPoeticOracle(selectedDomain, poems)
      setDrawnResult(result)
      setIsDrawing(false)
    }, 600)
  }

  const handleSaveToNotebook = () => {
    if (!drawnResult) return
    try {
      const existingRaw = localStorage.getItem('tho_moc_saved_oracles')
      const existing: PoeticOracleResult[] = existingRaw ? JSON.parse(existingRaw) : []
      localStorage.setItem('tho_moc_saved_oracles', JSON.stringify([drawnResult, ...existing]))
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch {
      // Bỏ qua nếu bộ nhớ đầy
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#181614] text-stone-100 border border-amber-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center ring-1 ring-amber-500/20 max-h-[90vh] overflow-y-auto">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-5 text-stone-400 hover:text-stone-100 text-sm cursor-pointer p-1"
        >
          ✕
        </button>

        <header className="space-y-1.5">
          <span className="text-[11px] font-serif uppercase tracking-widest text-amber-400 font-semibold block">
            ✦ Thi Đàn Huyền Cơ ✦
          </span>
          <h3 className="text-2xl font-serif font-bold text-stone-50">
            {drawnResult ? 'Quẻ Thơ Của Bạn' : 'Gieo Quẻ Bói Thơ Tri Âm'}
          </h3>
          <p className="text-xs text-stone-400 font-serif italic max-w-sm mx-auto">
            {drawnResult
              ? 'Lắng nghe thông điệp từ câu chữ và chiêm nghiệm cho cõi lòng hôm nay.'
              : 'Chọn một tâm nguyện trong lòng và tĩnh tâm gieo quẻ từ kho tàng thi ca.'}
          </p>
        </header>

        {!drawnResult ? (
          <div className="space-y-6 text-left">
            {/* 1. Lựa chọn cung tâm nguyện */}
            <div>
              <label className="block text-xs font-serif font-semibold text-amber-300 mb-2.5 uppercase tracking-wider">
                1. Chọn Cõi Lòng Cần Luận Giải:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ORACLE_DOMAINS.map((domain) => {
                  const isSelected = selectedDomain === domain.key
                  return (
                    <button
                      key={domain.key}
                      type="button"
                      onClick={() => setSelectedDomain(domain.key)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-950/50 text-stone-100 ring-1 ring-amber-500 shadow-sm'
                          : 'border-stone-800 bg-stone-900/60 hover:border-amber-700/60 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{domain.icon}</span>
                        <span className="font-serif font-bold text-xs sm:text-sm text-stone-100">
                          {domain.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 font-serif line-clamp-2 mt-1">
                        {domain.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Nút bấm gieo quẻ */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleDraw}
                disabled={isDrawing}
                className={`w-full py-3.5 px-6 rounded-2xl bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-stone-50 font-serif font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
                  isDrawing ? 'animate-pulse' : ''
                }`}
              >
                <span>🎴</span>
                <span>{isDrawing ? 'Đang Lắc Ống Thẻ Luận Quẻ...' : 'Chạm Để Gieo Quẻ Thơ'}</span>
              </button>
              <p className="text-[10px] text-stone-500 font-serif italic mt-2 text-center">
                Vạn sự tùy duyên • Thơ trích từ thi đàn thực tế
              </p>
            </div>
          </div>
        ) : (
          /* Lá Quẻ Thơ Huyền Diệu */
          <div className="space-y-5 animate-fade-in text-left">
            <div className="bg-[#121110] border border-amber-600/60 rounded-3xl p-6 sm:p-7 space-y-4 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-700/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="text-[11px] font-serif px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/60 font-medium">
                  {drawnResult.omenType}
                </span>
                <span className="text-[11px] text-stone-400 font-serif">
                  {drawnResult.domainLabel}
                </span>
              </div>

              <div>
                <h4 className="text-xl sm:text-2xl font-serif font-bold text-amber-400">
                  {drawnResult.fortuneName}
                </h4>
              </div>

              {/* Khổ thơ trích dẫn */}
              <blockquote className="py-3 px-4 border-l-2 border-amber-500 bg-stone-900/40 rounded-r-xl font-serif italic text-base sm:text-lg text-stone-100 whitespace-pre-line leading-relaxed">
                &ldquo;{drawnResult.verses}&rdquo;
              </blockquote>

              <div className="text-xs text-stone-400 font-serif flex items-center justify-between">
                <span>
                  Trích thi phẩm <strong>{drawnResult.poemTitle}</strong> — {drawnResult.poemAuthor}
                </span>
                <time className="text-[11px]">{drawnResult.drawnAt}</time>
              </div>

              {/* Lời bàn tri kỷ */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-1">
                <span className="text-[11px] font-serif font-bold text-amber-300 block uppercase tracking-wider">
                  Lời Bàn Tri Kỷ:
                </span>
                <p className="text-xs text-stone-300 font-serif leading-relaxed">
                  {drawnResult.interpretation}
                </p>
              </div>
            </div>

            {savedSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 font-serif text-center">
                ✨ Đã lưu lá quẻ này vào Sổ tay của bạn!
              </div>
            )}

            {/* Các hành động tiếp theo */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <Link
                to={`/poems/${drawnResult.poemId}`}
                onClick={onClose}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-600 text-stone-50 text-xs font-serif font-medium text-center transition-colors shadow-2xs"
              >
                Đọc trọn vẹn bài thơ này →
              </Link>

              <button
                type="button"
                onClick={handleSaveToNotebook}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-stone-700 hover:border-amber-600 bg-stone-900 text-stone-200 text-xs font-serif transition-colors cursor-pointer"
              >
                🔖 Lưu quẻ
              </button>

              <button
                type="button"
                onClick={() => setDrawnResult(null)}
                className="w-full sm:w-auto py-2.5 px-3 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-serif cursor-pointer hover:underline"
              >
                Gieo lại
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
