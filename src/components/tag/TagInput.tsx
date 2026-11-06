import { useState, type KeyboardEvent } from 'react'
import { Tag, X } from 'lucide-react'

export interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  placeholder?: string
}

export function TagInput({
  tags,
  onChange,
  maxTags = 5,
  placeholder = 'Nhập thẻ thơ rồi nhấn Enter (vd: lục bát, trăng rằm)...',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const clean = inputValue.trim().replace(/^#/, '')
      if (clean && !tags.includes(clean) && tags.length < maxTags) {
        onChange([...tags, clean])
        setInputValue('')
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove))
  }

  return (
    <div className="space-y-1.5 font-serif">
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white/90 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-700 rounded-xl focus-within:border-amber-700 min-h-10 transition-colors shadow-2xs">
        <Tag className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-1" />

        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-amber-900/10 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-800/20"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-red-600 transition-colors cursor-pointer"
              title="Xóa thẻ"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {tags.length < maxTags && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : 'Thêm thẻ khác...'}
            className="flex-1 min-w-[150px] text-xs bg-transparent border-none outline-none text-stone-800 dark:text-stone-200 px-1 py-0.5 placeholder:text-stone-400"
          />
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
        <span>Nhấn Enter hoặc dấu phẩy để gắn thẻ</span>
        <span>{tags.length}/{maxTags} thẻ</span>
      </div>
    </div>
  )
}

