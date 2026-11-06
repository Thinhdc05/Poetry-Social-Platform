import { createClient } from '@supabase/supabase-js'

function normalizeSupabaseUrl(url?: string): string {
  if (!url) return ''
  // Tự động gỡ bỏ /rest/v1 hoặc dấu gạch chéo cuối nếu người dùng vô tình copy nhầm link REST URL
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const normalizedUrl = normalizeSupabaseUrl(rawUrl)

export const isSupabaseConfigured = Boolean(normalizedUrl && rawKey)

const supabaseUrl = normalizedUrl || 'https://placeholder-project.supabase.co'
const supabaseAnonKey = rawKey ? rawKey.trim() : 'placeholder-anon-key'

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Chưa cấu hình VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong file .env.local! Hệ thống đang hoạt động ở chế độ dữ liệu mẫu.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
