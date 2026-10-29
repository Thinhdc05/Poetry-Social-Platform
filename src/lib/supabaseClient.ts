import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Thiếu biến môi trường Supabase! Vui lòng kiểm tra lại VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong file .env.local',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
