export interface TagBadgeProps {
  name: string
  isSelected?: boolean
  onClick?: () => void
  count?: number
}

export function TagBadge({ name, isSelected, onClick, count }: TagBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-serif transition-all cursor-pointer border ${
        isSelected
          ? 'bg-amber-800 text-stone-50 border-amber-800 shadow-2xs font-medium'
          : 'bg-white/70 dark:bg-stone-850/70 border-stone-200/90 dark:border-stone-700/80 text-stone-600 dark:text-stone-300 hover:border-amber-700/60 hover:text-amber-800'
      }`}
    >
      <span>#{name}</span>
      {count !== undefined && (
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            isSelected
              ? 'bg-amber-900/60 text-stone-100'
              : 'bg-stone-200/60 dark:bg-stone-800 text-stone-500'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}

