import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'
import type { AdminStats, AdminPoemItem, AdminReportItem, ImportPoemInput, ImportResult } from './admin.types'

interface RawAdminPoem {
  id: string
  title: string
  content: string
  author: string | null
  author_id: string
  is_public: boolean | null
  created_at: string
  likes_count: number | null
  views_count: number | null
  profiles?: { full_name?: string | null; display_name?: string | null } | { full_name?: string | null; display_name?: string | null }[] | null
}

interface RawAdminReport {
  id: string
  poem_id: string
  reporter_id: string | null
  reason: string
  details?: string | null
  status: 'pending' | 'reviewed' | 'resolved' | 'rejected'
  created_at: string
  poems?: { title?: string | null } | null
  profiles?: { full_name?: string | null; display_name?: string | null } | null
}

export async function getAdminStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured) {
    return { totalPoems: 0, totalUsers: 0, totalComments: 0, pendingReports: 0 }
  }

  try {
    const [poemsRes, usersRes, commentsRes, reportsRes] = await Promise.all([
      supabase.from('poems').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('comments').select('id', { count: 'exact', head: true }),
      supabase.from('poem_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ])

    return {
      totalPoems: poemsRes.count || 0,
      totalUsers: usersRes.count || 0,
      totalComments: commentsRes.count || 0,
      pendingReports: reportsRes.count || 0,
    }
  } catch (err) {
    console.error('Lỗi khi lấy thống kê admin:', err)
    return { totalPoems: 0, totalUsers: 0, totalComments: 0, pendingReports: 0 }
  }
}

export async function getAdminPoems(search?: string): Promise<AdminPoemItem[]> {
  if (!isSupabaseConfigured) return []

  try {
    let query = supabase
      .from('poems')
      .select('id, title, content, author, author_id, is_public, created_at, likes_count, views_count, profiles!author_id(full_name, display_name)')
      .order('created_at', { ascending: false })

    if (search && search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`)
    }

    const { data, error } = await query

    if (error || !data) {
      console.error('Lỗi khi tải danh sách bài thơ admin:', error)
      return []
    }

    const rawList = data as unknown as RawAdminPoem[]

    return rawList.map((item) => {
      let authorName = item.author?.trim()
      if (!authorName) {
        if (Array.isArray(item.profiles) && item.profiles[0]) {
          authorName = item.profiles[0].full_name || item.profiles[0].display_name || undefined
        } else if (item.profiles && !Array.isArray(item.profiles)) {
          authorName = item.profiles.full_name || item.profiles.display_name || undefined
        }
      }
      return {
        id: item.id,
        title: item.title,
        content: item.content,
        author: authorName || 'Khuyết danh',
        authorId: item.author_id,
        isPublic: item.is_public !== false,
        createdAt: item.created_at,
        likesCount: item.likes_count || 0,
        viewsCount: item.views_count || 0,
      }
    })
  } catch (err) {
    console.error('Không thể lấy danh sách bài thơ admin:', err)
    return []
  }
}

export async function togglePoemVisibility(poemId: string, isPublic: boolean): Promise<void> {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.from('poems').update({ is_public: isPublic }).eq('id', poemId)
  if (error) throw error
}

export async function deletePoemAsAdmin(poemId: string): Promise<void> {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.from('poems').delete().eq('id', poemId)
  if (error) throw error
}

export async function getAdminReports(): Promise<AdminReportItem[]> {
  if (!isSupabaseConfigured) return []

  try {
    const { data, error } = await supabase
      .from('poem_reports')
      .select('id, poem_id, reporter_id, reason, details, status, created_at, poems(title), profiles!reporter_id(full_name, display_name)')
      .order('created_at', { ascending: false })

    if (error || !data) {
      return []
    }

    const rawReports = data as unknown as RawAdminReport[]

    return rawReports.map((item) => ({
      id: item.id,
      poemId: item.poem_id,
      poemTitle: item.poems?.title || 'Bài thơ đã bị gỡ hoặc không tồn tại',
      reporterId: item.reporter_id,
      reporterName: item.profiles?.full_name || item.profiles?.display_name || 'Độc giả ẩn danh',
      reason: item.reason,
      details: item.details,
      status: item.status || 'pending',
      createdAt: item.created_at,
    }))
  } catch (err) {
    console.error('Lỗi khi lấy danh sách báo cáo:', err)
    return []
  }
}

export async function updateReportStatus(
  reportId: string,
  status: 'reviewed' | 'resolved' | 'rejected'
): Promise<void> {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.from('poem_reports').update({ status }).eq('id', reportId)
  if (error) throw error
}

export async function importPoemsBulk(poems: ImportPoemInput[], adminUserId: string): Promise<ImportResult> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase chưa được cấu hình.')
  }

  let successCount = 0
  let failedCount = 0
  const errors: string[] = []

  for (let i = 0; i < poems.length; i++) {
    const item = poems[i]
    try {
      const payload = {
        title: item.title.trim(),
        content: item.content.trim(),
        author: item.author ? item.author.trim() : null,
        author_type: item.author ? 'collected' : 'original',
        author_id: adminUserId,
        mood: 'Bình yên',
        is_public: true,
      }

      const { data, error } = await supabase.from('poems').insert(payload).select('id').single()
      if (error) throw error

      if (data?.id && item.tags && item.tags.length > 0) {
        for (const rawTag of item.tags) {
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
                .upsert({ poem_id: data.id, tag_id: tagRow.id }, { onConflict: 'poem_id,tag_id' })
            }
          } catch {
            // Bỏ qua lỗi tag phụ
          }
        }
      }

      successCount++
    } catch (err: unknown) {
      failedCount++
      const message = err instanceof Error ? err.message : String(err)
      errors.push(`Bài "${item.title}": ${message}`)
    }
  }

  return {
    total: poems.length,
    successCount,
    failedCount,
    errors,
  }
}

