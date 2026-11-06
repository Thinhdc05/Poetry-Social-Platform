import { useState, useEffect, useCallback, useRef } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'
import { useAuth, getProfile } from '../auth'
import type { OnlinePoet, LoungeMessage } from './presence.types'
import { getLoungeMessages, createLoungeMessage } from './lounge.api'

// ==========================================
// SINGLETON PRESENCE MANAGER TOÀN ỨNG DỤNG
// ==========================================
let sharedPresenceChannel: RealtimeChannel | null = null
let sharedOnlinePoets: OnlinePoet[] = []
let activeListenersCount = 0
const presenceListeners = new Set<(poets: OnlinePoet[]) => void>()

function broadcastPresence(poets: OnlinePoet[]) {
  sharedOnlinePoets = poets
  presenceListeners.forEach((listener) => {
    try {
      listener(poets)
    } catch {
      // ignore
    }
  })
}

function getOrInitPresenceChannel(myId: string, currentPenName: string, currentSeal: string) {
  if (!isSupabaseConfigured) return null

  if (sharedPresenceChannel) {
    return sharedPresenceChannel
  }

  const channel = supabase.channel('tho-moc-presence', {
    config: {
      presence: {
        key: myId,
      },
    },
  })

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<OnlinePoet>()
      const list: OnlinePoet[] = []
      Object.values(state).forEach((presences) => {
        presences.forEach((p) => {
          if (!list.some((item) => item.id === p.id)) {
            list.push(p)
          }
        })
      })
      if (list.length > 0) {
        broadcastPresence(list)
      }
    })
    .on('presence', { event: 'join' }, ({ newPresences }) => {
      if (Array.isArray(newPresences)) {
        const nextList = [...sharedOnlinePoets]
        newPresences.forEach((raw) => {
          const p = raw as unknown as OnlinePoet
          if (p && p.id && !nextList.some((item) => item.id === p.id)) {
            nextList.push(p)
          }
        })
        broadcastPresence(nextList)
      }
    })
    .on('presence', { event: 'leave' }, ({ leftPresences }) => {
      if (Array.isArray(leftPresences)) {
        const leftIds = new Set(leftPresences.map((raw) => (raw as unknown as OnlinePoet).id))
        const nextList = sharedOnlinePoets.filter((p) => !leftIds.has(p.id))
        if (nextList.length > 0) {
          broadcastPresence(nextList)
        }
      }
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        try {
          await channel.track({
            id: myId,
            penName: currentPenName,
            seal: currentSeal,
            status: 'Đang thưởng ngoạn thi đàn',
            joinedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          })
        } catch {
          // ignore
        }
      }
    })

  sharedPresenceChannel = channel
  return channel
}

export function useOnlinePresence() {
  const { user, profile } = useAuth()
  const [onlinePoets, setOnlinePoets] = useState<OnlinePoet[]>(() => {
    if (sharedOnlinePoets.length > 0) return sharedOnlinePoets
    const name = profile?.fullName || user?.user_metadata?.full_name || 'Bạn Thơ'
    return [
      {
        id: user?.id || 'current-poet',
        penName: name,
        seal: profile?.avatarUrl || user?.user_metadata?.avatar_url || name.charAt(0).toUpperCase() || '📜',
        status: 'Đang thưởng ngoạn thi đàn',
        joinedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]
  })
  const [myStatus, setMyStatus] = useState('Đang thưởng ngoạn thi đàn')

  useEffect(() => {
    const emailPrefix = user?.email?.split('@')[0] || ''
    const metaName = (
      (user?.user_metadata?.full_name as string) ||
      (user?.user_metadata?.display_name as string) ||
      ''
    ).trim()

    let currentPenName =
      profile?.fullName && profile.fullName.toLowerCase() !== emailPrefix.toLowerCase()
        ? profile.fullName
        : metaName || profile?.fullName || emailPrefix || 'Khách Thơ'

    let currentSeal =
      profile?.avatarUrl || user?.user_metadata?.avatar_url || currentPenName.charAt(0).toUpperCase() || '📜'

    let guestId = 'current-poet'
    try {
      guestId = window.sessionStorage.getItem('tho_moc_guest_id') || ''
      if (!guestId) {
        guestId = 'guest-' + Math.random().toString(36).substring(2, 9)
        window.sessionStorage.setItem('tho_moc_guest_id', guestId)
      }
    } catch {
      guestId = 'guest-' + Math.random().toString(36).substring(2, 9)
    }

    const myId = user?.id || guestId

    if (user?.id) {
      getProfile(user.id).then((p) => {
        if (p?.fullName) {
          if (!(metaName && emailPrefix && p.fullName.toLowerCase() === emailPrefix.toLowerCase())) {
            currentPenName = p.fullName
            currentSeal = p.avatarUrl || p.fullName.charAt(0).toUpperCase()
          }
        }
      })
    }

    const listener = (poets: OnlinePoet[]) => {
      if (poets.length > 0) {
        setOnlinePoets(poets)
      }
    }

    presenceListeners.add(listener)
    activeListenersCount++

    // Khởi tạo kênh nếu chưa có
    const channel = getOrInitPresenceChannel(myId, currentPenName, currentSeal)

    // Nếu đã đăng nhập, cập nhật lại trạng thái người dùng
    if (channel && user?.id) {
      channel
        .track({
          id: myId,
          penName: currentPenName,
          seal: currentSeal,
          status: myStatus,
          joinedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        })
        .catch(() => {})
    }

    return () => {
      presenceListeners.delete(listener)
      activeListenersCount--
    }
  }, [user, profile, myStatus])

  const updateStatus = useCallback(
    (newStatus: string) => {
      setMyStatus(newStatus)
      if (sharedPresenceChannel && user) {
        const emailPrefix = user.email?.split('@')[0] || ''
        const metaName = (
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.display_name as string) ||
          ''
        ).trim()
        const penName =
          profile?.fullName && profile.fullName.toLowerCase() !== emailPrefix.toLowerCase()
            ? profile.fullName
            : metaName || profile?.fullName || emailPrefix || 'Khách Thơ'
        const seal = profile?.avatarUrl || user.user_metadata?.avatar_url || penName.charAt(0).toUpperCase()

        sharedPresenceChannel
          .track({
            id: user.id,
            penName,
            seal,
            status: newStatus,
            joinedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          })
          .catch(() => {})
      }
    },
    [user, profile]
  )

  const effectiveCount = Math.max(1, onlinePoets.length)

  return {
    onlinePoets,
    count: effectiveCount,
    myStatus,
    updateStatus,
  }
}

export function usePoeticLounge() {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState<LoungeMessage[]>([])
  const [loading, setLoading] = useState(true)

  // 1. Tải lịch sử tin nhắn thực tế từ Database
  useEffect(() => {
    let isMounted = true

    getLoungeMessages().then((data) => {
      if (isMounted) {
        setMessages(data)
        setLoading(false)
      }
    })

    // 2. Lắng nghe thay đổi Realtime từ bảng lounge_messages qua WebSockets
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel('tho-moc-lounge-db')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lounge_messages',
        },
        (payload) => {
          if (!isMounted || !payload.new) return
          const raw = payload.new as {
            id: string
            user_id?: string | null
            sender_name: string
            sender_seal?: string | null
            content: string
            msg_type?: string | null
            created_at: string
          }

          const newMsg: LoungeMessage = {
            id: raw.id,
            senderId: raw.user_id || `guest-${raw.id.substring(0, 6)}`,
            senderName: raw.sender_name,
            senderSeal: raw.sender_seal || '📜',
            content: raw.content,
            createdAt: new Date(raw.created_at).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            type: (raw.msg_type === 'verse' ? 'verse' : 'chat') as 'chat' | 'verse',
          }

          setMessages((prev) => {
            // Tránh thêm trùng lặp nếu đã thêm qua optimistic update
            if (prev.some((m) => m.id === newMsg.id)) {
              return prev
            }
            return [newMsg, ...prev].slice(0, 50)
          })
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  // 3. Hàm gửi tin nhắn lưu thẳng vào Database
  const sendMessage = useCallback(
    async (content: string, type: 'chat' | 'verse' = 'chat') => {
      if (!content.trim()) return

      const myId = user?.id || undefined
      const emailPrefix = user?.email?.split('@')[0] || ''
      const metaName = (
        (user?.user_metadata?.full_name as string) ||
        (user?.user_metadata?.display_name as string) ||
        ''
      ).trim()

      const myName =
        profile?.fullName && profile.fullName.toLowerCase() !== emailPrefix.toLowerCase()
          ? profile.fullName
          : metaName || profile?.fullName || emailPrefix || 'Khách Thơ'

      const mySeal =
        profile?.avatarUrl ||
        user?.user_metadata?.avatar_url ||
        '📜'

      // Cập nhật giao diện tức thì (Optimistic update)
      const tempId = `temp-${Date.now()}`
      const optimisticMsg: LoungeMessage = {
        id: tempId,
        senderId: myId || `guest-${tempId}`,
        senderName: myName,
        senderSeal: mySeal,
        content: content.trim(),
        createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        type,
      }

      setMessages((prev) => [optimisticMsg, ...prev].slice(0, 50))

      // Lưu thực tế vào Database
      const saved = await createLoungeMessage({
        content,
        senderName: myName,
        senderSeal: mySeal,
        type,
        userId: myId,
      })

      // Cập nhật lại ID thật từ database nếu thành công
      if (saved) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? saved : m))
        )
      }
    },
    [user, profile]
  )

  return {
    messages,
    loading,
    sendMessage,
  }
}
