import { useState, useEffect } from 'react'
import { useOnlinePresence, useLoungeUnread } from '../../features/presence'
import { PoeticLoungeModal } from './PoeticLoungeModal'

export function OnlinePoetsDock() {
  const { count } = useOnlinePresence()
  const [isLoungeOpen, setIsLoungeOpen] = useState(false)
  const { unreadCount, latestToast, clearToast } = useLoungeUnread(isLoungeOpen)

  // Tự động đóng toast sau 6 giây nếu người dùng không bấm
  useEffect(() => {
    if (!latestToast) return
    const timer = setTimeout(() => {
      clearToast()
    }, 6000)
    return () => clearTimeout(timer)
  }, [latestToast, clearToast])

  const handleOpenLounge = () => {
    setIsLoungeOpen(true)
    clearToast()
  }

  return (
    <>
      {/* Nút dock nổi góc dưới bên phải */}
      <aside aria-label="Trà Thất Đàm Đạo" className="fixed bottom-5 right-5 z-40">
        {/* Toast thông báo tin nhắn mới bay lên khi dock đang đóng */}
        {latestToast && !isLoungeOpen && (
          <div
            role="alert"
            className="absolute bottom-16 right-0 w-72 sm:w-80 p-3.5 rounded-2xl bg-[#1c1917]/95 border border-amber-600/70 text-stone-100 shadow-2xl backdrop-blur-md transition-all animate-fade-in ring-1 ring-amber-500/30 font-serif"
          >
            <div className="flex items-center justify-between text-[11px] text-amber-300 mb-1">
              <div className="flex items-center gap-1.5 font-bold">
                <span>{latestToast.senderSeal}</span>
                <span className="text-stone-100">{latestToast.senderName}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  clearToast()
                }}
                className="text-stone-400 hover:text-stone-200 text-xs px-1 cursor-pointer transition-colors"
                title="Đóng thông báo"
              >
                ✕
              </button>
            </div>
            <p
              onClick={handleOpenLounge}
              className="text-xs text-stone-200 line-clamp-2 italic cursor-pointer hover:text-amber-200 transition-colors"
            >
              &ldquo;{latestToast.content}&rdquo;
            </p>
            <div
              onClick={handleOpenLounge}
              className="mt-2 pt-1 border-t border-stone-800/80 text-[10px] text-amber-400/90 flex items-center justify-between cursor-pointer"
            >
              <span className="text-stone-400">Vừa gửi vào Trà Thất</span>
              <span className="font-bold underline hover:text-amber-300">Vào đối ẩm →</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleOpenLounge}
          className="relative group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-stone-900/95 dark:bg-[#1c1a18]/95 border border-amber-600/60 text-stone-100 shadow-xl hover:scale-105 hover:border-amber-400 transition-all cursor-pointer backdrop-blur-md ring-1 ring-amber-500/20"
        >
          {/* Huy hiệu số tin chưa đọc */}
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-600 text-white font-sans text-[11px] font-bold shadow-lg animate-bounce ring-2 ring-stone-900">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}

          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>

          <span className="text-base">🏮</span>

          <div className="flex flex-col text-left">
            <span className="text-xs font-serif font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
              Trà Thất Đàm Đạo
            </span>
            <span className="text-[10px] text-stone-400 font-serif leading-none">
              {count} thi hữu đang đối ẩm
            </span>
          </div>
        </button>
      </aside>

      {/* Cửa sổ diễn đàn đàm đạo trực tiếp */}
      <PoeticLoungeModal isOpen={isLoungeOpen} onClose={() => setIsLoungeOpen(false)} />
    </>
  )
}

