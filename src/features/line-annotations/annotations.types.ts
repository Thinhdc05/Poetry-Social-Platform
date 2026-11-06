export interface LineNote {
  id: string
  poemId: string
  lineIndex: number
  lineText: string
  authorName: string
  authorId?: string
  content: string
  createdAt: string
  isPrivate?: boolean
}

export interface SavedVerseHighlight {
  id: string
  poemId: string
  poemTitle: string
  poemAuthor: string
  lineIndex: number
  lineText: string
  savedAt: string
}
