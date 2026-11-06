import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'
import type { LoungeMessage } from './presence.types'

interface RawLoungeMessage {
  id: string
  user_id?: string | null
  sender_name: string
  sender_seal?: string | null
  content: string
  msg_type?: string | null
  created_at: string
}

function mapRawLoungeMessage(raw: RawLoungeMessage): LoungeMessage {
  return {
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
}

/**
 * Lấy danh sách tin nhắn đàm đạo gần nhất từ Supabase Postgres
 */
export async function getLoungeMessages(limit = 50): Promise<LoungeMessage[]> {
  if (!isSupabaseConfigured) return []

  try {
    const { data, error } = await supabase
      .from('lounge_messages')
      .select('id, user_id, sender_name, sender_seal, content, msg_type, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) {
      return []
    }

    // Đảo ngược lại để tin nhắn cũ ở trên, tin nhắn mới nhất xuất hiện ở dưới đáy (chuẩn UX Chat)
    return (data as unknown as RawLoungeMessage[]).map(mapRawLoungeMessage).reverse()
  } catch {
    return []
  }
}

/**
 * Gửi tin nhắn mới vào bảng lounge_messages trong Supabase
 */
export async function createLoungeMessage(input: {
  content: string
  senderName: string
  senderSeal: string
  type: 'chat' | 'verse'
  userId?: string
}): Promise<LoungeMessage | null> {
  if (!isSupabaseConfigured) return null

  try {
    const { data, error } = await supabase
      .from('lounge_messages')
      .insert({
        content: input.content.trim(),
        sender_name: input.senderName.trim(),
        sender_seal: input.senderSeal || '📜',
        msg_type: input.type,
        user_id: input.userId || null,
      })
      .select('id, user_id, sender_name, sender_seal, content, msg_type, created_at')
      .single()

    if (error || !data) {
      console.warn('Không thể ghi tin nhắn vào bảng lounge_messages:', error?.message)
      return null
    }

    return mapRawLoungeMessage(data as unknown as RawLoungeMessage)
  } catch (err) {
    console.warn('Lỗi khi gửi tin nhắn trà thất:', err)
    return null
  }
}

