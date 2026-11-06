import { type ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { VermilionSeal } from '../common/VermilionSeal'

interface RoleGuardProps {
  children: ReactNode
}

export function RoleGuard({ children }: RoleGuardProps) {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-6 h-6 border-2 border-stone-300 dark:border-stone-700 border-t-amber-800 dark:border-t-amber-500 rounded-full animate-spin mb-3" />
        <p className="text-xs text-stone-500 dark:text-stone-400 font-serif italic">
          Đang xác nhận quyền quản sự...
        </p>
      </div>
    )
  }

  // Chưa đăng nhập thì chuyển hướng sang trang đăng nhập
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Đã đăng nhập nhưng không có vai trò ADMIN
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-2xl p-8 sm:p-10 shadow-xs space-y-5">
          <div className="flex justify-center">
            <VermilionSeal text="Cấm" size="md" shape="square" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-serif text-amber-800 dark:text-amber-500 uppercase tracking-widest font-semibold">
              <ShieldAlert className="w-4 h-4" />
              Khu Vực Quản Sự
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
              Không có quyền truy cập
            </h2>
            <p className="text-sm font-serif text-stone-600 dark:text-stone-400 leading-relaxed max-w-md mx-auto">
              Trang này chỉ dành cho Quản trị viên (Admin) giám sát thi quán và kiểm duyệt nội dung. Tài khoản của bạn hiện là bạn thơ thông thường.
            </p>
          </div>

          <div className="pt-3 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-stone-50 font-serif text-xs font-medium transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Trở về Thi Đàn
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

