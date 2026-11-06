import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth'
import { useReading } from '../../features/reading'
import { AmbientSoundBar } from '../reading'
import { VermilionSeal } from '../common/VermilionSeal'
import { Feather, Sun, Moon, Sparkles, LogOut } from 'lucide-react'

export function Header() {
  const { user, loading, signOut } = useAuth()
  const { theme, setTheme } = useReading()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error)
    }
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Tôi'

  const cycleTheme = () => {
    if (theme === 'light') setTheme('sepia')
    else if (theme === 'sepia') setTheme('dark')
    else setTheme('light')
  }

  const themeLabel = theme === 'light' ? 'Giấy mộc' : theme === 'sepia' ? 'Giấy cổ' : 'Mực đêm'

  return (
    <header className="border-b border-stone-200/80 dark:border-stone-800/80 bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur-md sticky top-0 z-30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link to="/" className="group flex items-baseline gap-2.5 shrink-0">
          <VermilionSeal text="Mộc" size="xs" shape="square" />
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-50 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors tracking-tight">
            Thơ Mộc
          </h1>
          <span className="hidden xl:inline-block text-xs text-stone-500 dark:text-stone-400 font-serif italic border-l border-stone-300 dark:border-stone-700 pl-2.5">
            Nơi câu chữ tìm thấy nhau
          </span>
        </Link>

        {/* Thanh âm, đổi theme & điều hướng người dùng */}
        <nav className="flex items-center gap-2 sm:gap-2.5">
          {/* Thanh âm quán sách */}
          <AmbientSoundBar />

          {/* Đổi chất liệu giấy / theme */}
          <button
            type="button"
            onClick={cycleTheme}
            title={`Chất liệu: ${themeLabel}. Bấm để đổi.`}
            className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 border border-stone-300/80 dark:border-stone-700 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer text-xs font-serif text-stone-700 dark:text-stone-300"
          >
            {theme === 'light' ? (
              <Sun className="w-3.5 h-3.5 text-amber-600" />
            ) : theme === 'sepia' ? (
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden md:inline text-[11px] font-sans">{themeLabel}</span>
          </button>

          {loading ? (
            <div className="w-20 h-8 bg-stone-200/60 dark:bg-stone-800 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              <Link
                to="/profile"
                title="Trang cá nhân & Quản lý bài thơ của tôi"
                className="h-8 px-2.5 rounded-lg flex items-center gap-2 bg-stone-100 dark:bg-stone-800 border border-stone-300/80 dark:border-stone-700 hover:border-amber-600 dark:hover:border-amber-500 transition-all text-xs font-serif text-stone-900 dark:text-stone-100 shadow-2xs group"
              >
                <VermilionSeal text={displayName} size="xs" shape="square" />
                <span className="font-bold max-w-[100px] truncate group-hover:text-amber-800 dark:group-hover:text-amber-400">
                  {displayName}
                </span>
                <span className="text-[10px] text-amber-800 dark:text-amber-400 font-sans hidden sm:inline">
                  (Sổ tay)
                </span>
              </Link>

              <Link
                to="/poems/new"
                className="h-8 px-3 rounded-lg bg-amber-800 hover:bg-amber-900 text-stone-50 transition-colors shadow-2xs flex items-center gap-1.5 text-xs font-serif font-medium"
              >
                <Feather className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Góp thơ</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                title="Đăng xuất khỏi tài khoản"
                className="h-8 px-2 text-xs font-serif text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 rounded-md transition-colors cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Thoát</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="h-8 px-3 rounded-lg text-xs font-serif font-medium text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 flex items-center"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="h-8 px-3 rounded-lg bg-amber-800 hover:bg-amber-900 text-stone-50 text-xs font-serif font-medium transition-colors shadow-2xs flex items-center"
              >
                Gia nhập thi đàn
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
