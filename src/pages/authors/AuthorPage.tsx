import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePoems } from '../../features/poems'
import { PoemCard } from '../../components/poem/PoemCard'

export function AuthorPage() {
  const { authorName } = useParams<{ authorName: string }>()
  const decodedName = decodeURIComponent(authorName || '').trim()
  const { poems, loading } = usePoems()

  const authorPoems = useMemo(() => {
    if (!decodedName) return []
    return poems.filter(
      (p) => p.author.toLowerCase() === decodedName.toLowerCase()
    )
  }, [poems, decodedName])

  const totalLikes = useMemo(() => {
    return authorPoems.reduce((acc, p) => acc + (p.likesCount || 0), 0)
  }, [authorPoems])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* 1. Header tác giả mang đậm phong cách văn chương */}
      <section className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <Link
              to="/"
              className="text-xs text-amber-400/90 hover:underline font-serif inline-block"
            >
              ← Quay lại Thi Đàn
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-600/60 flex items-center justify-center text-2xl shadow-inner">
                ✒️
              </div>
              <div>
                <span className="text-[11px] font-serif uppercase tracking-widest text-amber-400 block">
                  Thi Nhân Tri Kỷ
                </span>
                <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-50">
                  {decodedName || 'Tác Giả Khuyết Danh'}
                </h1>
              </div>
            </div>
            <p className="text-xs text-stone-400 font-serif italic max-w-lg">
              Tuyển tập những thi phẩm và câu chữ lưu dấu trên thi đàn Thơ Mộc.
            </p>
          </div>

          {/* Thống kê thi tác */}
          <div className="grid grid-cols-2 gap-3 text-center bg-stone-950/80 p-4 rounded-2xl border border-stone-800 shrink-0">
            <div className="px-3">
              <span className="block text-2xl font-serif font-bold text-amber-400">
                {authorPoems.length}
              </span>
              <span className="text-[11px] text-stone-400 font-serif">Thi phẩm</span>
            </div>
            <div className="px-3 border-l border-stone-800">
              <span className="block text-2xl font-serif font-bold text-amber-400">
                {totalLikes}
              </span>
              <span className="text-[11px] text-stone-400 font-serif">Lượt tri âm</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Danh sách bài thơ của tác giả */}
      <section className="space-y-6">
        <div className="flex items-center justify-between text-xs font-serif text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800 pb-2">
          <span className="font-semibold text-stone-800 dark:text-stone-200 text-sm">
            Tuyển Tập Tác Phẩm ({authorPoems.length})
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs font-serif italic text-stone-400">
            Đang lật mở trang thơ của {decodedName}...
          </div>
        ) : authorPoems.length === 0 ? (
          <div className="text-center py-16 bg-white/95 dark:bg-[#1a1816] rounded-2xl border border-stone-200 dark:border-stone-800 p-8 space-y-3 shadow-xs">
            <p className="text-sm font-serif italic text-stone-500">
              Chưa tìm thấy thi phẩm nào của tác giả &ldquo;{decodedName}&rdquo;.
            </p>
            <Link
              to="/"
              className="inline-block text-xs font-serif font-medium text-amber-800 dark:text-amber-400 underline"
            >
              Quay lại danh sách bài thơ →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {authorPoems.map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

