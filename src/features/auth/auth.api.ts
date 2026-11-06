import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'
import type { SignUpInput, SignInInput, UserProfile, UpdateProfileInput } from './auth.types'

function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Chưa cấu hình Supabase! Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env.local',
    )
  }
}

function cleanEmail(email: string): string {
  // Loại bỏ khoảng trắng thừa, dấu ngoặc kép hoặc ký tự vô hình
  const cleaned = email.trim().replace(/^["']|["']$/g, '').toLowerCase()
  if (cleaned === 'admin') {
    return 'admin@thomoc.vn'
  }
  return cleaned
}

// Đăng ký tài khoản mới kèm tên bút danh
export async function signUp({ email, password, fullName }: SignUpInput) {
  ensureSupabaseConfigured()
  const sanitizedEmail = cleanEmail(email)

  const { data, error } = await supabase.auth.signUp({
    email: sanitizedEmail,
    password,
    options: {
      data: {
        full_name: fullName.trim(),
      },
    },
  })

  if (error) throw error
  return data
}

// Đăng nhập bằng Email và Password
export async function signIn({ email, password }: SignInInput) {
  ensureSupabaseConfigured()
  const sanitizedEmail = cleanEmail(email)

  const { data, error } = await supabase.auth.signInWithPassword({
    email: sanitizedEmail,
    password,
  })

  if (error) throw error
  return data
}

// Đăng xuất
export async function signOut() {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Lấy session hiện tại (nếu còn hạn)
export async function getCurrentSession() {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

// Lấy thông tin User hiện tại
export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

// Lấy thông tin Profile chi tiết từ bảng profiles
export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error || !data) return null

    const rec = data as Record<string, unknown>
    const fullName = (rec.full_name as string) || (rec.display_name as string) || undefined
    const roleRaw = ((rec.role as string) || 'USER').toLowerCase()

    return {
      id: rec.id as string,
      email: '',
      fullName,
      bio: (rec.bio as string) || undefined,
      avatarUrl: (rec.avatar_url as string) || undefined,
      role: roleRaw === 'admin' ? 'admin' : 'user',
    }
  } catch {
    return null
  }
}

// Cập nhật Profile thi nhân (Bút danh, Tiểu sử, Con dấu triện)
export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<void> {
  ensureSupabaseConfigured()

  const updates: { full_name?: string; bio?: string; avatar_url?: string } = {}
  if (input.fullName !== undefined) updates.full_name = input.fullName.trim()
  if (input.bio !== undefined) updates.bio = input.bio.trim()
  if (input.avatarUrl !== undefined) updates.avatar_url = input.avatarUrl.trim()

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates })

  if (error) throw error

  // Đồng thời cập nhật cả metadata trên Supabase Auth để tên cập nhật tức thì trên giao diện
  if (input.fullName !== undefined) {
    await supabase.auth.updateUser({
      data: { full_name: input.fullName.trim() },
    })
  }
}

// Đổi mật khẩu tài khoản
export async function updatePassword(newPassword: string): Promise<void> {
  ensureSupabaseConfigured()

  if (!newPassword || newPassword.length < 6) {
    throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.')
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
}
