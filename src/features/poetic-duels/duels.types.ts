export interface PoeticResponse {
  id: string
  poemId: string
  authorName: string
  authorId?: string
  content: string
  createdAt: string
  likesCount: number
  isAuthorEndorsed: boolean
  rhymeNote?: string
}

export interface CreatePoeticResponseInput {
  poemId: string
  authorName: string
  authorId?: string
  content: string
  rhymeNote?: string
}

