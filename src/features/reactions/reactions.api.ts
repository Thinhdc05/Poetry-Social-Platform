import { supabase } from '../../lib/supabaseClient'
import { createNotification } from '../notifications'
import type { ReactionType, ReactionCounts } from './reactions.types'

const LOCAL_STORAGE_PREFIX = 'tho_moc_reactions_'

interface LocalStoredReactions {
  counts: ReactionCounts
  userReaction: ReactionType | null
}

function getLocalReactions(poemId: string): LocalStoredReactions {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${poemId}`)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return {
    counts: { heart: 0, touch: 0, sympathy: 0, total: 0 },
    userReaction: null,
  }
}

function saveLocalReactions(poemId: string, data: LocalStoredReactions) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${poemId}`, JSON.stringify(data))
  } catch {
    // ignore
  }
}

/**
 * Lấy danh sách và thống kê cảm xúc của bài thơ từ Supabase
 */
export async function fetchPoemReactions(
  poemId: string,
  currentUserId?: string
): Promise<{ counts: ReactionCounts; userReaction: ReactionType | null }> {
  try {
    const { data, error } = await supabase
      .from('poem_likes')
      .select('reaction_type, user_id')
      .eq('poem_id', poemId)

    if (error) {
      console.warn('Supabase poem_likes query fallback:', error.message)
      return getLocalReactions(poemId)
    }

    const counts: ReactionCounts = {
      heart: 0,
      touch: 0,
      sympathy: 0,
      total: 0,
    }

    let userReaction: ReactionType | null = null

    if (data && Array.isArray(data)) {
      data.forEach((row: { reaction_type: string; user_id: string }) => {
        const type = row.reaction_type as ReactionType
        if (type === 'heart' || type === 'touch' || type === 'sympathy') {
          counts[type] += 1
          counts.total += 1
        }
        if (currentUserId && row.user_id === currentUserId) {
          userReaction = type
        }
      })
    }

    // Lưu vào cache local
    saveLocalReactions(poemId, { counts, userReaction })
    return { counts, userReaction }
  } catch (err) {
    console.warn('Lỗi khi tải cảm xúc bài thơ:', err)
    return getLocalReactions(poemId)
  }
}

/**
 * Thao tác gửi hoặc đổi cảm xúc (Model A: Chọn 1 trong 3, bấm lại thì hủy)
 */
export async function togglePoemReaction(
  poemId: string,
  userId: string,
  targetType: ReactionType,
  currentReaction: ReactionType | null
): Promise<{ nextReaction: ReactionType | null; countsDelta: Partial<Record<ReactionType, number>> }> {
  // Trường hợp 1: Đang chọn chính nút đó -> HỦY CẢM XÚC (DELETE)
  if (currentReaction === targetType) {
    try {
      const { error } = await supabase
        .from('poem_likes')
        .delete()
        .eq('poem_id', poemId)
        .eq('user_id', userId)

      if (error) {
        console.warn('Supabase delete poem_likes error, fallback local:', error.message)
      }
    } catch (err) {
      console.warn('Network error when deleting reaction:', err)
    }

    return {
      nextReaction: null,
      countsDelta: { [targetType]: -1 },
    }
  }

  // Trường hợp 2: Chưa chọn hoặc đang chọn cảm xúc khác -> ĐỔI / THÊM MỚI (UPSERT)
  try {
    const { error } = await supabase.from('poem_likes').upsert(
      {
        poem_id: poemId,
        user_id: userId,
        reaction_type: targetType,
      },
      { onConflict: 'user_id,poem_id' }
    )

    if (error) {
      console.warn('Supabase upsert poem_likes error, fallback local:', error.message)
    } else {
      // Gửi thông báo tâm đắc tới tác giả bài thơ
      try {
        const { data: poemData } = await supabase
          .from('poems')
          .select('author_id, title')
          .eq('id', poemId)
          .maybeSingle()

        if (poemData?.author_id && poemData.author_id !== userId) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('full_name, display_name, avatar_url')
            .eq('id', userId)
            .maybeSingle()

          const actorName =
            userProfile?.full_name || userProfile?.display_name || 'Một thi hữu'

          await createNotification({
            recipientId: poemData.author_id,
            actorId: userId,
            actorName,
            actorAvatar: userProfile?.avatar_url || '❤️',
            type: 'like',
            poemId,
            poemTitle: poemData.title,
            message: 'đã bày tỏ sự tâm đắc với thi phẩm của bạn',
          })
        }
      } catch {
        // Ignored
      }
    }
  } catch (err) {
    console.warn('Network error when upserting reaction:', err)
  }

  const countsDelta: Partial<Record<ReactionType, number>> = {
    [targetType]: 1,
  }
  if (currentReaction) {
    countsDelta[currentReaction] = -1
  }

  return {
    nextReaction: targetType,
    countsDelta,
  }
}

