import type { Comment } from '../../features/comments'

interface CommentListProps {
  comments: Comment[]
  currentUserId?: string
  onDelete?: (id: string) => Promise<void>
}

export function CommentList({
  comments,
  currentUserId,
  onDelete,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-stone-400 font-serif italic">
        Chưa có lời bình nào. Hãy là người đầu tiên để lại cảm xúc.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const canDelete = currentUserId && currentUserId === comment.userId

        return (
          <div
            key={comment.id}
            className="p-4 bg-white/70 border border-stone-200/70 rounded-xl space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-800">
                {comment.authorName}
              </span>
              <div className="flex items-center gap-3 text-stone-400 text-[11px]">
                <time>{comment.createdAt}</time>
                {canDelete && onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(comment.id)}
                    className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
            <p className="text-stone-700 font-serif whitespace-pre-line leading-relaxed">
              {comment.content}
            </p>
          </div>
        )
      })}
    </div>
  )
}

