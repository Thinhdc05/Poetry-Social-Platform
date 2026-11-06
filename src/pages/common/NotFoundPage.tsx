import { Link } from 'react-router-dom'
import { VermilionSeal } from '../../components/common'
import { Home, ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white/90 dark:bg-[#1c1a18] border border-stone-200/90 dark:border-stone-800 p-8 sm:p-12 rounded-2xl shadow-sm">
        <div className="flex justify-center">
          <VermilionSeal text="Lạc" size="xl" shape="square" title="Lạc bước" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-sans uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold">
            404 • Lạc Lối Thi Đàn
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Lối Xưa Mờ Ngõ Trúc
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-stone-500 dark:text-stone-400 leading-relaxed">
            &ldquo;Hạc vàng một khi bay đi khuất,<br />
            Nghìn năm mây trắng vẫn bay hoài.&rdquo;
          </p>
          <p className="text-xs text-stone-600 dark:text-stone-400 font-serif pt-2">
            Trang sách bạn tìm kiếm có thể đã được dời đi, ẩn kín hoặc chưa từng được chép vào thi đàn.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-serif flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>

          <Link
            to="/"
            className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-700 text-stone-50 text-xs font-serif font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

