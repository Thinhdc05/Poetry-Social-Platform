export interface AdminStats {
  totalPoems: number
  totalUsers: number
  totalComments: number
  pendingReports: number
}

export interface AdminPoemItem {
  id: string
  title: string
  content: string
  author: string
  authorId: string
  isPublic: boolean
  createdAt: string
  likesCount: number
  viewsCount: number
}

export interface AdminReportItem {
  id: string
  poemId: string
  poemTitle: string
  reporterId: string | null
  reporterName?: string
  reason: string
  details?: string | null
  status: 'pending' | 'reviewed' | 'resolved' | 'rejected'
  createdAt: string
}

export interface ImportPoemInput {
  title: string
  content: string
  author?: string
  tags?: string[]
}

export interface ImportResult {
  total: number
  successCount: number
  failedCount: number
  errors: string[]
}

