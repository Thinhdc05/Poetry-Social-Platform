import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Poem } from '../../features/poems/poems.types'
import { speakPoem, stopSpeaking, isSpeechSupported } from '../../features/speech'
import { VermilionSeal } from '../common/VermilionSeal'
import { Shuffle, Headphones, VolumeX, ArrowRight, Feather, ScrollText } from 'lucide-react'

interface HeroPoemStageProps {
  poem: Poem
  onShuffle?: () => void
}

export function HeroPoemStage({ poem, onShuffle }: HeroPoemStageProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const normalized = (poem.content || '').replace(/\\n/g, '\n')
  const primeLines = normalized
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .slice(0, 4)
    .join('\n')

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking()
      setIsSpeaking(false)
      return
    }

    const textToRead = `${poem.title}. Tác giả: ${poem.author}.\n\n${primeLines}`
    const success = speakPoem(
      textToRead,
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    )
    if (success) {
      setIsSpeaking(true)
    }
  }

  return (
    <section className="relative rounded-2xl bg-[#171513] border border-[#2e2a26] text-[#f7f4ed] p-7 sm:p-12 shadow-xl overflow-hidden transition-all duration-300">
      {/* Vệt sáng ấm tinh tế phía sau lay động nhịp thở */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-800/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 animate-pulse transition-all duration-1000" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-stone-600/10 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10 animate-pulse transition-all duration-700" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 sm:gap-12">
        {/* Khối trích dẫn thơ trung tâm */}
        <div className="space-y-4 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[11px] font-serif uppercase tracking-widest text-amber-300/90 font-medium">
                Vần Thơ Hôm Nay • {poem.mood || 'Chọn lọc'}
              </span>
            </div>

            {/* Nút đổi bài thơ */}
            {onShuffle && (
              <button
                type="button"
                onClick={onShuffle}
                title="Đổi sang một bài thơ tuyển chọn khác trong ngày"
                className="text-[11px] font-serif text-stone-400 hover:text-amber-300 flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/90 border border-stone-800 hover:border-amber-700/60 transition-colors cursor-pointer"
              >
                <Shuffle className="w-3 h-3 text-amber-400" />
                <span>Đổi vần thơ khác</span>
              </button>
            )}
          </div>

          <Link to={`/poems/${poem.id}`} className="block group">
            <h2
              key={`title-${poem.id}`}
              className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-100 group-hover:text-amber-200 transition-colors tracking-tight leading-tight animate-fade-in"
            >
              {poem.title}
            </h2>
          </Link>

          <blockquote className="my-3 border-l-2 border-amber-600/70 pl-5 py-1">
            <p
              key={`lines-${poem.id}`}
              className="text-lg sm:text-xl md:text-2xl font-serif italic text-amber-100/95 leading-relaxed whitespace-pre-line animate-fade-in"
            >
              &ldquo;{primeLines}&rdquo;
            </p>
          </blockquote>

          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-stone-400 font-serif">
            {poem.authorType === 'collected' ? (
              <>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-stone-800/90 border border-stone-700 text-stone-300 font-sans">
                  <ScrollText className="w-3 h-3 text-amber-400" />
                  <span>Sưu tầm</span>
                </span>
                <span>Tác giả:</span>
                <Link
                  to={`/authors/${encodeURIComponent(poem.author)}`}
                  className="font-semibold text-stone-200 hover:text-amber-300 hover:underline"
                >
                  {poem.author}
                </Link>
                {poem.curatorName && (
                  <span className="text-xs text-stone-400 font-sans">
                    • Người chép: @{poem.curatorName}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-950/70 border border-amber-800/70 text-amber-300 font-sans">
                  <Feather className="w-3 h-3" />
                  <span>Sáng tác</span>
                </span>
                <Link
                  to={`/authors/${encodeURIComponent(poem.author)}`}
                  className="font-semibold text-stone-200 hover:text-amber-300 hover:underline"
                >
                  {poem.author}
                </Link>
              </>
            )}
            <span>•</span>
            <time>{poem.createdAt}</time>
            {poem.readingTimeMinutes && (
              <>
                <span>•</span>
                <span>{poem.readingTimeMinutes} phút đọc</span>
              </>
            )}
          </div>
        </div>

        {/* Khối con dấu triện chu sa & Hành động */}
        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-stone-800">
          <div className="hidden md:block">
            <VermilionSeal text={poem.author} size="lg" shape="square" title={`Ấn triện ${poem.author}`} />
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full sm:w-auto">
            {isSpeechSupported() && (
              <button
                type="button"
                onClick={handleToggleSpeech}
                className="w-full sm:w-auto px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-amber-800/60 text-amber-200 font-serif text-xs font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dừng giọng ngâm</span>
                  </>
                ) : (
                  <>
                    <Headphones className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nghe ngâm thơ</span>
                  </>
                )}
              </button>
            )}

            <Link
              to={`/poems/${poem.id}`}
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-800 hover:bg-amber-700 text-stone-50 font-serif text-xs sm:text-sm font-medium rounded-xl transition-all shadow-xs text-center inline-flex items-center justify-center gap-1.5"
            >
              <span>Đọc trọn vẹn bài thơ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
