import { createContext, useState, useEffect, type ReactNode } from 'react'
import type { ThemeMode, FontSize, ReadingContextType } from './reading.types'

export const ReadingContext = createContext<ReadingContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'tho_moc_theme'
const FONT_STORAGE_KEY = 'tho_moc_font_size'

function applyThemeToDocument(targetTheme: ThemeMode) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', targetTheme)
  if (targetTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function ReadingProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'sepia' || saved === 'dark' || saved === 'light') return saved
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem(FONT_STORAGE_KEY)
    if (saved === 'sm' || saved === 'base' || saved === 'lg' || saved === 'xl') return saved
    return 'base'
  })

  const [isFocusMode, setIsFocusMode] = useState<boolean>(false)
  const [activeMood, setActiveMood] = useState<string>('Tất cả')

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    applyThemeToDocument(newTheme)
  }

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size)
    localStorage.setItem(FONT_STORAGE_KEY, size)
  }

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  return (
    <ReadingContext.Provider
      value={{
        theme,
        setTheme,
        fontSize,
        setFontSize,
        isFocusMode,
        setIsFocusMode,
        activeMood,
        setActiveMood,
      }}
    >
      {children}
    </ReadingContext.Provider>
  )
}
