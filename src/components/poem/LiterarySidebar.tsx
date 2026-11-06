import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Poem } from '../../features/poems/poems.types'
import { getCurrentWeeklyChallenge, getTimeRemainingInWeek } from '../../features/weekly-challenges'
import { PoemCard } from './PoemCard'
import { PoeticOracleModal } from './PoeticOracleModal'
import { VermilionSeal } from '../common/VermilionSeal'
import { Compass, Target, Clock, Feather, Sparkles } from 'lucide-react'

interface LiterarySidebarProps {
  popularPoems: Poem[]
  onSelectMood: (mood: string) => void
}

export function LiterarySidebar({ popularPoems, onSelectMood }: LiterarySidebarProps) {
  const [isOracleOpen, setIsOracleOpen] = useState(false)
  const currentChallenge = useMemo(() => getCurrentWeeklyChallenge(), [])
  const timeRemaining = useMemo(() => getTimeRemainingInWeek(), [])

  // Đếm số bài thơ tham gia thử thách tuần này
  const challengePoemsCount = useMemo(() => {
    return popularPoems.filter(
      (p) =>
        p.tags?.includes(currentChallenge.tag) ||
        p.title.toLowerCase().includes(currentChallenge.title.toLowerCase()) ||
        p.mood === currentChallenge.suggestedMood
    ).length
  }, [popularPoems, currentChallenge])

  // Tính toán danh sách tác giả nổi bật thật sự từ các bài thơ trong Database
  const authorsList = useMemo(() => {
    const counts: Record<string, { count: number; mood: string }> = {}
    popularPoems.forEach((p) => {
      const name = p.author?.trim()
      if (name && name !== 'Khuyết danh' && name !== 'Tôi') {
        if (!counts[name]) {
          counts[name] = { count: 0, mood: p.mood || 'Thơ ca' }
        }
        counts[name].count += 1
      }
    })

    return Object.entries(counts)
      .map(([name, data]) => ({
        name,
        poemsCount: data.count,
        tag: data.mood,
      }))
      .sort((a, b) => b.poemsCount - a.poemsCount)
      .slice(0, 5)
  }, [popularPoems])

  return (
    <aside className="space-y-6">
      {/* 1. Gieo Quẻ Thơ Hôm Nay (Poetic Oracle) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 text-stone-100 border border-amber-700/50 space-y-3 shadow-md">
        <div className="flex items-center justify-between text-xs font-serif">
          <span className="font-semibold text-amber-400 uppercase tracking-wider text-[11px] inline-flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Thi Đàn Huyền Cơ</span>
          </span>
          <span className="text-stone-400 text-[11px]">Mỗi ngày 1 quẻ</span>
        </div>
        <h4 className="text-base sm:text-lg font-serif font-bold text-stone-50">
          Gieo Quẻ Thơ Hôm Nay
        </h4>
        <p className="text-xs text-stone-300 font-serif leading-relaxed">
          Rút một thẻ thơ ngẫu nhiên để lắng nghe thông điệp tri âm dành riêng cho tâm cảnh của bạn hôm nay.
        </p>
        <button
          type="button"
          onClick={() => setIsOracleOpen(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-600 text-stone-50 text-xs font-serif font-medium transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rút Quẻ Thơ Ngay</span>
        </button>
      </div>

      {/* 2. Thử thách thơ hàng tuần (Động theo 52 tuần & có đếm ngược) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 space-y-3">
        <div className="flex items-center justify-between text-xs font-serif">
          <span className="font-semibold text-amber-900 dark:text-amber-200 uppercase tracking-wider text-[11px] inline-flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            <span>Thử Thách Tuần {currentChallenge.weekNumber}</span>
          </span>
          <span className="text-[11px] px-2 py-0.2 rounded-full bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-serif">
            Mùa {currentChallenge.season}
          </span>
        </div>

        <h4 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
          &ldquo;{currentChallenge.title}&rdquo;
        </h4>

        <p className="text-xs text-stone-600 dark:text-stone-400 font-serif leading-relaxed italic">
          {currentChallenge.prompt}
        </p>

        <div className="pt-1 flex items-center justify-between text-[11px] text-amber-800/90 dark:text-amber-400 font-serif">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Còn {timeRemaining.days} ngày {timeRemaining.hours} giờ</span>
          </span>
          <span>{challengePoemsCount} bài tham gia</span>
        </div>

        <Link
          to={`/poems/new?challenge=${currentChallenge.tag}`}
          className="w-full mt-1 py-2 px-3 bg-amber-800 hover:bg-amber-900 text-stone-50 rounded-xl text-xs font-serif font-medium text-center transition-colors block shadow-2xs"
        >
          Góp bài vào thử thách này →
        </Link>
      </div>

      {/* 3. Đang được tri âm nhiều nhất */}
      {popularPoems.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white/95 dark:bg-[#1c1a18] border border-stone-200/80 dark:border-stone-800 space-y-3 shadow-2xs">
          <h4 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 border-b border-stone-150 dark:border-stone-800 pb-2.5">
            Được Tri Âm Nhiều Nhất
          </h4>
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {popularPoems.slice(0, 4).map((p) => (
              <PoemCard key={p.id} poem={p} variant="compact" />
            ))}
          </div>
        </div>
      )}

      {/* 4. Tác giả & Thi sĩ nổi bật (Dữ liệu thật 100% từ Database) */}
      {authorsList.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white/95 dark:bg-[#1c1a18] border border-stone-200/80 dark:border-stone-800 space-y-4 shadow-2xs">
          <h4 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 border-b border-stone-150 dark:border-stone-800 pb-2.5">
            Tác Giả Nổi Bật
          </h4>
          <div className="space-y-3">
            {authorsList.map((author) => (
              <div
                key={author.name}
                className="flex items-center justify-between text-xs font-serif"
              >
                <div className="flex items-center gap-2">
                  <VermilionSeal text={author.name} size="xs" />
                  <div>
                    <Link
                      to={`/authors/${encodeURIComponent(author.name)}`}
                      className="font-semibold text-stone-900 dark:text-stone-100 block hover:text-amber-800 dark:hover:text-amber-400 hover:underline"
                    >
                      {author.name}
                    </Link>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      {author.poemsCount} thi phẩm
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectMood(author.tag)}
                  className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 px-2.5 py-0.5 rounded-full hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  #{author.tag}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Gieo Quẻ Thơ */}
      <PoeticOracleModal
        isOpen={isOracleOpen}
        onClose={() => setIsOracleOpen(false)}
      />
    </aside>
  )
}
