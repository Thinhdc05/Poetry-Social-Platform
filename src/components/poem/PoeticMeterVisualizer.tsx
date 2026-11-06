import { useMemo } from 'react'
import { analyzePoemMeter } from '../../features/poems'
import { Sparkles, AlertCircle, BookOpen, Music } from 'lucide-react'

interface PoeticMeterVisualizerProps {
  content: string
}

export function PoeticMeterVisualizer({ content }: PoeticMeterVisualizerProps) {
  const report = useMemo(() => analyzePoemMeter(content), [content])

  if (!content.trim() || report.totalLines === 0) {
    return (
      <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 text-xs font-serif text-stone-500 dark:text-stone-400 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
        <span>Gõ vài câu thơ để hệ thống tự động thẩm âm và giám định thể thơ.</span>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-[#1f1c19] space-y-3 font-serif">
      {/* Header thẩm âm */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 dark:border-stone-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300">
            <Music className="w-3.5 h-3.5" />
          </span>
          <div>
            <span className="text-[10px] uppercase font-sans tracking-wider text-amber-800 dark:text-amber-400 font-semibold block">
              Thẩm Âm & Niêm Luật
            </span>
            <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
              {report.detectedFormName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-sans">
          <span className="px-2 py-0.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300">
            {report.totalLines} câu • {report.totalWords} tiếng
          </span>
          {report.anomaliesCount === 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Chuẩn nhịp</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{report.anomaliesCount} câu lệch nhịp</span>
            </span>
          )}
        </div>
      </div>

      {/* Lời khuyên văn chương */}
      <div className="text-[11px] text-stone-600 dark:text-stone-400 space-y-1">
        {report.suggestions.map((s, idx) => (
          <p key={idx} className="flex items-start gap-1.5 leading-relaxed">
            <span>{s}</span>
          </p>
        ))}
      </div>

      {/* Danh sách nhịp từng dòng */}
      <div className="space-y-1 max-h-36 overflow-y-auto pr-1 text-xs">
        {report.lineAnalyses.map((la, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between px-2.5 py-1 rounded-lg text-[11px] ${
              la.isAnomaly
                ? 'bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-800/80 text-amber-950 dark:text-amber-200'
                : 'bg-white/60 dark:bg-stone-850/40 text-stone-700 dark:text-stone-300'
            }`}
          >
            <span className="truncate max-w-[70%] font-serif">
              <span className="text-[10px] text-stone-400 mr-1.5 font-sans">#{idx + 1}</span>
              &ldquo;{la.text}&rdquo;
            </span>

            <div className="flex items-center gap-2 font-sans text-[10px] shrink-0">
              <span className="font-medium">
                {la.wordCount} tiếng
                {la.expectedWordCount && la.expectedWordCount !== la.wordCount && (
                  <span className="text-amber-700 dark:text-amber-400 ml-1">
                    (chuẩn: {la.expectedWordCount})
                  </span>
                )}
              </span>
              <span
                title={la.lastWordTone === 'B' ? 'Thanh Bằng (êm dịu)' : 'Thanh Trắc (trầm bổng)'}
                className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                  la.lastWordTone === 'B'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {la.lastWordTone === 'B' ? 'B' : 'T'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

