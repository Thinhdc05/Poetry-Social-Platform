import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'
import type { NotificationItem, CreateNotificationInput } from './notifications.types'

const LOCAL_NOTIFICATIONS_KEY = 'tho_moc_local_notifications'

interface RawNotificationItem {
  id: string
  recipient_id: string
  actor_id?: string | null
  actor_name: string
  actor_avatar?: string | null
  type: string
  poem_id?: string | null
  poem_title?: string | null
  message: string
  is_read: boolean
  created_at: string
}

function mapRawNotification(raw: RawNotificationItem): NotificationItem {
  return {
    id: raw.id,
    recipientId: raw.recipient_id,
    actorId: raw.actor_id || undefined,
    actorName: raw.actor_name,
    actorAvatar: raw.actor_avatar || '📜',
    type: (raw.type === 'like' ? 'like' : raw.type === 'admin' ? 'admin' : 'comment'),
    poemId: raw.poem_id || undefined,
    poemTitle: raw.poem_title || undefined,
    message: raw.message,
    isRead: Boolean(raw.is_read),
    createdAt: new Date(raw.created_at).toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }),
  }
}

function getLocalNotifications(userId: string): NotificationItem[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_NOTIFICATIONS_KEY}_${userId}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setLocalNotifications(userId: string, items: NotificationItem[]) {
  try {
    localStorage.setItem(`${LOCAL_NOTIFICATIONS_KEY}_${userId}`, JSON.stringify(items))
  } catch {
    // Không làm gián đoạn UI
  }
}

/**
 * Lấy danh sách thông báo của người dùng từ Supabase (fallback sang localStorage)
 */
export async function getNotifications(userId: string, limit = 30): Promise<NotificationItem[]> {
  if (!isSupabaseConfigured) {
    return getLocalNotifications(userId)
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, recipient_id, actor_id, actor_name, actor_avatar, type, poem_id, poem_title, message, is_read, created_at')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) {
      return getLocalNotifications(userId)
    }

    const items = (data as unknown as RawNotificationItem[]).map(mapRawNotification)
    setLocalNotifications(userId, items)
    return items
  } catch {
    return getLocalNotifications(userId)
  }
}

/**
 * Đánh dấu 1 thông báo đã đọc
 */
export async function markNotificationAsRead(id: string, userId?: string): Promise<void> {
  if (userId) {
    const local = getLocalNotifications(userId)
    const updated = local.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    setLocalNotifications(userId, updated)
  }

  if (!isSupabaseConfigured) return

  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
  } catch {
    // Ignored
  }
}

/**
 * Đánh dấu TẤT CẢ thông báo đã đọc
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const local = getLocalNotifications(userId)
  const updated = local.map((n) => ({ ...n, isRead: true }))
  setLocalNotifications(userId, updated)

  if (!isSupabaseConfigured) return

  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('is_read', false)
  } catch {
    // Ignored
  }
}

/**
 * Tạo thông báo mới (gọi ngầm khi người dùng tương tác bình luận/thả tim)
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<NotificationItem | null> {
  // Không tự gửi thông báo cho chính mình
  if (input.actorId && input.actorId === input.recipientId) {
    return null
  }

  const tempItem: NotificationItem = {
    id: `notif-${Date.now()}`,
    recipientId: input.recipientId,
    actorId: input.actorId,
    actorName: input.actorName,
    actorAvatar: input.actorAvatar || '📜',
    type: input.type,
    poemId: input.poemId,
    poemTitle: input.poemTitle,
    message: input.message,
    isRead: false,
    createdAt: new Date().toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }),
  }

  // Cập nhật local
  const current = getLocalNotifications(input.recipientId)
  setLocalNotifications(input.recipientId, [tempItem, ...current].slice(0, 50))

  if (!isSupabaseConfigured) return tempItem

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: input.recipientId,
        actor_id: input.actorId || null,
        actor_name: input.actorName,
        actor_avatar: input.actorAvatar || '📜',
        type: input.type,
        poem_id: input.poemId || null,
        poem_title: input.poemTitle || null,
        message: input.message,
      })
      .select('id, recipient_id, actor_id, actor_name, actor_avatar, type, poem_id, poem_title, message, is_read, created_at')
      .single()

    if (error || !data) return tempItem

    return mapRawNotification(data as unknown as RawNotificationItem)
  } catch {
    return tempItem
  }
}

