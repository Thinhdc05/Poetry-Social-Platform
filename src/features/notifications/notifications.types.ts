export type NotificationType = 'comment' | 'like' | 'admin'

export interface NotificationItem {
  id: string
  recipientId: string
  actorId?: string
  actorName: string
  actorAvatar?: string
  type: NotificationType
  poemId?: string
  poemTitle?: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface CreateNotificationInput {
  recipientId: string
  actorId?: string
  actorName: string
  actorAvatar?: string
  type: NotificationType
  poemId?: string
  poemTitle?: string
  message: string
}

