import { useState } from 'react'
import { useOnlinePresence } from '../../features/presence'
import { PoeticLoungeModal } from './PoeticLoungeModal'

export function OnlinePoetsDock() {
  const { count } = useOnlinePresence()
  const [isLoungeOpen, setIsLoungeOpen] = useState(false)

  return (
    <>
      {/* Nút dock nổi góc dưới bên phải */}
      <aside aria-label="Trà Thất Đàm Đạo" className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setIsLoungeOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-stone-900/95 dark:bg-[#1c1a18]/95 border border-amber-600/60 text-stone-100 shadow-xl hover:scale-105 hover:border-amber-400 transition-all cursor-pointer backdrop-blur-md ring-1 ring-amber-500/20"
        >
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

