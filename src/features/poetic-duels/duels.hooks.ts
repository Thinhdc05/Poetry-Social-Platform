import { useState, useEffect, useCallback } from 'react'
import type { PoeticResponse, CreatePoeticResponseInput } from './duels.types'
import {
  getResponsesByPoemId,
  addPoeticResponse,
  toggleResponseLike,
  toggleAuthorEndorse,
} from './duels.api'

export function usePoeticDuels(poemId: string | undefined) {
  const [responses, setResponses] = useState<PoeticResponse[]>([])

  useEffect(() => {
    if (!poemId) return
    setResponses(getResponsesByPoemId(poemId))
  }, [poemId])

  const submitResponse = useCallback(
    (input: Omit<CreatePoeticResponseInput, 'poemId'>) => {
      if (!poemId) return
      const created = addPoeticResponse({ ...input, poemId })
      setResponses((prev) => [created, ...prev])
    },
    [poemId]
  )

  const handleLikeResponse = useCallback(
    (responseId: string) => {
      if (!poemId) return
      toggleResponseLike(responseId)
      setResponses(getResponsesByPoemId(poemId))
    },
    [poemId]
  )

  const handleToggleEndorse = useCallback(
    (responseId: string) => {
      if (!poemId) return
      toggleAuthorEndorse(responseId)
      setResponses(getResponsesByPoemId(poemId))
    },
    [poemId]
  )

  return {
    responses,
    submitResponse,
    handleLikeResponse,
    handleToggleEndorse,
  }
}

