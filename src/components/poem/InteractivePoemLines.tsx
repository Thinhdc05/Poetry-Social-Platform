import type { LineNote, SavedVerseHighlight } from '../../features/line-annotations'

interface InteractivePoemLinesProps {
  content: string
  fontSizeClass: string
  notes: LineNote[]
  highlights: SavedVerseHighlight[]
  selectedLineIndex: number | null
  onSelectLine: (index: number | null) => void
}

export function InteractivePoemLines({
  content,
  fontSizeClass,
  notes,
  highlights,
  selectedLineIndex,
  onSelectLine,
}: InteractivePoemLinesProps) {
  const lines = (content || '').replace(/\\n/g, '\n').split('\n')

  return (
    <div className="space-y-4">
      {/* Thân bài thơ từng dòng có thể bấm để gạch chân & hiển thị chú giải ở lề */}
      <div
        className={`font-serif text-center max-w-lg mx-auto py-2 select-text transition-all duration-300 ${fontSizeClass}`}
      >
        {lines.map((line, idx) => {
          const trimmed = line.trim()
          if (!trimmed) {
            return <div key={idx} className="h-6" aria-hidden="true" />
          }

          const lineNotesCount = notes.filter((n) => n.lineIndex === idx).length
          const isHighlighted = highlights.some((h) => h.lineIndex === idx)
          const isSelected = selectedLineIndex === idx

          return (
            <div key={idx} className="my-1.5 flex justify-center">
              <button
                type="button"
                onClick={() => onSelectLine(isSelected ? null : idx)}
                className={`group relative inline-flex items-center gap-2 px-3 py-1 rounded-xl transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'bg-amber-100/90 dark:bg-amber-950/80 text-amber-950 dark:text-amber-100 ring-2 ring-amber-500/80 shadow-xs'
                    : isHighlighted
                    ? 'underline decoration-amber-600/70 dark:decoration-amber-400/80 decoration-wavy underline-offset-8 bg-amber-50/60 dark:bg-amber-950/30 text-stone-900 dark:text-stone-100'
                    : 'text-stone-850 dark:text-stone-100 hover:bg-stone-100/90 dark:hover:bg-stone-800/70'
                }`}
              >
                <span className="leading-relaxed">{line}</span>

                {(isHighlighted || lineNotesCount > 0) && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-sans px-1.5 py-0.5 rounded-full bg-amber-200/90 dark:bg-amber-900/80 text-amber-950 dark:text-amber-200 shrink-0 font-medium shadow-2xs">
                    {isHighlighted && <span>✨</span>}
                    {lineNotesCount > 0 && <span>💬 {lineNotesCount}</span>}
                  </span>
                )}
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-center text-[11px] text-stone-400 dark:text-stone-500 font-serif italic pt-2">
        💡 Mẹo: Chạm vào bất kỳ câu thơ nào để mở Lề Sách Tri Âm bên cạnh và đàm đạo.
      </p>
    </div>
  )
}
