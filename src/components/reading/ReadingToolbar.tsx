import { useState } from 'react'
import { useReading, type FontSize } from '../../features/reading'
import { speakPoem, stopSpeaking, isSpeechSupported, hasVietnameseVoice } from '../../features/speech'
import { Sun, Sparkles, Moon, Volume2, VolumeX, EyeOff, Eye, Share2 } from 'lucide-react'

interface ReadingToolbarProps {
  poemContent: string
  onOpenShareModal: () => void
  layout?: 'horizontal' | 'vertical'
}

export function ReadingToolbar({
  poemContent,
  onOpenShareModal,
  layout = 'horizontal',
}: ReadingToolbarProps) {
  const { theme, setTheme, fontSize, setFontSize, isFocusMode, setIsFocusMode } =
    useReading()

  const [isSpeaking, setIsSpeaking] = useState(false)
  const canSpeak = isSpeechSupported() && hasVietnameseVoice()

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking()
      setIsSpeaking(false)
    } else {
      const ok = speakPoem(
        poemContent,
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      )
      if (ok) setIsSpeaking(true)
    }
  }

  const nextFontSize: Record<FontSize, FontSize> = {
    sm: 'base',
    base: 'lg',
    lg: 'xl',
    xl: 'sm',
  }

  if (layout === 'vertical') {
    return (
      <div className="p-4 bg-white/95 dark:bg-[#1a1816] border border-stone-200/90 dark:border-stone-800 rounded-xl shadow-2xs space-y-3 text-xs font-serif">
        {/* Hàng 1: Cỡ chữ & Tông màu giấy */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-150 dark:border-stone-800 pb-2.5">
          <button
            type="button"
            onClick={() => setFontSize(nextFontSize[fontSize])}
            title="Đổi cỡ chữ đọc thơ"
            className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors font-bold text-stone-700 dark:text-stone-200 cursor-pointer flex items-center gap-1"
          >
            <span>A</span>
            <span className="text-[10px] font-normal uppercase text-amber-800 dark:text-amber-400">
              {fontSize}
            </span>
          </button>

          <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg p-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => setTheme('light')}
              title="Giấy mộc sáng"
              className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer text-xs ${
                theme === 'light'
                  ? 'bg-amber-100 text-amber-900 font-bold'
                  : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('sepia')}
              title="Giấy cổ Sepia"
              className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer text-xs ${
                theme === 'sepia'
                  ? 'bg-amber-200 text-amber-950 font-bold'
                  : 'text-stone-500 hover:bg-amber-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              title="Mực đêm"
              className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer text-xs ${
                theme === 'dark'
                  ? 'bg-stone-800 text-amber-400 font-bold'
                  : 'text-stone-500 hover:bg-stone-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hàng 2: Tác vụ Nghe thơ & Tĩnh lặng */}
        <div className={`grid ${canSpeak ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
          {canSpeak && (
            <button
              type="button"
              onClick={handleToggleSpeech}
              title={isSpeaking ? 'Dừng đọc' : 'Nghe ngâm thơ'}
              className={`py-1.5 px-2 rounded-xl border transition-colors flex items-center justify-center gap-1 cursor-pointer text-[11px] ${
                isSpeaking
                  ? 'bg-amber-800 text-stone-50 border-amber-800 animate-pulse'
                  : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? 'Dừng' : 'Nghe thơ'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFocusMode((prev) => !prev)}
            title="Bật/tắt chế độ tĩnh lặng"
            className={`py-1.5 px-2 rounded-xl border transition-colors flex items-center justify-center gap-1 cursor-pointer text-[11px] ${
              isFocusMode
                ? 'bg-stone-900 text-stone-50 border-stone-900'
                : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            {isFocusMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{isFocusMode ? 'Hiện đủ' : 'Tĩnh lặng'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenShareModal}
          className="w-full py-2 px-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-stone-50 font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs text-xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Tạo thẻ thơ chia sẻ</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 p-2.5 bg-white/95 dark:bg-[#1a1816] backdrop-blur-md border border-stone-200/80 dark:border-stone-800 rounded-xl shadow-xs text-xs font-serif">
      {/* Tùy chỉnh hiển thị */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setFontSize(nextFontSize[fontSize])}
          title="Thay đổi cỡ chữ"
          className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors font-serif font-bold text-stone-700 dark:text-stone-200 cursor-pointer"
        >
          A<span className="text-[10px] font-normal uppercase text-amber-800 dark:text-amber-400">{fontSize}</span>
        </button>

        <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg p-0.5 gap-1">
          <button
            type="button"
            onClick={() => setTheme('light')}
            title="Tông giấy trắng mộc"
            className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer text-xs ${
              theme === 'light'
                ? 'bg-amber-100 text-amber-900 font-bold'
                : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setTheme('sepia')}
            title="Tông giấy cổ Sepia"
            className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer text-xs ${
              theme === 'sepia'
                ? 'bg-amber-200 text-amber-950 font-bold'
                : 'text-stone-500 hover:bg-amber-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            title="Tông mực đêm"
            className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer text-xs ${
              theme === 'dark'
                ? 'bg-stone-800 text-amber-400 font-bold'
                : 'text-stone-500 hover:bg-stone-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tác vụ phụ trợ */}
      <div className="flex items-center gap-2">
        {canSpeak && (
          <button
            type="button"
            onClick={handleToggleSpeech}
            title={isSpeaking ? 'Dừng đọc thơ' : 'Đọc thơ bằng giọng nói'}
            className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer font-serif ${
              isSpeaking
                ? 'bg-amber-800 text-stone-50 border-amber-800 animate-pulse'
                : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {isSpeaking ? 'Đang đọc...' : 'Nghe thơ'}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsFocusMode((prev) => !prev)}
          title="Chế độ đọc tĩnh lặng (ẩn giao diện)"
          className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer font-serif ${
            isFocusMode
              ? 'bg-stone-900 text-stone-50 border-stone-900'
              : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          {isFocusMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isFocusMode ? 'Hiện đủ' : 'Tĩnh lặng'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenShareModal}
          title="Tạo ảnh thẻ thơ để chia sẻ"
          className="px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-stone-50 font-serif transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Thẻ thơ</span>
        </button>
      </div>
    </div>
  )
}
