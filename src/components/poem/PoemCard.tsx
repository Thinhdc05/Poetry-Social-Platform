import { Link } from 'react-router-dom'
import type { Poem } from '../../features/poems/poems.types'
import { useBookmarks } from '../../features/bookmarks'
import { getResponsesByPoemId } from '../../features/poetic-duels'
import { VermilionSeal } from '../common/VermilionSeal'
import { Bookmark, Heart, ScrollText, Feather, ArrowRight } from 'lucide-react'

interface PoemCardProps {
  poem: Poem
  variant?: 'featured' | 'standard' | 'compact'
}

const MOOD_STYLES: Record<string, { badge: string; accentBorder: string }> = {
  'Mùa thu': {
    badge: 'bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800',
    accentBorder: 'hover:border-amber-600/70 dark:hover:border-amber-500/70',
  },
  'Mưa rơi': {
    badge: 'bg-slate-100/90 text-slate-800 border-slate-300 dark:bg-slate-900/80 dark:text-slate-200 dark:border-slate-700',
    accentBorder: 'hover:border-slate-500/70 dark:hover:border-slate-400/70',
  },
  'Nỗi nhớ': {
    badge: 'bg-indigo-100/90 text-indigo-900 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-200 dark:border-indigo-800',
    accentBorder: 'hover:border-indigo-500/70 dark:hover:border-indigo-400/70',
  },
  'Tình yêu': {
    badge: 'bg-rose-100/90 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-800',
    accentBorder: 'hover:border-rose-500/70 dark:hover:border-rose-400/70',
  },
  'Tĩnh lặng': {
    badge: 'bg-emerald-100/90 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-800',
    accentBorder: 'hover:border-emerald-600/70 dark:hover:border-emerald-500/70',
  },
  'Hoài niệm': {
    badge: 'bg-stone-200/90 text-stone-900 border-stone-300 dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700',
    accentBorder: 'hover:border-amber-700/70 dark:hover:border-amber-500/70',
  },
}

export function PoemCard({ poem, variant = 'standard' }: PoemCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const saved = isBookmarked(poem.id)
  const responsesCount = getResponsesByPoemId(poem.id).length

  const moodStyle = (poem.mood && MOOD_STYLES[poem.mood]) || {
    badge: 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300',
    accentBorder: 'hover:border-amber-700/60 dark:hover:border-amber-500/60',
  }

  if (variant === 'compact') {
    return (
      <article className="group py-3 border-b border-stone-200/70 dark:border-stone-800 last:border-b-0">
        <div className="flex items-baseline justify-between gap-2">
          <Link
            to={`/poems/${poem.id}`}
            className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors line-clamp-1"
          >
            {poem.title}
          </Link>
          <Link
            to={`/authors/${encodeURIComponent(poem.author)}`}
            className="text-[11px] text-stone-500 dark:text-stone-400 hover:text-amber-800 dark:hover:text-amber-300 shrink-0 font-serif hover:underline flex items-center gap-1"
          >
            <VermilionSeal text={poem.author} size="xs" />
            <span>{poem.author}</span>
          </Link>
        </div>
        {poem.excerpt && (
          <Link to={`/poems/${poem.id}`} className="block">
            <p className="text-xs text-stone-600 dark:text-stone-300 font-serif italic line-clamp-1 mt-1">
              &ldquo;{poem.excerpt.split('\n')[0]}&rdquo;
            </p>
          </Link>
        )}
      </article>
    )
  }

  return (
    <article
      className={`group relative bg-white/95 dark:bg-[#1c1a18] backdrop-blur-xs border border-stone-200/90 dark:border-stone-800 rounded-xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${moodStyle.accentBorder}`}
    >
      {/* Nút lưu sổ tay nhanh */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          toggleBookmark(poem.id)
        }}
        title={saved ? 'Bỏ lưu khỏi Sổ tay' : 'Lưu bài thơ vào Sổ tay'}
        className={`absolute top-5 right-5 z-10 w-8 h-8 rounded-full flex items-center justify-center border transition-colors cursor-pointer text-xs ${
          saved
            ? 'bg-amber-800 text-stone-50 border-amber-800 dark:bg-amber-700'
            : 'bg-stone-100/90 dark:bg-stone-800/90 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:text-amber-800 dark:hover:text-amber-300'
        }`}
      >
        <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
      </button>

      {/* Header thẻ thơ & Tiêu đề bài thơ */}
      <div className="flex items-start justify-between gap-3 mb-2 pr-9">
        <Link to={`/poems/${poem.id}`} className="block group/title">
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 dark:text-stone-50 group-hover/title:text-amber-800 dark:group-hover/title:text-amber-400 transition-colors tracking-tight">
            {poem.title}
          </h3>
        </Link>
      </div>

      {/* Thông tin tác giả & ngày tháng */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-serif mb-4">
        <VermilionSeal text={poem.author} size="xs" />

        {poem.authorType === 'collected' ? (
          <>
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-sans">
              <ScrollText className="w-2.5 h-2.5 text-amber-500" />
              <span>Sưu tầm</span>
            </span>
            <span>Tác giả:</span>
            <Link
              to={`/authors/${encodeURIComponent(poem.author)}`}
              className="font-medium text-stone-800 dark:text-stone-200 hover:text-amber-800 dark:hover:text-amber-400 hover:underline"
            >
              {poem.author}
            </Link>
            {poem.curatorName && (
              <span className="text-[11px] text-stone-400 dark:text-stone-500 font-sans">
                • chép bởi @{poem.curatorName}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 font-sans">
              <Feather className="w-2.5 h-2.5" />
              <span>Sáng tác</span>
            </span>
            <Link
              to={`/authors/${encodeURIComponent(poem.author)}`}
              className="font-medium text-stone-800 dark:text-stone-200 hover:text-amber-800 dark:hover:text-amber-400 hover:underline"
            >
              {poem.author}
            </Link>
          </>
        )}
        <span>•</span>
        <time>{poem.createdAt}</time>
        {poem.mood && (
          <span
            className={`text-[10px] font-serif px-2 py-0.2 rounded-full border whitespace-nowrap ${moodStyle.badge}`}
          >
            {poem.mood}
          </span>
        )}
      </div>

      {/* Trích đoạn 4 câu thơ */}
      {poem.excerpt && (
        <Link to={`/poems/${poem.id}`} className="block group/excerpt">
          <div className="my-4 pl-4 border-l-2 border-amber-800/50 dark:border-amber-600/60 py-1 transition-colors group-hover/excerpt:border-amber-800">
            <p className="text-stone-700 dark:text-stone-200 font-serif text-sm sm:text-base leading-relaxed whitespace-pre-line italic">
              {poem.excerpt}
            </p>
          </div>
        </Link>
      )}

      {/* Footer thẻ: Tags, Số bài họa & Lượt yêu thích */}
      <div className="mt-5 pt-3.5 border-t border-stone-150 dark:border-stone-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {responsesCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-900 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/70 border border-amber-300/60 dark:border-amber-800/60 px-2 py-0.5 rounded-md font-serif font-medium">
              <Feather className="w-3 h-3" />
              <span>{responsesCount} bài họa</span>
            </span>
          )}
          {poem.tags?.slice(0, 1).map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md font-serif"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 text-stone-500 dark:text-stone-400 font-serif">
          {poem.likesCount !== undefined && poem.likesCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
              <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
              <span>{poem.likesCount}</span>
            </span>
          )}
          <Link
            to={`/poems/${poem.id}`}
            className="text-amber-800 dark:text-amber-400 font-medium hover:translate-x-1 transition-transform inline-flex items-center gap-1"
          >
            <span>Đọc & Họa</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </article>
  )
}
