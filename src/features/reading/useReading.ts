import { useContext } from 'react'
import { ReadingContext } from './ReadingContext'

export function useReading() {
  const context = useContext(ReadingContext)
  if (!context) {
    throw new Error('useReading phải được sử dụng bên trong ReadingProvider')
  }
  return context
}

