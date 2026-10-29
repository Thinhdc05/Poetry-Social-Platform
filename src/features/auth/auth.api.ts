import { supabase } from '../../lib/supabaseClient'
import type { SignUpInput, SignInInput } from './auth.types'

// Đăng ký tài khoản mới kèm tên bút danh
export async function signUp({ email, password, fullName }: SignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) throw error
  return data
}

// Đăng nhập bằng Email và Password
export async function signIn({ email, password }: SignInInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

// Đăng xuất
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Lấy session hiện tại (nếu còn hạn)
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

// Lấy thông tin User hiện tại
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}
