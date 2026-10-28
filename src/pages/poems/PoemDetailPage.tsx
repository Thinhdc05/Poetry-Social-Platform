import { useParams, Link } from 'react-router-dom'
import { getMockPoemById } from '../../features/poems/poems.api'

export function PoemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const poem = id ? getMockPoemById(id) : undefined
  if (!poem) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-stone-200 p-8 space-y-4">
        <h2 className="text-xl font-serif font-bold text-stone-800">
          Không tìm thấy bài thơ
        </h2>
        <p className="text-sm text-stone-500">
          Bài thơ bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đi nơi khác.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2 text-sm font-medium bg-stone-800 text-stone-100 rounded-lg hover:bg-stone-700 transition-colors"
        >
          ← Quay về trang chủ
        </Link>
      </div>
    )
  }
  return (
    <article className="space-y-8">
      <Link
        to="/"
        className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-amber-800 transition-colors"
      >
        ← Quay lại danh sách
      </Link>
      <div className="bg-white border border-stone-200 rounded-2xl p-8 sm:p-12 shadow-xs">
        <header className="border-b border-stone-100 pb-6 mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            {poem.title}
          </h1>
          <div className="mt-3 flex items-center justify-center gap-3 text-sm text-stone-500">
            <span className="font-medium text-stone-700">{poem.author}</span>
            <span>•</span>
            <time>{poem.createdAt}</time>
          </div>
        </header>
        <div className="text-stone-800 font-serif text-lg leading-relaxed whitespace-pre-line text-center max-w-lg mx-auto py-4">
          {poem.content}
        </div>
      </div>
    </article>
  )
}
