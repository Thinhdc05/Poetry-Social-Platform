import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'
import type { Poem, CreatePoemInput, UpdatePoemInput } from './poems.types'

interface RawPoemItem {
  id: string
  title: string
  content: string
  author?: string | null
  author_type?: string | null
  author_id?: string
  mood?: string | null
  image_url?: string | null
  is_public?: boolean | null
  source_citation?: string | null
  likes_count?: number | null
  created_at: string
  profiles?:
    | { full_name?: string | null; display_name?: string | null }
    | { full_name?: string | null; display_name?: string | null }[]
    | null
  poem_tags?: { tags?: { name?: string | null } | null }[] | null
}

interface PoemUpdatePayload {
  updated_at: string
  title?: string
  content?: string
  author?: string
  author_type?: string
  mood?: string
  image_url?: string | null
  is_public?: boolean
  source_citation?: string | null
}

function mapRawPoem(item: RawPoemItem): Poem {
  const normalizedContent = (item.content || '').replace(/\\n/g, '\n')
  const words = normalizedContent.split(/\s+/).length

  let curatorName: string | undefined = undefined
  if (item.profiles) {
    if (Array.isArray(item.profiles) && item.profiles.length > 0) {
      curatorName = item.profiles[0]?.full_name || item.profiles[0]?.display_name || undefined
    } else if (!Array.isArray(item.profiles)) {
      curatorName = item.profiles.full_name || item.profiles.display_name || undefined
    }
  }

  const isCollected = item.author_type === 'collected'
  let authorName = item.author?.trim() || ''

  if (!authorName) {
    authorName = curatorName || 'Khuyết danh'
  }

  const extractedTags: string[] = []
  if (item.poem_tags && Array.isArray(item.poem_tags)) {
    item.poem_tags.forEach((pt) => {
      if (pt?.tags?.name) {
        extractedTags.push(pt.tags.name)
      }
    })
  }
  if (item.mood && !extractedTags.includes(item.mood)) {
    extractedTags.unshift(item.mood)
  }

  return {
    id: item.id,
    title: item.title,
    content: normalizedContent,
    author: authorName,
    authorType: isCollected ? 'collected' : 'original',
    curatorName: isCollected ? curatorName : undefined,
    authorId: item.author_id,
    createdAt: new Date(item.created_at).toLocaleDateString('vi-VN'),
    excerpt: normalizedContent.split('\n').slice(0, 4).join('\n'),
    imageUrl: item.image_url ?? undefined,
    readingTimeMinutes: Math.max(1, Math.ceil(words / 100)),
    mood: item.mood || 'Bình yên',
    tags: extractedTags,
    likesCount: item.likes_count || 0,
    isPublic: item.is_public !== false,
    sourceCitation: item.source_citation || undefined,
  }
}

// Lấy danh sách toàn bộ bài thơ từ Supabase (100% dữ liệu thật)
export async function getPoems(): Promise<Poem[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  try {
    // 1. Truy vấn đầy đủ các cột mới kèm tags
    const resWithProfile = await supabase
      .from('poems')
      .select('id, title, content, author, author_type, mood, author_id, image_url, is_public, source_citation, likes_count, created_at, profiles!author_id(full_name, display_name), poem_tags(tags(name))')
      .order('created_at', { ascending: false })

    if (!resWithProfile.error && resWithProfile.data) {
      return (resWithProfile.data as unknown as RawPoemItem[]).map(mapRawPoem)
    }

    // 2. Fallback nếu DB chưa chạy migration cột mới
    const fallbackProfile = await supabase
      .from('poems')
      .select('id, title, content, author, mood, author_id, image_url, created_at, profiles!author_id(full_name, display_name)')
      .order('created_at', { ascending: false })

    if (!fallbackProfile.error && fallbackProfile.data) {
      return (fallbackProfile.data as unknown as RawPoemItem[]).map(mapRawPoem)
    }

    // 3. Fallback an toàn tối đa: Truy vấn trực tiếp bảng poems không join
    const fallbackDirect = await supabase
      .from('poems')
      .select('id, title, content, author, mood, author_id, image_url, created_at')
      .order('created_at', { ascending: false })

    if (fallbackDirect.error || !fallbackDirect.data) {
      console.error('Lỗi khi truy vấn bảng poems:', fallbackDirect.error?.message)
      return []
    }

    return (fallbackDirect.data as unknown as RawPoemItem[]).map(mapRawPoem)
  } catch (err) {
    console.error('Không thể kết nối tới Supabase:', err)
    return []
  }
}

// Lấy chi tiết bài thơ theo ID từ Supabase
export async function getPoemById(id: string): Promise<Poem | undefined> {
  if (!isSupabaseConfigured) return undefined

  try {
    const resWithProfile = await supabase
      .from('poems')
      .select('id, title, content, author, author_type, mood, author_id, image_url, is_public, source_citation, likes_count, created_at, profiles!author_id(full_name, display_name), poem_tags(tags(name))')
      .eq('id', id)
      .single()

    if (!resWithProfile.error && resWithProfile.data) {
      return mapRawPoem(resWithProfile.data as unknown as RawPoemItem)
    }

    const fallbackProfile = await supabase
      .from('poems')
      .select('id, title, content, author, mood, author_id, image_url, created_at, profiles!author_id(full_name, display_name)')
      .eq('id', id)
      .single()

    if (!fallbackProfile.error && fallbackProfile.data) {
      return mapRawPoem(fallbackProfile.data as unknown as RawPoemItem)
    }

    const fallbackDirect = await supabase
      .from('poems')
      .select('id, title, content, author, mood, author_id, image_url, created_at')
      .eq('id', id)
      .single()

    if (fallbackDirect.error || !fallbackDirect.data) return undefined
    return mapRawPoem(fallbackDirect.data as unknown as RawPoemItem)
  } catch {
    return undefined
  }
}

// Tạo bài thơ mới trong Supabase
export async function createPoem(input: CreatePoemInput, userId: string): Promise<Poem> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase chưa được cấu hình. Vui lòng kiểm tra .env.local')
  }

  const payload: Record<string, unknown> = {
    title: input.title.trim(),
    content: input.content.trim(),
    author_id: userId,
    mood: input.mood || 'Bình yên',
    author: input.author ? input.author.trim() : null,
    author_type: input.authorType || 'original',
    image_url: input.imageUrl || null,
    is_public: input.isPublic !== false,
    source_citation: input.sourceCitation ? input.sourceCitation.trim() : null,
  }

  const { data, error } = await supabase
    .from('poems')
    .insert(payload)
    .select('id, title, content, author, author_type, mood, author_id, image_url, is_public, source_citation, likes_count, created_at')
    .single()

  if (error) {
    // Nếu Supabase chưa chạy migration (thiếu cột is_public hoặc author_type)
    delete payload.is_public
    delete payload.source_citation
    delete payload.author_type

    const fallbackRes = await supabase
      .from('poems')
      .insert(payload)
      .select('id, title, content, author, mood, author_id, image_url, created_at')
      .single()

    if (fallbackRes.error) {
      console.error('Lỗi khi thêm bài thơ vào Supabase:', fallbackRes.error)
      throw fallbackRes.error
    }
    const createdFallback = mapRawPoem(fallbackRes.data as unknown as RawPoemItem)
    return createdFallback
  }

  const created = mapRawPoem(data as unknown as RawPoemItem)

  // Đồng bộ thẻ thơ vào bảng tags và poem_tags nếu có
  if (input.tags && input.tags.length > 0 && created.id) {
    for (const rawTag of input.tags) {
      const clean = rawTag.trim().replace(/^#/, '')
      if (!clean) continue
      const slug = clean.toLowerCase().replace(/[^a-z0-9à-ỹ]/g, '-')
      try {
        const { data: tagRow } = await supabase
          .from('tags')
          .upsert({ name: clean, slug }, { onConflict: 'slug' })
          .select('id')
          .single()

        if (tagRow?.id) {
          await supabase
            .from('poem_tags')
            .upsert({ poem_id: created.id, tag_id: tagRow.id }, { onConflict: 'poem_id,tag_id' })
        }
      } catch {
        // bỏ qua nếu bảng chưa sẵn sàng
      }
    }
  }

  return created
}

// Cập nhật bài thơ
export async function updatePoem(id: string, input: UpdatePoemInput): Promise<void> {
  if (!isSupabaseConfigured) return

  const updates: PoemUpdatePayload = {
    updated_at: new Date().toISOString(),
  }
  if (input.title !== undefined) updates.title = input.title.trim()
  if (input.content !== undefined) updates.content = input.content.trim()
  if (input.author !== undefined) updates.author = input.author.trim()
  if (input.authorType !== undefined) updates.author_type = input.authorType
  if (input.mood !== undefined) updates.mood = input.mood
  if (input.imageUrl !== undefined) updates.image_url = input.imageUrl
  if (input.isPublic !== undefined) updates.is_public = input.isPublic
  if (input.sourceCitation !== undefined) updates.source_citation = input.sourceCitation

  const { error } = await supabase.from('poems').update(updates).eq('id', id)
  if (error) {
    delete updates.author_type
    delete updates.is_public
    delete updates.source_citation
    const { error: retryError } = await supabase.from('poems').update(updates).eq('id', id)
    if (retryError) throw retryError
  }
}

// Xóa bài thơ
export async function deletePoem(id: string): Promise<void> {
  if (!isSupabaseConfigured) return

  const { error } = await supabase.from('poems').delete().eq('id', id)
  if (error) throw error
}

// Báo cáo bài thơ (Bản quyền / Vi phạm)
export async function reportPoem(
  poemId: string,
  reason: string,
  details?: string,
  reporterId?: string
): Promise<void> {
  if (!isSupabaseConfigured) return

  try {
    await supabase.from('poem_reports').insert({
      poem_id: poemId,
      reporter_id: reporterId || null,
      reason,
      details: details || null,
    })
  } catch (err) {
    console.warn('Bảng poem_reports chưa được khởi tạo trên DB:', err)
  }
}
