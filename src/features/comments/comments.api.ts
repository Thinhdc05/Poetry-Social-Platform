import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'
import type { Comment, CreateCommentInput } from './comments.types'

interface RawCommentItem {
  id: string
  poem_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: { full_name?: string | null; avatar_url?: string | null } | { full_name?: string | null; avatar_url?: string | null }[] | null
}

function mapRawComment(item: RawCommentItem): Comment {
  let authorName = 'Khách thơ'
  let avatarUrl: string | undefined = undefined

  if (item.profiles) {
    if (Array.isArray(item.profiles) && item.profiles.length > 0) {
      authorName = item.profiles[0]?.full_name || 'Khách thơ'
      avatarUrl = item.profiles[0]?.avatar_url ?? undefined
    } else if (!Array.isArray(item.profiles)) {
      authorName = item.profiles.full_name || 'Khách thơ'
      avatarUrl = item.profiles.avatar_url ?? undefined
    }
  }

  return {
    id: item.id,
    poemId: item.poem_id,
    userId: item.user_id,
    content: item.content,
    createdAt: new Date(item.created_at).toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }),
    authorName,
    authorAvatar: avatarUrl,
  }
}

export async function getCommentsByPoemId(poemId: string): Promise<Comment[]> {
  if (!isSupabaseConfigured) return []

  try {
    const resWithProfile = await supabase
      .from('comments')
      .select('id, poem_id, user_id, content, created_at, profiles!user_id(full_name, avatar_url)')
      .eq('poem_id', poemId)
      .order('created_at', { ascending: true })

    if (!resWithProfile.error && resWithProfile.data) {
      return (resWithProfile.data as unknown as RawCommentItem[]).map(mapRawComment)
    }

    console.warn('Lỗi lấy comments có profile, thử lấy comments thuần túy:', resWithProfile.error?.message)
    const fallback = await supabase
      .from('comments')
      .select('id, poem_id, user_id, content, created_at')
      .eq('poem_id', poemId)
      .order('created_at', { ascending: true })

    if (fallback.error || !fallback.data) return []
    return (fallback.data as unknown as RawCommentItem[]).map(mapRawComment)
  } catch {
    return []
  }
}

export async function createComment(
  input: CreateCommentInput,
  userId: string
): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      poem_id: input.poemId,
      user_id: userId,
      content: input.content.trim(),
    })
    .select('id, poem_id, user_id, content, created_at')
    .single()

  if (error) throw error

  return {
    id: data.id,
    poemId: data.poem_id,
    userId: data.user_id,
    content: data.content,
    createdAt: new Date(data.created_at).toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }),
    authorName: 'Bạn thơ',
    authorAvatar: undefined,
  }
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) throw error
}
