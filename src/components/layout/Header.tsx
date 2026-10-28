import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="border-b border-stone-200 bg-stone-50/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="group">
          <h1 className="text-2xl font-serif font-bold text-stone-800 group-hover:text-amber-800 transition-colors">
            Thơ Mộc
          </h1>
          <p className="text-xs text-stone-500 font-sans tracking-wide">
            Nơi lắng đọng hồn thơ
          </p>
        </Link>
      </div>
    </header>
  )
}
