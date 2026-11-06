import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../../features/auth/auth.api'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu.')
      return
    }

    try {
      setLoading(true)
      await signIn({ email: email.trim(), password })
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra'
      if (message.includes('Invalid login credentials')) {
        setError('Email hoặc mật khẩu không chính xác.')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-serif font-bold text-stone-800">
          Đăng nhập tài khoản
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          Mở lại trang thơ bạn từng gửi gắm
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50/90 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium text-stone-700 mb-1"
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
            placeholder="ban@example.com"
            className="w-full px-3.5 py-2 text-sm bg-stone-50/50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 transition-colors"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-stone-700"
            >
              Mật khẩu
            </label>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2 text-sm bg-stone-50/50 border border-stone-300 rounded-lg focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 bg-stone-800 text-stone-50 text-sm font-medium rounded-lg hover:bg-stone-700 active:bg-stone-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Đang xác thực...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs text-stone-500">
        Chưa có tài khoản?{' '}
        <Link
          to="/register"
          className="font-medium text-amber-800 hover:text-amber-900 hover:underline"
        >
          Đăng ký bút danh mới
        </Link>
      </div>
    </div>
  )
}

