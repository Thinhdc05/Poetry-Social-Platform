import { useState, useEffect, useCallback } from 'react'
import type { Comment } from './comments.types'
import { getCommentsByPoemId, createComment, deleteComment } from './comments.api'
import { subscribeToPoemComments } from './comments.realtime'

export function useComments(poemId?: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadComments = useCallback(async () => {
    if (!poemId) {
      setComments([])
      setLoading(false)
      return
    }

    try {
      const data = await getCommentsByPoemId(poemId)
      setComments(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tải bình luận'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [poemId])

  useEffect(() => {
    if (!poemId) return
    loadComments()

    // Lắng nghe realtime
    const unsubscribe = subscribeToPoemComments(poemId, () => {
      loadComments()
    })

    return () => {
      unsubscribe()
    }
  }, [poemId, loadComments])

  const handleAddComment = async (content: string, userId: string) => {
    if (!poemId) return
    const newComment = await createComment({ poemId, content }, userId)
    setComments((prev) => [...prev, newComment])
  }

  const handleRemoveComment = async (commentId: string) => {
    await deleteComment(commentId)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  return {
    comments,
    loading,
    error,
    addComment: handleAddComment,
    removeComment: handleRemoveComment,
    refetch: loadComments,
  }
}

