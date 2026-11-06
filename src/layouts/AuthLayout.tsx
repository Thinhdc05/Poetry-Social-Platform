import { Outlet, Link } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-stone-50 dark:bg-stone-950 font-sans">
      {/* Cột trái: Tấm Màn Mực Đêm với câu thơ kinh điển (Chỉ hiển thị trên màn hình lớn) */}
      <aside aria-label="Giới thiệu Thơ Mộc" className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-[#161412] text-[#f7f4ed] p-12 xl:p-20 flex-col justify-between relative overflow-hidden">
        {/* Glow hiệu ứng tinh tế */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-stone-800/20 rounded-full blur-2xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10">
          <Link to="/" className="inline-block group">
            <h1 className="text-3xl font-serif font-bold text-stone-100 group-hover:text-amber-200 transition-colors tracking-tight">
              Thơ Mộc
            </h1>
            <p className="text-xs text-stone-400 font-serif italic tracking-wider mt-1">
              Nơi câu chữ tìm thấy nhau
            </p>
          </Link>
        </div>

        {/* Câu thơ điểm nhấn lớn (Pentagram typography style) */}
        <div className="relative z-10 my-auto py-12 space-y-6 max-w-lg">
          <div className="w-8 h-0.5 bg-amber-600/80 mb-6" />
          <blockquote className="text-2xl xl:text-3xl font-serif italic text-amber-100/90 leading-relaxed">
            &ldquo;Sông không hiểu nổi mình<br />
            Sóng tìm ra tận bể...&rdquo;
          </blockquote>
          <p className="text-sm text-stone-400 font-serif">
            — Xuân Quỳnh, <span className="italic">Sóng</span>
          </p>
          <p className="text-xs text-stone-500 font-serif leading-relaxed pt-4 border-t border-stone-800/80">
            Một không gian bình dị dành cho những tâm hồn yêu thi ca, nơi từng câu chữ được nâng niu và lắng nghe trọn vẹn.
          </p>
        </div>

        {/* Footer cột trái */}
        <div className="relative z-10 text-[11px] text-stone-500 font-serif">
          © {new Date().getFullYear()} Thơ Mộc • Nền tảng chia sẻ thơ ca tiếng Việt
        </div>
      </aside>

      {/* Cột phải: Form Đăng nhập / Đăng ký */}
      <section aria-label="Biểu mẫu xác thực" className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center items-center px-6 sm:px-12 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo (chỉ hiện trên màn hình nhỏ) */}
          <div className="text-center lg:hidden mb-6">
            <Link to="/" className="inline-block">
              <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                Thơ Mộc
              </h2>
              <p className="text-xs text-stone-500 font-serif italic">
                Nơi câu chữ tìm thấy nhau
              </p>
            </Link>
          </div>

          {/* Form Outlet */}
          <div className="bg-white/95 dark:bg-stone-900/90 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-8 sm:p-10 shadow-sm">
            <Outlet />
          </div>

          {/* Link quay lại */}
          <div className="text-center">
            <Link
              to="/"
              className="text-xs font-serif text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
            >
              ← Quay về trang chủ
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
