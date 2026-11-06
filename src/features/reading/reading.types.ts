export type ThemeMode = 'light' | 'sepia' | 'dark'

export type FontSize = 'sm' | 'base' | 'lg' | 'xl'

export interface ReadingContextType {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
  isFocusMode: boolean
  setIsFocusMode: (focus: boolean | ((prev: boolean) => boolean)) => void
  activeMood: string
  setActiveMood: (mood: string) => void
}

