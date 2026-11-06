import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../auth'
import { fetchPoemReactions, togglePoemReaction } from './reactions.api'
import type { ReactionType, ReactionCounts } from './reactions.types'

export function usePoemReactions(poemId: string, initialLikesCount: number = 0) {
  const { user } = useAuth()
  const [counts, setCounts] = useState<ReactionCounts>({
    heart: initialLikesCount,
    touch: 0,
    sympathy: 0,
    total: initialLikesCount,
  })
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Tải dữ liệu thật từ Supabase khi component mount
  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        setLoading(true)
        const result = await fetchPoemReactions(poemId, user?.id)
        if (isMounted) {
          // Nếu database chưa có dữ liệu likes nào mà initialLikesCount > 0, bảo toàn số likesCount ban đầu
          const effectiveHeart = Math.max(result.counts.heart, initialLikesCount)
          setCounts({
            heart: effectiveHeart,
            touch: result.counts.touch,
            sympathy: result.counts.sympathy,
            total: effectiveHeart + result.counts.touch + result.counts.sympathy,
          })
          setUserReaction(result.userReaction)
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải cảm xúc')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (poemId) {
      load()
    }

    return () => {
      isMounted = false
    }
  }, [poemId, user?.id, initialLikesCount])

  // Xử lý khi người dùng bấm vào 1 trong 3 nút (Mô hình A: chọn 1 trong 3, bấm lại thì hủy)
  const react = useCallback(
    async (type: ReactionType): Promise<{ requireLogin?: boolean }> => {
      if (!user) {
        return { requireLogin: true }
      }

      const prevUserReaction = userReaction
      const prevCounts = { ...counts }

      // 1. Cập nhật lạc quan (Optimistic Update) tức thì trên giao diện
      let nextReaction: ReactionType | null = null
      const nextCounts = { ...prevCounts }

      if (prevUserReaction === type) {
        // Hủy cảm xúc
        nextReaction = null
        nextCounts[type] = Math.max(0, nextCounts[type] - 1)
        nextCounts.total = Math.max(0, nextCounts.total - 1)
      } else {
        // Đổi hoặc thêm mới
        nextReaction = type
        nextCounts[type] += 1
        if (prevUserReaction) {
          nextCounts[prevUserReaction] = Math.max(0, nextCounts[prevUserReaction] - 1)
        } else {
          nextCounts.total += 1
        }
      }

      setUserReaction(nextReaction)
      setCounts(nextCounts)

      // 2. Gửi request đồng bộ về Supabase
      try {
        await togglePoemReaction(poemId, user.id, type, prevUserReaction)
      } catch (err) {
        console.warn('Lỗi khi cập nhật cảm xúc:', err)
        // Rollback nếu thất bại nghiêm trọng
        setUserReaction(prevUserReaction)
        setCounts(prevCounts)
      }

      return { requireLogin: false }
    },
    [user, poemId, userReaction, counts]
  )

  return {
    counts,
    userReaction,
    loading,
    error,
    react,
  }
}

