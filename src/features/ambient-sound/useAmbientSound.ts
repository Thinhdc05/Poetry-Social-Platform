import { useState, useCallback } from 'react'
import { ambientEngine, type AmbientSoundType } from './ambient.engine'

export interface AmbientSoundOption {
  id: AmbientSoundType
  label: string
  icon: string
}

export const AMBIENT_OPTIONS: AmbientSoundOption[] = [
  { id: 'rain', label: 'Mưa đêm', icon: '🌧️' },
  { id: 'fireplace', label: 'Lửa ấm', icon: '🔥' },
  { id: 'wind', label: 'Gió hiên', icon: '🍃' },
]

export function useAmbientSound() {
  const [activeSound, setActiveSound] = useState<AmbientSoundType>(
    ambientEngine.getCurrentType()
  )
  const [volume, setVolumeState] = useState<number>(0.35)

  const toggleSound = useCallback((type: AmbientSoundType) => {
    const current = ambientEngine.getCurrentType()
    if (current === type) {
      ambientEngine.stop()
      setActiveSound('none')
    } else {
      ambientEngine.play(type)
      setActiveSound(type)
    }
  }, [])

  const changeVolume = useCallback((newVol: number) => {
    setVolumeState(newVol)
    ambientEngine.setVolume(newVol)
  }, [])

  return {
    activeSound,
    volume,
    toggleSound,
    changeVolume,
  }
}

