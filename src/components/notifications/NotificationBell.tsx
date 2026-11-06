import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, MessageCircle, Heart, ShieldAlert } from 'lucide-react'
import { useNotifications, type NotificationItem } from '../../features/notifications'

export function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Đóng dropdown khi bấm ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id)
    setIsOpen(false)
    if (item.poemId) {
      navigate(`/poems/${item.poemId}`)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút Chuông */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Thông báo hoạt động thi hữu"
        className="relative h-8 w-8 rounded-lg flex items-center justify-center border border-stone-300/80 dark:border-stone-700 hover:bg-stone-200/50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <Bell className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />

        {/* Huy hiệu nảy số chưa đọc */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-4.5 px-1 rounded-full bg-rose-600 text-white font-sans text-[10px] font-bold shadow-sm animate-pulse ring-2 ring-stone-50 dark:ring-stone-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Menu Thả Xuống Danh Sách Thông Báo */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#1a1816] border border-stone-200 dark:border-stone-800 shadow-2xl z-50 overflow-hidden ring-1 ring-stone-900/10 font-serif animate-fade-in">
          {/* Header Panel */}
          <div className="px-4 py-3 bg-stone-50/80 dark:bg-stone-900/80 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🏮</span>
              <h3 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                Thư Báo Thi Quán
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-sans font-medium">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Đã đọc hết</span>
              </button>
            )}
          </div>

          {/* Body Panel */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/60">
            {loading ? (
              <div className="p-6 text-center text-xs text-stone-400">
                Đang mở phong thư...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <span className="text-3xl block">📜</span>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Chưa có phong thư báo mới nào.
                </p>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 italic max-w-xs mx-auto">
                  Khi các thi hữu bình luận hoặc cảm tác trên bài thơ của bạn, lời nhắn sẽ gửi về đây.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3 sm:p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-left ${
                    item.isRead
                      ? 'bg-transparent hover:bg-stone-50 dark:hover:bg-stone-900/40 text-stone-600 dark:text-stone-400'
                      : 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 text-stone-900 dark:text-stone-100'
                  }`}
                >
                  {/* Icon loại thông báo */}
                  <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center shrink-0 text-sm mt-0.5 shadow-2xs">
                    {item.type === 'comment' ? (
                      <MessageCircle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    ) : item.type === 'like' ? (
                      <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400 fill-rose-600 dark:fill-rose-400" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                    )}
                  </div>

                  {/* Nội dung thông báo */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs leading-relaxed">
                      <strong className="text-stone-900 dark:text-stone-100 font-semibold mr-1">
                        {item.actorName}
                      </strong>
                      <span className="text-stone-600 dark:text-stone-300">
                        {item.message}
                      </span>
                      {item.poemTitle && (
                        <span className="block font-medium text-amber-800 dark:text-amber-400 truncate mt-0.5">
                          &ldquo;{item.poemTitle}&rdquo;
                        </span>
                      )}
                    </p>
                    <span className="text-[10px] text-stone-400 block">
                      {item.createdAt}
                    </span>
                  </div>

                  {/* Chấm tròn chưa đọc */}
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
