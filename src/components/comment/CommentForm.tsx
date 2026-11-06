import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth'

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) {
    return (
      <div className="p-4 rounded-xl bg-stone-100/80 border border-stone-200/80 text-center">
        <p className="text-xs text-stone-600 font-serif italic">
          Bạn muốn gửi gắm đôi lời cảm nhận về bài thơ?
        </p>
        <Link
          to="/login"
          className="inline-block mt-2 text-xs font-medium text-amber-800 hover:underline"
        >
          Đăng nhập để bình luận →
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!content.trim()) return

    try {
      setSubmitting(true)
      setError(null)
      await onSubmit(content.trim())
      setContent('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể gửi bình luận')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="p-2.5 rounded-lg bg-red-50 text-xs text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <div>
        <textarea
          rows={3}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Viết đôi dòng cảm nghĩ về bài thơ..."
          className="w-full p-3 text-xs bg-white border border-stone-300/80 rounded-xl focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 transition-colors shadow-2xs font-serif leading-relaxed"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-50 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
        >
          {submitting ? 'Đang gửi...' : 'Gửi lời bình'}
        </button>
      </div>
    </form>
  )
}

