import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Tag, X } from 'lucide-react'
import { usePoems, getDailyFeaturedPoem } from '../../features/poems'
import { useAuth } from '../../features/auth'
import { useReading } from '../../features/reading'
import { useBookmarks } from '../../features/bookmarks'
import { getAllResponsesCountByPoem } from '../../features/poetic-duels'
import { getCurrentWeeklyChallenge, getTimeRemainingInWeek } from '../../features/weekly-challenges'
import { PoemCard } from '../../components/poem/PoemCard'
import { HeroPoemStage } from '../../components/poem/HeroPoemStage'
import { LiterarySidebar } from '../../components/poem/LiterarySidebar'
import { MoodChips } from '../../components/reading/MoodChips'
import { Pagination } from '../../components/common'

type FeedTab = 'all' | 'challenges' | 'trending' | 'duels' | 'saved'

const PAGE_SIZE = 6 // Mỗi trang hiển thị 6 bài thơ (3 hàng x 2 cột chuẩn desktop)

export function HomePage() {
  const { poems, loading, error, refetch } = usePoems()
  const { user } = useAuth()
  const { activeMood, setActiveMood } = useReading()
  const { bookmarkedIds } = useBookmarks()

  const [searchQuery, setSearchQuery] = useState('')
  const [feedTab, setFeedTab] = useState<FeedTab>('all')
  const [shuffleSeed, setShuffleSeed] = useState<number | undefined>(undefined)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const currentChallenge = useMemo(() => getCurrentWeeklyChallenge(), [])
  const timeRemaining = useMemo(() => getTimeRemainingInWeek(), [])

  // Quét và tổng hợp các thẻ thơ động từ kho bài thơ hiện tại (Dynamic Aggregated Tags)
  const popularTags = useMemo(() => {
    const tagCount = new Map<string, number>()
    poems.forEach((p) => {
      p.tags?.forEach((t) => {
        const clean = t.trim()
        if (clean && clean !== 'Tất cả' && clean !== p.mood) {
          tagCount.set(clean, (tagCount.get(clean) || 0) + 1)
        }
      })
    })
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // Top 10 thẻ phổ biến nhất
  }, [poems])

  // Tự động chuyển về trang 1 khi người dùng đổi bất kỳ tiêu chí lọc nào
  useEffect(() => {
    setCurrentPage(1)
  }, [feedTab, activeMood, searchQuery, selectedTag])

  // Thuật toán chọn Bài Thơ Của Ngày (Poem of the Day) + Hỗ trợ Đổi Bài Thơ
  const featuredPoem = useMemo(() => {
    return getDailyFeaturedPoem(poems, shuffleSeed)
  }, [poems, shuffleSeed])

  const popularPoems = useMemo(() => {
    return [...poems].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
  }, [poems])

  const filteredPoems = useMemo(() => {
    const responseCounts = getAllResponsesCountByPoem()
    let hiddenIds: string[] = []
    try {
      hiddenIds = JSON.parse(localStorage.getItem('tho_moc_hidden_poem_ids') || '[]')
    } catch {
      hiddenIds = []
    }

    let list = poems.filter((p) => !hiddenIds.includes(p.id) || feedTab === 'saved')

    // 1. Lọc theo tab Thi đàn
    if (feedTab === 'challenges') {
      list = list.filter(
        (p) =>
          p.tags?.includes(currentChallenge.tag) ||
          p.title.toLowerCase().includes(currentChallenge.title.toLowerCase()) ||
          p.mood === currentChallenge.suggestedMood
      )
    } else if (feedTab === 'trending') {
      list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
    } else if (feedTab === 'duels') {
      list = list.filter((p) => (responseCounts[p.id] || 0) > 0)
    } else if (feedTab === 'saved') {
      list = list.filter((p) => bookmarkedIds.includes(p.id))
    }

    // 2. Lọc theo tâm trạng
    if (activeMood !== 'Tất cả') {
      list = list.filter(
        (p) =>
          p.mood === activeMood ||
          p.tags?.some((t) => t.toLowerCase().includes(activeMood.toLowerCase()))
      )
    }

    // 3. Lọc theo thẻ thơ động (nếu thi nhân chọn một thẻ cụ thể)
    if (selectedTag) {
      list = list.filter((p) =>
        p.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
      )
    }

    // 4. Tìm kiếm tức thì theo tiêu đề, tác giả hoặc câu thơ
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q)
      )
    }

    return list
  }, [poems, feedTab, activeMood, selectedTag, searchQuery, bookmarkedIds, currentChallenge])

  // Tính toán dữ liệu phân trang thông minh
  const totalPages = Math.ceil(filteredPoems.length / PAGE_SIZE) || 1

  const paginatedPoems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredPoems.slice(start, start + PAGE_SIZE)
  }, [filteredPoems, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    const el = document.getElementById('poem-feed-header')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleShuffleHero = () => {
    setShuffleSeed((prev) => (prev ?? Date.now()) + 1)
  }

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* 1. Tấm Màn Mực Đêm — Hero Showcase (Poem of the Day + Live Shuffle) */}
      {featuredPoem && activeMood === 'Tất cả' && !searchQuery && feedTab === 'all' && (
        <HeroPoemStage poem={featuredPoem} onShuffle={handleShuffleHero} />
      )}

      {/* 2. Thanh tìm kiếm tức thì & Lọc tâm trạng */}
      <section className="space-y-4 border-b border-stone-200/80 dark:border-stone-800 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Ô tìm kiếm thơ tức thì */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên bài thơ, thi sĩ, hoặc một câu thơ bất kỳ..."
              className="w-full pl-9 pr-8 py-2 text-xs font-serif bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-700 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Các sảnh / tab Thi đàn */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'challenges', label: `Thử Thách Tuần ${currentChallenge.weekNumber}` },
              { id: 'trending', label: 'Thịnh hành' },
              { id: 'duels', label: 'Sảnh Xướng – Họa' },
              { id: 'saved', label: `Đã lưu (${bookmarkedIds.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFeedTab(tab.id as FeedTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-serif font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  feedTab === tab.id
                    ? 'bg-stone-900 text-stone-50 dark:bg-amber-700'
                    : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <MoodChips activeMood={activeMood} onSelectMood={setActiveMood} />

          {user && (
            <Link
              to="/poems/new"
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-serif font-medium bg-amber-800 hover:bg-amber-900 text-stone-50 rounded-xl transition-all shadow-2xs self-start sm:self-auto"
            >
              <span>Góp vần thơ mới</span>
            </Link>
          )}
        </div>

        {/* Thanh chủ đề / Thẻ thơ động (Dynamic Popular Tags) */}
        {popularTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-stone-150/70 dark:border-stone-800/60">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-serif italic shrink-0 pr-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-amber-800 dark:text-amber-400" />
              <span>Chủ đề nổi bật:</span>
            </span>

            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-serif bg-amber-900/15 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-800/30 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors cursor-pointer"
                title="Bỏ lọc thẻ này"
              >
                <span>#{selectedTag}</span>
                <X className="w-3 h-3" />
              </button>
            )}

            {popularTags.map(([tag, count]) => {
              const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase()
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-serif transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-800 text-stone-50 border-amber-800 shadow-2xs font-medium'
                      : 'bg-white/70 dark:bg-stone-850/70 border-stone-200/90 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-amber-700 hover:text-amber-800'
                  }`}
                >
                  <span>#{tag}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* 3. Bố cục rộng 2 cột (Main stream + Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
        {/* Cột chính: Danh sách bài thơ (8 cột) */}
        <section className="lg:col-span-8 space-y-6">
          {/* Banner đặc biệt khi chọn tab Thử thách tuần */}
          {feedTab === 'challenges' && (
            <div className="p-6 rounded-2xl bg-amber-900/15 dark:bg-amber-950/30 border border-amber-800/40 space-y-3 relative overflow-hidden shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-serif uppercase tracking-widest text-amber-800 dark:text-amber-300 font-bold">
                  Chủ Đề Văn Đàn Tuần {currentChallenge.weekNumber} • Mùa {currentChallenge.season}
                </span>
                <span className="text-xs font-serif text-stone-500 dark:text-stone-400">
                  Hạn chót: Còn {timeRemaining.days} ngày {timeRemaining.hours} giờ
                </span>
              </div>

              <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50">
                &ldquo;{currentChallenge.title}&rdquo;
              </h3>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-serif leading-relaxed italic">
                {currentChallenge.prompt}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-serif text-amber-800 dark:text-amber-400 font-medium">
                  Tâm trạng gợi ý: #{currentChallenge.suggestedMood}
                </span>

                <Link
                  to={`/poems/new?challenge=${currentChallenge.tag}`}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-stone-50 rounded-xl text-xs font-serif font-medium transition-colors shadow-2xs"
                >
                  Tham gia thử thách ngay →
                </Link>
              </div>
            </div>
          )}

          <div
            id="poem-feed-header"
            className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-serif pb-2 border-b border-stone-150 dark:border-stone-800/80"
          >
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {feedTab === 'challenges'
                ? `🎯 Các Bài Thơ Tham Gia Thử Thách "${currentChallenge.title}"`
                : feedTab === 'duels'
                ? '⚔️ Sảnh Xướng – Họa (Các thi phẩm đang đối đáp sôi nổi)'
                : feedTab === 'trending'
                ? '🔥 Bảng Xếp Hạng Thi Phẩm Được Yêu Thích'
                : feedTab === 'saved'
                ? '🔖 Sổ Tay Thi Phẩm Bạn Đã Lưu'
                : selectedTag
                ? `Thơ theo chủ đề: #${selectedTag}`
                : activeMood === 'Tất cả'
                ? 'Tuyển Tập Thi Phẩm Mới'
                : `Vần thơ theo tâm trạng: ${activeMood}`}
            </span>
            <span>
              {filteredPoems.length > 0 ? (
                <>
                  Trang {currentPage}/{totalPages} • {filteredPoems.length} bài thơ
                </>
              ) : (
                '0 bài thơ'
              )}
            </span>
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-6 bg-white/70 dark:bg-stone-900/70 border border-stone-200/60 dark:border-stone-800 rounded-2xl space-y-3 animate-pulse"
                >
                  <div className="h-6 bg-stone-200 dark:bg-stone-800 rounded w-2/3" />
                  <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-1/3" />
                  <div className="h-16 bg-stone-200 dark:bg-stone-800 rounded w-full mt-4" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-12 px-6 bg-red-50/60 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900 text-stone-600 dark:text-stone-300 space-y-3">
              <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-xs font-medium text-amber-800 dark:text-amber-400 underline cursor-pointer"
              >
                Thử tải lại
              </button>
            </div>
          )}

          {!loading && !error && filteredPoems.length === 0 && (
            <div className="text-center py-16 bg-white/80 dark:bg-stone-900/80 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 space-y-3">
              <p className="text-stone-500 dark:text-stone-400 font-serif italic text-sm">
                {feedTab === 'challenges'
                  ? `Chưa có bài thơ nào tham gia thử thách "${currentChallenge.title}". Hãy là người đầu tiên đặt bút!`
                  : 'Không tìm thấy bài thơ nào khớp với bộ lọc hiện tại.'}
              </p>
              {feedTab === 'challenges' ? (
                <Link
                  to={`/poems/new?challenge=${currentChallenge.tag}`}
                  className="inline-block px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-stone-50 rounded-xl text-xs font-serif font-medium shadow-2xs"
                >
                  ✍️ Đăng bài đầu tiên cho thử thách tuần
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveMood('Tất cả')
                    setSearchQuery('')
                    setFeedTab('all')
                  }}
                  className="text-xs font-medium text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Khôi phục tất cả bài thơ →
                </button>
              )}
            </div>
          )}

          {!loading && !error && filteredPoems.length > 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {paginatedPoems.map((poem) => (
                  <PoemCard key={poem.id} poem={poem} />
                ))}
              </div>

              {/* Bộ Phân Trang Thông Minh */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </section>

        {/* Cột phụ: Sidebar văn chương (4 cột) */}
        <section className="lg:col-span-4">
          <LiterarySidebar
            popularPoems={popularPoems}
            onSelectMood={setActiveMood}
          />
        </section>
      </div>
    </div>
  )
}
