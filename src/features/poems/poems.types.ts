export type AuthorType = 'original' | 'collected'

export interface Poem {
  id: string
  title: string
  content: string
  author: string
  authorType?: AuthorType
  curatorName?: string
  authorId?: string
  createdAt: string
  excerpt?: string
  imageUrl?: string
  tags?: string[]
  mood?: string
  readingTimeMinutes?: number
  likesCount?: number
  isPublic?: boolean
  sourceCitation?: string
}

export interface CreatePoemInput {
  title: string
  content: string
  author?: string
  authorType?: AuthorType
  tags?: string[]
  mood?: string
  imageUrl?: string
  isPublic?: boolean
  sourceCitation?: string
}

export interface UpdatePoemInput {
  title?: string
  content?: string
  author?: string
  authorType?: AuthorType
  tags?: string[]
  mood?: string
  imageUrl?: string
  isPublic?: boolean
  sourceCitation?: string
}
