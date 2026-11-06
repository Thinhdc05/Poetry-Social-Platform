import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'

export function RouteErrorBoundary() {
  const error = useRouteError()

  let errorMessage = 'Đã có sự cố bất ngờ xảy ra khi lật mở trang thơ.'
  if (isRouteErrorResponse(error)) {
    errorMessage = `${error.status} — ${error.statusText || 'Không tìm thấy trang'}`
  } else if (error instanceof Error) {
    errorMessage = error.message
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white/95 dark:bg-[#1a1816] border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-xl space-y-4">
        <span className="text-4xl block">🍃</span>
        <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
          Chút Lắng Đọng Trên Trang Thơ
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 font-serif leading-relaxed">
          {errorMessage}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-serif text-stone-700 dark:text-stone-300 hover:bg-stone-100 cursor-pointer"
          >
            Tải lại trang
          </button>
          <Link
            to="/"
            className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-stone-50 text-xs font-serif font-medium shadow-2xs"
          >
            Về Trang Chủ →
          </Link>
        </div>
      </div>
    </div>
  )
}

