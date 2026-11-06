import { useState } from 'react'
import { Heart, Feather, Coffee } from 'lucide-react'
import { usePoemReactions, type ReactionType } from '../../features/reactions'

export interface ReactionButtonsProps {
  poemId: string
  initialLikesCount?: number
  onReact?: (type: ReactionType) => void
}

export function ReactionButtons({
  poemId,
  initialLikesCount = 0,
  onReact,
}: ReactionButtonsProps) {
  const { counts, userReaction, react, loading } = usePoemReactions(poemId, initialLikesCount)
  const [notice, setNotice] = useState<string | null>(null)

  const handleClick = async (type: ReactionType) => {
    setNotice(null)
    const result = await react(type)
    if (result.requireLogin) {
      setNotice('Xin thi hữu đăng nhập để gửi lời tri âm đến tác giả!')
      setTimeout(() => setNotice(null), 3500)
      return
    }
    onReact?.(type)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
        {/* Nút 1: Yêu thích (Heart) */}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleClick('heart')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer border ${
            userReaction === 'heart'
              ? 'bg-rose-100 border-rose-400 text-rose-900 dark:bg-rose-950/80 dark:border-rose-600 dark:text-rose-100 shadow-2xs font-bold ring-2 ring-rose-300/40'
              : 'bg-white/90 dark:bg-[#23201d] border-stone-200/90 dark:border-stone-700/80 text-stone-700 dark:text-stone-200 hover:border-rose-400 hover:text-rose-700 dark:hover:text-rose-300'
          }`}
          title={userReaction === 'heart' ? 'Bấm để hủy yêu thích' : 'Bày tỏ yêu thích bài thơ'}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform ${
              userReaction === 'heart' ? 'fill-rose-700 text-rose-700 scale-110' : 'text-stone-400'
            }`}
          />
          <span>Yêu thích</span>
          <span className="text-[11px] font-sans opacity-90 font-medium">({counts.heart})</span>
        </button>

        {/* Nút 2: Chạm (Feather) */}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleClick('touch')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer border ${
            userReaction === 'touch'
              ? 'bg-amber-100 border-amber-400 text-amber-950 dark:bg-amber-950/80 dark:border-amber-600 dark:text-amber-100 shadow-2xs font-bold ring-2 ring-amber-300/40'
              : 'bg-white/90 dark:bg-[#23201d] border-stone-200/90 dark:border-stone-700/80 text-stone-700 dark:text-stone-200 hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-300'
          }`}
          title={userReaction === 'touch' ? 'Bấm để hủy cảm xúc chạm' : 'Bài thơ chạm đến tâm can'}
        >
          <Feather
            className={`w-3.5 h-3.5 transition-transform ${
              userReaction === 'touch' ? 'text-amber-800 scale-110' : 'text-stone-400'
            }`}
          />
          <span>Chạm</span>
          <span className="text-[11px] font-sans opacity-90 font-medium">({counts.touch})</span>
        </button>

        {/* Nút 3: Đồng cảm (Coffee) */}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleClick('sympathy')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer border ${
            userReaction === 'sympathy'
              ? 'bg-emerald-100 border-emerald-400 text-emerald-950 dark:bg-emerald-950/80 dark:border-emerald-600 dark:text-emerald-100 shadow-2xs font-bold ring-2 ring-emerald-300/40'
              : 'bg-white/90 dark:bg-[#23201d] border-stone-200/90 dark:border-stone-700/80 text-stone-700 dark:text-stone-200 hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300'
          }`}
          title={userReaction === 'sympathy' ? 'Bấm để hủy đồng cảm' : 'Tìm thấy tiếng lòng đồng điệu'}
        >
          <Coffee
            className={`w-3.5 h-3.5 transition-transform ${
              userReaction === 'sympathy' ? 'text-emerald-800 scale-110' : 'text-stone-400'
            }`}
          />
          <span>Đồng cảm</span>
          <span className="text-[11px] font-sans opacity-90 font-medium">({counts.sympathy})</span>
        </button>
      </div>

      {notice && (
        <span className="text-xs font-serif text-amber-800 dark:text-amber-300 animate-fade-in italic">
          💡 {notice}
        </span>
      )}
    </div>
  )
}
