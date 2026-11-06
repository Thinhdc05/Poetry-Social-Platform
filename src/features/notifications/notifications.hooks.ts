import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'
import { useAuth } from '../auth'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from './notifications.api'
import type { NotificationItem } from './notifications.types'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }

    try {
      const data = await getNotifications(user.id)
      setNotifications(data)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Lắng nghe Realtime qua Supabase WebSocket
  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) return

    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          if (!payload.new) return
          const raw = payload.new as {
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

          const newItem: NotificationItem = {
            id: raw.id,
            recipientId: raw.recipient_id,
            actorId: raw.actor_id || undefined,
            actorName: raw.actor_name,
            actorAvatar: raw.actor_avatar || '📜',
            type: raw.type === 'like' ? 'like' : raw.type === 'admin' ? 'admin' : 'comment',
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

          setNotifications((prev) => {
            if (prev.some((n) => n.id === newItem.id)) return prev
            return [newItem, ...prev].slice(0, 50)
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      if (user?.id) {
        await markNotificationAsRead(id, user.id)
      }
    },
    [user?.id]
  )

  const handleMarkAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    if (user?.id) {
      await markAllNotificationsAsRead(user.id)
    }
  }, [user?.id])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refetch: loadNotifications,
  }
}
