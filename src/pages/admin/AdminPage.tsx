import { useState, useEffect, useCallback, useId } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  EyeOff,
  Search,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Users,
  MessageSquare,
  FileCode2,
} from 'lucide-react'
import { VermilionSeal } from '../../components/common/VermilionSeal'
import { useAuth } from '../../features/auth'
import {
  getAdminStats,
  getAdminPoems,
  getAdminReports,
  togglePoemVisibility,
  deletePoemAsAdmin,
  updateReportStatus,
  importPoemsBulk,
} from '../../features/admin'
import type { AdminStats, AdminPoemItem, AdminReportItem, ImportResult } from '../../features/admin'
import { parsePoemsJson, type ParseResult } from '../../features/import-poems'

type AdminTab = 'overview' | 'poems' | 'reports' | 'import'

export function AdminPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const jsonFileInputId = useId()

  // 1. Thống kê
  const [stats, setStats] = useState<AdminStats>({
    totalPoems: 0,
    totalUsers: 0,
    totalComments: 0,
    pendingReports: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)

  // 2. Quản lý bài thơ
  const [poems, setPoems] = useState<AdminPoemItem[]>([])
  const [poemSearch, setPoemSearch] = useState('')
  const [poemsLoading, setPoemsLoading] = useState(false)
  const [deletingPoemId, setDeletingPoemId] = useState<string | null>(null)

  // 3. Quản lý báo cáo
  const [reports, setReports] = useState<AdminReportItem[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)

  // 4. Import JSON
  const [jsonText, setJsonText] = useState('')
  const [parsedImport, setParsedImport] = useState<ParseResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  // Thông báo phản hồi chung
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  // Load stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    const data = await getAdminStats()
    setStats(data)
    setStatsLoading(false)
  }, [])

  // Load poems
  const fetchPoems = useCallback(async (query?: string) => {
    setPoemsLoading(true)
    const data = await getAdminPoems(query)
    setPoems(data)
    setPoemsLoading(false)
  }, [])

  // Load reports
  const fetchReports = useCallback(async () => {
    setReportsLoading(true)
    const data = await getAdminReports()
    setReports(data)
    setReportsLoading(false)
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    if (activeTab === 'poems') {
      fetchPoems(poemSearch)
    } else if (activeTab === 'reports') {
      fetchReports()
    }
  }, [activeTab, fetchPoems, fetchReports, poemSearch])

  // Xử lý bật/tắt hiển thị bài thơ
  const handleToggleVisibility = async (poem: AdminPoemItem) => {
    try {
      const nextState = !poem.isPublic
      await togglePoemVisibility(poem.id, nextState)
      setPoems((prev) => prev.map((p) => (p.id === poem.id ? { ...p, isPublic: nextState } : p)))
      showNotification('success', nextState ? `Đã công khai bài "${poem.title}"` : `Đã ẩn bài "${poem.title}"`)
    } catch {
      showNotification('error', 'Không thể thay đổi trạng thái hiển thị của bài thơ.')
    }
  }

  // Xử lý xóa bài thơ
  const handleDeletePoem = async (poemId: string, poemTitle: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn bài thơ "${poemTitle}" khỏi thi quán? Hành động này không thể hoàn tác.`)) {
      return
    }

    try {
      setDeletingPoemId(poemId)
      await deletePoemAsAdmin(poemId)
      setPoems((prev) => prev.filter((p) => p.id !== poemId))
      setStats((prev) => ({ ...prev, totalPoems: Math.max(0, prev.totalPoems - 1) }))
      showNotification('success', `Đã xóa vĩnh viễn bài thơ "${poemTitle}".`)
    } catch {
      showNotification('error', 'Lỗi khi xóa bài thơ. Vui lòng thử lại.')
    } finally {
      setDeletingPoemId(null)
    }
  }

  // Xử lý cập nhật báo cáo vi phạm
  const handleUpdateReport = async (reportId: string, status: 'reviewed' | 'resolved' | 'rejected') => {
    try {
      await updateReportStatus(reportId, status)
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)))
      fetchStats()
      showNotification('success', 'Đã cập nhật trạng thái báo cáo.')
    } catch {
      showNotification('error', 'Không thể cập nhật báo cáo.')
    }
  }

  // Xử lý chọn file JSON import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setJsonText(text)
      const res = parsePoemsJson(text)
      setParsedImport(res)
      setImportResult(null)
    }
    reader.readAsText(file)
  }

  const handleJsonTextChange = (text: string) => {
    setJsonText(text)
    if (!text.trim()) {
      setParsedImport(null)
      return
    }
    const res = parsePoemsJson(text)
    setParsedImport(res)
    setImportResult(null)
  }

  const handleExecuteImport = async () => {
    if (!parsedImport || parsedImport.poems.length === 0 || !user?.id) return

    setIsImporting(true)
    setImportResult(null)
    try {
      const res = await importPoemsBulk(parsedImport.poems, user.id)
      setImportResult(res)
      if (res.successCount > 0) {
        showNotification('success', `Đã nhập thành công ${res.successCount} bài thơ vào thi quán!`)
        fetchStats()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi nhập thơ.'
      showNotification('error', msg)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Thông báo nổi */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-serif flex items-center gap-2 transition-all animate-bounce ${
            notification.type === 'success'
              ? 'bg-amber-50 dark:bg-amber-950/90 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100'
              : 'bg-red-50 dark:bg-red-950/90 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Tiêu đề trang Bàn Quản Sự */}
      <header className="border-b border-stone-200 dark:border-stone-800 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <VermilionSeal text="Quản" size="md" shape="square" />
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-serif text-amber-800 dark:text-amber-500 uppercase tracking-widest font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Bàn Quản Sự Thi Quán
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              Quản Trị Thơ Mộc
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-serif italic mt-0.5">
              Gìn giữ nét tao nhã, kiểm duyệt câu từ và điều phối thi đàn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              fetchStats()
              if (activeTab === 'poems') fetchPoems(poemSearch)
              if (activeTab === 'reports') fetchReports()
              showNotification('success', 'Đã làm mới dữ liệu thi quán.')
            }}
            className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-serif hover:bg-stone-100 dark:hover:bg-stone-700/60 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Làm mới
          </button>
        </div>
      </header>

      {/* Thanh tab chức năng */}
      <nav aria-label="Khu vực quản trị" className="flex border-b border-stone-200 dark:border-stone-800 gap-1 sm:gap-2 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-serif font-medium border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'overview'
              ? 'border-amber-800 dark:border-amber-500 text-amber-900 dark:text-amber-400 font-bold bg-amber-50/50 dark:bg-amber-950/20'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Tổng Quan
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('poems')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-serif font-medium border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'poems'
              ? 'border-amber-800 dark:border-amber-500 text-amber-900 dark:text-amber-400 font-bold bg-amber-50/50 dark:bg-amber-950/20'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Kiểm Duyệt Thơ ({stats.totalPoems})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-serif font-medium border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'reports'
              ? 'border-amber-800 dark:border-amber-500 text-amber-900 dark:text-amber-400 font-bold bg-amber-50/50 dark:bg-amber-950/20'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Báo Cáo Vi Phạm
          {stats.pendingReports > 0 && (
            <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-sans font-bold">
              {stats.pendingReports}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-serif font-medium border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'import'
              ? 'border-amber-800 dark:border-amber-500 text-amber-900 dark:text-amber-400 font-bold bg-amber-50/50 dark:bg-amber-950/20'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          Nhập Thơ từ JSON
        </button>
      </nav>

      {/* ================= TAB 1: TỔNG QUAN ================= */}
      {activeTab === 'overview' && (
        <section aria-label="Thống kê tổng quan thi quán" className="space-y-8 animate-fadeIn">
          {/* Lưới 4 thẻ thống kê */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
                <span className="text-xs font-serif">Tổng bài thơ</span>
                <BookOpen className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {statsLoading ? '...' : stats.totalPoems}
              </div>
              <p className="text-[11px] text-stone-400 font-serif italic mt-1">Đã lưu trữ trên thi đàn</p>
            </div>

            <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
                <span className="text-xs font-serif">Thi nhân gia nhập</span>
                <Users className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {statsLoading ? '...' : stats.totalUsers}
              </div>
              <p className="text-[11px] text-stone-400 font-serif italic mt-1">Hồ sơ bạn thơ đăng ký</p>
            </div>

            <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
                <span className="text-xs font-serif">Lời bình tri âm</span>
                <MessageSquare className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {statsLoading ? '...' : stats.totalComments}
              </div>
              <p className="text-[11px] text-stone-400 font-serif italic mt-1">Góp ý & giao lưu câu chữ</p>
            </div>

            <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
                <span className="text-xs font-serif">Báo cáo chờ duyệt</span>
                <AlertTriangle className={`w-4 h-4 ${stats.pendingReports > 0 ? 'text-red-600' : 'text-stone-400'}`} />
              </div>
              <div className={`text-2xl sm:text-3xl font-serif font-bold ${stats.pendingReports > 0 ? 'text-red-700 dark:text-red-400' : 'text-stone-900 dark:text-stone-100'}`}>
                {statsLoading ? '...' : stats.pendingReports}
              </div>
              <p className="text-[11px] text-stone-400 font-serif italic mt-1">
                {stats.pendingReports > 0 ? 'Cần xem xét ngay' : 'Không có vi phạm tồn đọng'}
              </p>
            </div>
          </div>

          {/* Quy chuẩn quản sự */}
          <div className="bg-amber-50/40 dark:bg-stone-900/60 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <VermilionSeal text="Chuẩn" size="xs" shape="square" />
              Quy chuẩn kiểm duyệt thi phẩm Thơ Mộc
            </h3>
            <ul className="text-xs sm:text-sm font-serif text-stone-700 dark:text-stone-300 space-y-2 list-disc list-inside leading-relaxed">
              <li>
                <strong>Tôn trọng bản quyền tác giả:</strong> Đối với thơ sưu tầm lịch sử, kiểm tra kỹ tên thi sĩ và nguồn trích. Các bài có tranh chấp bản quyền cần được tạm ẩn để rà soát.
              </li>
              <li>
                <strong>Giữ gìn sự trong sáng của thi từ:</strong> Không dung dưỡng nội dung kích động thù hằn, xúc phạm cá nhân hoặc spam quảng cáo thương mại.
              </li>
              <li>
                <strong>Quyền hạn tối thượng:</strong> Quản trị viên có toàn quyền gỡ bỏ nội dung vi phạm mà không cần thông báo trước nếu phát hiện có dấu hiệu phá hoại hệ thống.
              </li>
            </ul>
          </div>
        </section>
      )}

      {/* ================= TAB 2: KIỂM DUYỆT BÀI THƠ ================= */}
      {activeTab === 'poems' && (
        <section aria-label="Kiểm duyệt bài thơ" className="space-y-6 animate-fadeIn">
          {/* Thanh tìm kiếm */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm bài thơ theo tiêu đề..."
                value={poemSearch}
                onChange={(e) => setPoemSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm font-serif text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-800"
              />
            </div>
            <div className="text-xs text-stone-500 font-serif self-end sm:self-auto">
              Tìm thấy: <strong>{poems.length}</strong> bài
            </div>
          </div>

          {/* Bảng danh sách bài thơ */}
          {poemsLoading ? (
            <div className="py-20 text-center text-xs font-serif text-stone-400 italic">
              Đang đối chiếu sổ bộ thi phẩm...
            </div>
          ) : poems.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-stone-300 dark:border-stone-800 rounded-2xl bg-stone-50/50 dark:bg-stone-900/50">
              <p className="text-sm font-serif text-stone-500">Không tìm thấy bài thơ nào phù hợp.</p>
            </div>
          ) : (
            <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden bg-stone-50 dark:bg-stone-900 shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-serif">
                  <thead className="bg-stone-100/80 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Tiêu đề bài thơ</th>
                      <th className="py-3 px-4">Tác giả</th>
                      <th className="py-3 px-4">Lượt thích / xem</th>
                      <th className="py-3 px-4">Ngày đăng</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/80 dark:divide-stone-800/80 text-stone-800 dark:text-stone-200">
                    {poems.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-100/50 dark:hover:bg-stone-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100 max-w-[220px] truncate">
                          {p.title}
                        </td>
                        <td className="py-3 px-4 text-stone-600 dark:text-stone-400">{p.author}</td>
                        <td className="py-3 px-4 text-stone-500">
                          ❤️ {p.likesCount} • 👁️ {p.viewsCount}
                        </td>
                        <td className="py-3 px-4 text-stone-500 text-[11px]">
                          {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3 px-4">
                          {p.isPublic ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                              Công khai
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-400">
                              Đã ẩn
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/poems/${p.id}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Xem bài thơ trên thi quán"
                              className="p-1.5 rounded-lg text-stone-500 hover:text-amber-800 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleToggleVisibility(p)}
                              title={p.isPublic ? 'Tạm ẩn bài thơ này' : 'Cho phép công khai'}
                              className="p-1.5 rounded-lg text-stone-500 hover:text-amber-800 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                            >
                              {p.isPublic ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              type="button"
                              disabled={deletingPoemId === p.id}
                              onClick={() => handleDeletePoem(p.id, p.title)}
                              title="Xóa vĩnh viễn"
                              className="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ================= TAB 3: BÁO CÁO VI PHẠM ================= */}
      {activeTab === 'reports' && (
        <section aria-label="Danh sách phản ánh vi phạm" className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
              Danh sách phản ánh của bạn đọc
            </h2>
            <span className="text-xs text-stone-500 font-serif">
              {reports.filter((r) => r.status === 'pending').length} báo cáo chưa xử lý
            </span>
          </div>

          {reportsLoading ? (
            <div className="py-20 text-center text-xs font-serif text-stone-400 italic">
              Đang tải danh sách báo cáo...
            </div>
          ) : reports.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-stone-300 dark:border-stone-800 rounded-2xl bg-stone-50/50 dark:bg-stone-900/50 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-serif text-stone-700 dark:text-stone-300 font-medium">Thi đàn bình yên</p>
              <p className="text-xs font-serif text-stone-500 max-w-sm mx-auto">
                Hiện tại không có bài thơ nào bị báo cáo vi phạm bản quyền hay câu chữ.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-200/60 dark:border-stone-800/60 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-sans tracking-widest text-amber-800 dark:text-amber-500 font-bold">
                        Lý do: {rep.reason}
                      </span>
                      <h4 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                        Bài thơ: &quot;{rep.poemTitle}&quot;
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-medium ${
                          rep.status === 'pending'
                            ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                            : rep.status === 'resolved'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-400'
                        }`}
                      >
                        {rep.status === 'pending'
                          ? 'Chờ xem xét'
                          : rep.status === 'resolved'
                          ? 'Đã giải quyết'
                          : rep.status === 'reviewed'
                          ? 'Đã ghi nhận'
                          : 'Bác bỏ'}
                      </span>
                      <span className="text-xs text-stone-400 font-serif">
                        {new Date(rep.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {rep.details && (
                    <p className="text-xs font-serif text-stone-700 dark:text-stone-300 bg-stone-100/60 dark:bg-stone-800/60 p-3 rounded-xl italic">
                      &quot;{rep.details}&quot;
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-stone-400 font-serif">
                      Người gửi: {rep.reporterName}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/poems/${rep.poemId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 text-xs font-serif text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        Đến bài thơ <ExternalLink className="w-3 h-3" />
                      </Link>

                      {rep.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdateReport(rep.id, 'resolved')}
                            className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-serif transition-colors cursor-pointer"
                          >
                            Xác nhận vi phạm
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateReport(rep.id, 'rejected')}
                            className="px-3 py-1 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 rounded-lg text-xs font-serif transition-colors cursor-pointer"
                          >
                            Bác bỏ
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ================= TAB 4: NHẬP THƠ TỪ JSON ================= */}
      {activeTab === 'import' && (
        <section aria-label="Nhập thơ từ tệp JSON" className="space-y-6 animate-fadeIn">
          <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-amber-700" />
                Nhập danh sách bài thơ hàng loạt
              </h2>
              <p className="text-xs text-stone-500 font-serif italic mt-1">
                Cho phép nạp các tuyển tập thơ cổ điển hoặc thơ phong trào từ tệp JSON chuẩn vào cơ sở dữ liệu Thơ Mộc.
              </p>
            </div>

            {/* Khung tải file hoặc dán JSON */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-serif font-bold text-stone-800 dark:text-stone-200 block">
                  1. Chọn tệp JSON hoặc kéo thả vào đây:
                </label>
                <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-6 text-center hover:border-amber-700 dark:hover:border-amber-500 transition-colors bg-stone-100/50 dark:bg-stone-800/30">
                  <UploadCloud className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs font-serif text-stone-600 dark:text-stone-400">
                    Bấm để chọn tệp <strong>.json</strong> từ máy tính của bạn
                  </p>
                  <input
                    id={jsonFileInputId}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                  <label
                    htmlFor={jsonFileInputId}
                    className="inline-block mt-3 px-4 py-1.5 rounded-lg bg-stone-800 dark:bg-stone-200 text-stone-100 dark:text-stone-900 text-xs font-serif cursor-pointer hover:opacity-90"
                  >
                    Chọn tệp JSON
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const sample = `[
  {
    "title": "Đây Thôn Vĩ Dạ",
    "content": "Sao anh không về chơi thôn Vĩ?\\nNhìn nắng hàng cau nắng mới lên.\\nVườn ai mướt quá xanh như ngọc\\nLá trúc che ngang mặt chữ điền.",
    "author": "Hàn Mặc Tử",
    "tags": ["Thơ Mới", "Thơ tình"]
  },
  {
    "title": "Mưa Xuân",
    "content": "Em là con gái trong khung cửi\\nDệt lụa quanh năm với mẹ già\\nLòng trẻ còn như cây lụa trắng\\nMẹ già chưa bán chợ làng xa.",
    "author": "Nguyễn Bính",
    "tags": ["Chân quê", "Mùa xuân"]
  }
]`
                      handleJsonTextChange(sample)
                    }}
                    className="text-xs text-amber-800 dark:text-amber-500 hover:underline font-serif cursor-pointer"
                  >
                    + Nạp thử cấu trúc JSON mẫu
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="admin-json-textarea" className="text-xs font-serif font-bold text-stone-800 dark:text-stone-200 block">
                  2. Hoặc dán trực tiếp nội dung JSON:
                </label>
                <textarea
                  id="admin-json-textarea"
                  rows={8}
                  value={jsonText}
                  onChange={(e) => handleJsonTextChange(e.target.value)}
                  placeholder="Dán mảng JSON bài thơ vào đây..."
                  className="w-full p-3 bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-800 rounded-xl font-mono text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-800 resize-none"
                />
              </div>
            </div>

            {/* Kết quả phân tích (Validation Preview) */}
            {parsedImport && (
              <div className="border-t border-stone-200 dark:border-stone-800 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                    Kết quả kiểm tra tệp:
                  </h3>
                  <div className="text-xs font-serif">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                      {parsedImport.poems.length} bài hợp lệ
                    </span>
                    {parsedImport.errors.length > 0 && (
                      <span className="text-red-600 dark:text-red-400 font-bold ml-3">
                        ({parsedImport.errors.length} cảnh báo)
                      </span>
                    )}
                  </div>
                </div>

                {/* Danh sách lỗi nếu có */}
                {parsedImport.errors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-4 text-xs font-serif text-red-900 dark:text-red-200 space-y-1">
                    <div className="font-bold mb-1">Cảnh báo định dạng:</div>
                    {parsedImport.errors.map((err) => (
                      <div key={err}>• {err}</div>
                    ))}
                  </div>
                )}

                {/* Danh sách xem trước bài thơ */}
                {parsedImport.poems.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-serif text-stone-500">Xem trước danh sách chuẩn bị nhập:</div>
                    <div className="max-h-60 overflow-y-auto border border-stone-200 dark:border-stone-800 rounded-xl divide-y divide-stone-200 dark:divide-stone-800 bg-white dark:bg-stone-950">
                      {parsedImport.poems.map((item, idx) => (
                        <div key={`${item.title}-${idx}`} className="p-3 text-xs font-serif flex items-baseline justify-between gap-4">
                          <div>
                            <span className="font-bold text-stone-900 dark:text-stone-100">{item.title}</span>
                            <span className="text-stone-500 ml-2">— {item.author || 'Khuyết danh'}</span>
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {item.tags.map((t) => (
                                  <span key={t} className="px-1.5 py-0.2 bg-stone-100 dark:bg-stone-800 text-[10px] rounded text-stone-600 dark:text-stone-400">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400 shrink-0">
                            {item.content.split('\n').length} dòng
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Nút xác nhận nhập */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        disabled={isImporting || parsedImport.poems.length === 0}
                        onClick={handleExecuteImport}
                        className="px-6 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-stone-50 font-serif text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {isImporting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-stone-100 border-t-transparent rounded-full animate-spin" />
                            Đang nhập dữ liệu vào thi đàn...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4" />
                            Xác nhận nhập {parsedImport.poems.length} bài thơ
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Kết quả sau khi nhập */}
            {importResult && (
              <div
                className={`p-5 rounded-xl border text-xs font-serif space-y-2 ${
                  importResult.failedCount === 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100'
                }`}
              >
                <div className="font-bold text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Kết quả hoàn tất: Đã nhập {importResult.successCount}/{importResult.total} bài thơ!
                </div>
                {importResult.errors.length > 0 && (
                  <div className="text-red-700 dark:text-red-300 text-[11px] pt-1 space-y-1">
                    <div>Các bài gặp trục trặc:</div>
                    {importResult.errors.map((err) => (
                      <div key={err}>• {err}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

