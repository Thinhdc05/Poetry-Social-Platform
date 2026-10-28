import { getMockPoems } from '../../features/poems/poems.api'
import { PoemCard } from '../../components/poem/PoemCard'

export function HomePage() {
  const poems = getMockPoems()

  return (
    <div className="space-y-8">
      {/* Lời mở đầu */}
      <section className="text-center py-4">
        <h2 className="text-2xl font-serif font-semibold text-stone-800">
          Vần Thơ Mộc Mạc
        </h2>
        <p className="mt-2 text-sm text-stone-500 max-w-md mx-auto">
          Nơi gửi gắm những rung cảm bình dị, những dòng thơ mộc mạc giữa đời sống bộn bề.
        </p>
      </section>

      {/* Danh sách bài thơ */}
      {poems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-stone-200 text-stone-500">
          Chưa có bài thơ nào được chia sẻ.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {poems.map((poem) => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      )}
    </div>
  )
}
