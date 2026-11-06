import { useAmbientSound, AMBIENT_OPTIONS } from '../../features/ambient-sound'

interface AmbientSoundBarProps {
  compact?: boolean
}

export function AmbientSoundBar({ compact = false }: AmbientSoundBarProps) {
  const { activeSound, volume, toggleSound, changeVolume } = useAmbientSound()

  return (
    <div className="inline-flex items-center gap-1.5 bg-stone-100/90 dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700/80 rounded-xl px-2 py-1 text-xs">
      <span
        className="text-[11px] text-stone-500 dark:text-stone-400 font-serif hidden lg:inline pr-1 border-r border-stone-200 dark:border-stone-700"
        title="Thanh âm quán sách (Web Audio tự sinh)"
      >
        Thanh âm:
      </span>

      <div className="flex items-center gap-1">
        {AMBIENT_OPTIONS.map((opt) => {
          const isActive = activeSound === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleSound(opt.id)}
              title={`Bật/tắt tiếng ${opt.label.toLowerCase()}`}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer font-serif text-[11px] ${
                isActive
                  ? 'bg-amber-800 text-stone-50 shadow-2xs font-medium'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-700/70'
              }`}
            >
              <span className={isActive ? 'animate-pulse' : ''}>{opt.icon}</span>
              {!compact && <span className="hidden md:inline">{opt.label}</span>}
            </button>
          )
        })}
      </div>

      {activeSound !== 'none' && (
        <input
          type="range"
          min={0.05}
          max={0.9}
          step={0.05}
          value={volume}
          onChange={(e) => changeVolume(Number(e.target.value))}
          title="Âm lượng không gian"
          aria-label="Âm lượng không gian"
          className="w-14 h-1 accent-amber-800 dark:accent-amber-500 cursor-pointer ml-1 hidden sm:block"
        />
      )}
    </div>
  )
}

