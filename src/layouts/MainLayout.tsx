import { Outlet } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { AmbientCanvasBackdrop } from '../components/common/AmbientCanvasBackdrop'
import { OnlinePoetsDock } from '../components/presence/OnlinePoetsDock'
import { useReading } from '../features/reading'

export function MainLayout() {
  const { isFocusMode, setIsFocusMode } = useReading()

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      {/* Header chỉ hiển thị khi không ở chế độ tĩnh lặng */}
      {!isFocusMode && <Header />}

      {/* Floating exit button khi bật chế độ đọc tĩnh lặng */}
      {isFocusMode && (
        <aside className="fixed top-5 right-5 z-50 animate-in fade-in duration-300">
          <button
            type="button"
            onClick={() => setIsFocusMode(false)}
            aria-label="Thoát chế độ đọc tĩnh lặng"
            className="px-4 py-2 text-xs font-serif rounded-full bg-stone-900/90 hover:bg-stone-900 text-stone-100 backdrop-blur-md border border-stone-700/60 shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <span>✕</span>
            <span>Thoát chế độ tĩnh lặng</span>
          </button>
        </aside>
      )}

      <main
        className={`flex-1 w-full mx-auto transition-all duration-300 ${
          isFocusMode
            ? 'py-12 max-w-2xl px-4'
            : 'py-6 sm:py-10 max-w-7xl px-4 sm:px-8'
        }`}
      >
        <Outlet />
      </main>

      {/* Footer chỉ hiển thị khi không ở chế độ tĩnh lặng */}
      {!isFocusMode && <Footer />}

      {/* Hiệu ứng không gian thơ lay động tĩnh lặng (Lá rơi / Mưa bay) */}
      <AmbientCanvasBackdrop />

      {/* Nút dock trực tuyến & Trà Thất Đàm Đạo */}
      {!isFocusMode && <OnlinePoetsDock />}
    </div>
  )
}
