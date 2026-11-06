import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  const paginationRange = useMemo(() => {
    // Tổng số ô hiển thị: first + last + current + 2*siblings + 2*dots = 7
    const totalPageNumbers = siblingCount * 2 + 5

    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
      return [...leftRange, '...', totalPages]
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      )
      return [1, '...', ...rightRange]
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      )
      return [1, '...', ...middleRange, '...', totalPages]
    }

    return []
  }, [currentPage, totalPages, siblingCount])

  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="Điều hướng phân trang bài thơ"
      className="flex items-center justify-center gap-1.5 py-6 select-none font-serif"
    >
      {/* Nút lùi về trang trước */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-stone-200/90 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        title="Trang trước"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Dải số trang thông minh */}
      {paginationRange.map((pageNumber, idx) => {
        if (pageNumber === '...') {
          return (
            <span
              key={`dots-${idx}`}
              className="px-2 text-xs text-stone-400 dark:text-stone-500 tracking-widest"
            >
              •••
            </span>
          )
        }

        const isCurrent = pageNumber === currentPage
        return (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber as number)}
            className={`min-w-8 h-8 px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              isCurrent
                ? 'bg-amber-800 text-stone-50 border-amber-800 shadow-2xs font-bold'
                : 'bg-white/80 dark:bg-stone-900/80 border-stone-200/90 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-700 hover:text-amber-800'
            }`}
          >
            {pageNumber}
          </button>
        )
      })}

      {/* Nút sang trang tiếp theo */}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-stone-200/90 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        title="Trang tiếp"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  )
}

