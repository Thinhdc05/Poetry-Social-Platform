export interface Comment {
  id: string
  poemId: string
  userId: string
  content: string
  createdAt: string
  authorName: string
  authorAvatar?: string
}

export interface CreateCommentInput {
  poemId: string
  content: string
}

