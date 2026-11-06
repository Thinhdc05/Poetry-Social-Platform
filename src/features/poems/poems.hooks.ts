import { useState, useEffect, useCallback } from 'react'
import type { Poem } from './poems.types'
import { getPoems, getPoemById } from './poems.api'

export function usePoems() {
  const [poems, setPoems] = useState<Poem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPoems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPoems()
      setPoems(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách bài thơ'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPoems()
  }, [fetchPoems])

  return { poems, loading, error, refetch: fetchPoems }
}

export function usePoemDetail(id?: string) {
  const [poem, setPoem] = useState<Poem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setPoem(null)
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    getPoemById(id)
      .then((data) => {
        if (!isMounted) return
        setPoem(data ?? null)
      })
      .catch((err: unknown) => {
        if (!isMounted) return
        const msg = err instanceof Error ? err.message : 'Không thể tải bài thơ'
        setError(msg)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  return { poem, loading, error }
}

