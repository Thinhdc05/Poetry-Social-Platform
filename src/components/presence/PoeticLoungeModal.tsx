import { useState, useRef, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth'
import { usePoeticLounge, useOnlinePresence } from '../../features/presence'
import { MessageCircle, Feather, Send, Users, X, Lock } from 'lucide-react'

interface PoeticLoungeModalProps {
  isOpen: boolean
  onClose: () => void
}

const QUICK_GREETINGS = [
  'Kính chào chư vị thi hữu! 🍵',
  'Đêm nay trăng sáng, xin góp một vần thơ. 🌙',
  'Có ai đang ngâm thơ mùa thu chăng? 🍂',
  'Một nén hương trầm, một tách trà thơm. ✨',
]

export function PoeticLoungeModal({ isOpen, onClose }: PoeticLoungeModalProps) {
  const { user } = useAuth()
  const { messages, loading, sendMessage } = usePoeticLounge()
  const { onlinePoets, count } = useOnlinePresence()
  const [inputText, setInputText] = useState('')
  const [msgType, setMsgType] = useState<'chat' | 'verse'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 60)
      return () => clearTimeout(timer)
    }
  }, [isOpen, messages.length])

  if (!isOpen) return null

  const handleSend = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputText.trim()) return
    sendMessage(inputText, msgType)
    setInputText('')
  }

  const handleQuickSend = (text: string) => {
    sendMessage(text, 'chat')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs animate-fade-in font-serif">
      <div className="relative w-full max-w-lg h-[82vh] max-h-[680px] bg-[#171513] text-stone-100 border border-amber-800/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-amber-500/20">
        {/* Header Chiếu Thơ */}
        <header className="p-4 sm:p-5 border-b border-stone-800/90 bg-[#141210] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏮</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-stone-100">
                  Trà Thất Đàm Đạo
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{count} thi hữu</span>
                </span>
              </div>
              <p className="text-[11px] text-stone-400 italic">
                Chiếu thơ trực tiếp — Nơi bạn thơ bốn phương đối ẩm, sẻ chia cảm hứng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Thanh thi hữu trực tuyến dạng avatar thu nhỏ */}
        <div className="px-4 py-2 border-b border-stone-800/70 bg-stone-900/40 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[10px] uppercase text-amber-400/90 font-semibold tracking-wider shrink-0 flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Đang đối ẩm:</span>
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {onlinePoets.slice(0, 8).map((poet) => (
              <div
                key={poet.id}
                title={`${poet.penName} — ${poet.status}`}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-xs shrink-0"
              >
                <span>{poet.seal}</span>
                <span className="text-[11px] text-stone-300 max-w-[90px] truncate">
                  {poet.penName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dòng chảy lời đàm đạo (Message feed) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-stone-950/40">
          {loading ? (
            <div className="h-full min-h-[220px] flex items-center justify-center text-xs italic text-stone-500">
              Đang mở cửa trà thất và tải lời đàm đạo...
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 space-y-2">
              <span className="text-3xl">🍵</span>
              <p className="text-sm font-bold text-stone-300">
                Trà thất vừa pha xong ấm trà mới
              </p>
              <p className="text-xs text-stone-400 italic max-w-xs leading-relaxed">
                Chưa có lời đối ẩm nào. Hãy là người đầu tiên đặt bút khai bút đàm đạo!
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  msg.type === 'verse'
                    ? 'bg-amber-950/40 border-amber-800/60 text-amber-100 shadow-2xs'
                    : 'bg-stone-900/80 border-stone-800/80 text-stone-200'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1 border-b border-stone-800/50 pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{msg.senderSeal}</span>
                    <span className="font-bold text-stone-200">{msg.senderName}</span>
                    {msg.type === 'verse' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-900/60 text-amber-300 border border-amber-800/70 uppercase">
                        Vần thơ
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-500">{msg.createdAt}</span>
                </div>
                <div
                  className={`text-xs leading-relaxed ${
                    msg.type === 'verse' ? 'italic whitespace-pre-line pl-2 border-l border-amber-700/60' : ''
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Lời chúc nhanh */}
        {user && (
          <div className="px-4 py-2 bg-stone-900/60 border-t border-stone-800/80 flex items-center gap-1.5 overflow-x-auto shrink-0">
            <span className="text-[10px] text-stone-400 shrink-0">Gửi nhanh:</span>
            {QUICK_GREETINGS.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => handleQuickSend(text)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-200 border border-stone-700 whitespace-nowrap cursor-pointer transition-colors"
              >
                {text}
              </button>
            ))}
          </div>
        )}

        {/* Khung nhập lời đàm đạo hoặc Khóa dành cho khách */}
        {!user ? (
          <div className="p-4 bg-[#141210] border-t border-stone-800 text-center space-y-2 shrink-0">
            <p className="text-xs text-stone-400">
              Bạn cần gia nhập thi đàn để cùng các thi hữu đàm đạo và gieo vần thơ vào Trà Thất.
            </p>
            <div className="flex items-center justify-center gap-3 pt-1">
              <Link
                to="/login"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-stone-100 text-xs font-medium transition-colors inline-flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>Đăng nhập tham gia</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-3 sm:p-4 bg-[#141210] border-t border-stone-800 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-[11px] text-stone-400">
              <span>Chế độ gửi:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMsgType('chat')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer flex items-center gap-1 ${
                    msgType === 'chat'
                      ? 'bg-amber-800 text-stone-100 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>Đàm đạo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMsgType('verse')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer flex items-center gap-1 ${
                    msgType === 'verse'
                      ? 'bg-amber-800 text-stone-100 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Feather className="w-3 h-3" />
                  <span>Gieo vần thơ</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={500}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  msgType === 'verse'
                    ? 'Gieo đôi câu thơ đối ẩm...'
                    : 'Gửi lời đàm đạo cùng bạn thơ...'
                }
                className="flex-1 px-4 py-2 text-xs bg-stone-900 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-amber-700"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-stone-50 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Gửi</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
