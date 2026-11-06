import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../../features/auth/auth.api'

export function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Vui lòng điền đầy đủ các thông tin.')
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu cần tối thiểu 6 ký tự.')
      return
    }

    try {
      setLoading(true)
      const data = await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      })

      // Nếu Supabase trả về session hoặc user (khi tắt Confirm Email)
      if (data.session) {
        navigate('/', { replace: true })
      } else {
        // Dự án Supabase yêu cầu xác nhận email
        setIsSuccess(true)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra'
      if (message.includes('User already registered')) {
        setError('Email này đã được đăng ký trước đó. Bạn hãy bấm Đăng nhập.')
      } else if (message.includes('is invalid') || message.includes('invalid format')) {
        setError('Địa chỉ email không hợp lệ (hãy kiểm tra xem có thừa dấu ngoặc kép hoặc khoảng trắng không).')
      } else if (message.includes('not authorized')) {
        setError('Dự án Supabase đang bật xác thực email. Bạn nên vào Supabase tắt "Confirm email" để tạo tài khoản trực tiếp.')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-800 dark:text-amber-300 text-xl font-serif">
          ✓
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100">
          Đăng ký thành công!
        </h2>
        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed max-w-xs mx-auto">
          Tài khoản bút danh <span className="font-semibold text-stone-850 dark:text-stone-100">{fullName}</span> đã được tạo. Bạn hãy kiểm tra hòm thư email để xác nhận (nếu có) hoặc bấm đăng nhập ngay.
        </p>
        <Link
          to="/login"
          className="inline-block mt-3 px-5 py-2 text-xs font-serif font-medium bg-stone-900 text-stone-50 rounded-lg hover:bg-stone-800 transition-colors"
        >
          Chuyển tới Đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
          Đăng ký bút danh
        </h2>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 font-serif italic">
          Cùng chia sẻ và lưu giữ những vần thơ của riêng bạn
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50/90 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="fullName"
            className="block text-xs font-serif font-medium text-stone-700 dark:text-stone-300 mb-1"
          >
            Bút danh / Tên hiển thị
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ví dụ: Thi sĩ bên suối"
            className="w-full px-3.5 py-2 text-sm bg-stone-50/50 dark:bg-stone-800/60 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 transition-colors dark:text-stone-100"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-serif font-medium text-stone-700 dark:text-stone-300 mb-1"
          >
            Địa chỉ Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="thinh@gmail.com"
            className="w-full px-3.5 py-2 text-sm bg-stone-50/50 dark:bg-stone-800/60 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 transition-colors dark:text-stone-100"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-serif font-medium text-stone-700 dark:text-stone-300 mb-1"
          >
            Mật khẩu (tối thiểu 6 ký tự)
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2 text-sm bg-stone-50/50 dark:bg-stone-800/60 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 transition-colors dark:text-stone-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-serif font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-stone-150 dark:border-stone-800 text-center text-xs text-stone-500 dark:text-stone-400 font-serif">
        Đã có tài khoản?{' '}
        <Link
          to="/login"
          className="font-medium text-amber-800 dark:text-amber-400 hover:underline"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  )
}
