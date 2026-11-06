import { MOODS } from '../../features/reading'

interface MoodChipsProps {
  activeMood: string
  onSelectMood: (mood: string) => void
}

export function MoodChips({ activeMood, onSelectMood }: MoodChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none py-1">
      <span className="text-xs text-stone-600 dark:text-stone-300 font-serif italic whitespace-nowrap pl-1 pr-2">
        Tâm trạng:
      </span>
      {MOODS.map((mood) => {
        const isSelected = activeMood === mood
        return (
          <button
            key={mood}
            type="button"
            onClick={() => onSelectMood(mood)}
            className={`px-3 py-1 rounded-full text-xs font-serif whitespace-nowrap transition-all cursor-pointer border ${
              isSelected
                ? 'bg-amber-800 text-stone-50 border-amber-800 shadow-2xs'
                : 'bg-white/60 dark:bg-stone-850/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-amber-700/60'
            }`}
          >
            {mood}
          </button>
        )
      })}
    </div>
  )
}

