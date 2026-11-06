import { useState, useEffect, useMemo, type FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../features/auth'
import { getPoemById, updatePoem, formatPoemContent, type AuthorType } from '../../features/poems'
import { MOODS } from '../../features/reading'

export function EditPoemPage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const emailPrefix = user?.email?.split('@')[0] || ''
  const myPenName =
    profile?.fullName && profile.fullName.toLowerCase() !== emailPrefix.toLowerCase()
      ? profile.fullName
      : user?.user_metadata?.full_name || profile?.fullName || emailPrefix || 'Bạn Thơ'

  const [initialLoading, setInitialLoading] = useState(true)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('Bình yên')
  const [authorType, setAuthorType] = useState<AuthorType>('original')
  const [collectedAuthor, setCollectedAuthor] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let isMounted = true

    async function loadPoem() {
      try {
        const found = await getPoemById(id!)
        if (!isMounted) return

        if (!found) {
          setPermissionError('Không tìm thấy bài thơ cần chỉnh sửa.')
          setInitialLoading(false)
          return
        }

        // Kiểm tra quyền chỉnh sửa
        if (user && found.authorId && found.authorId !== user.id) {
          setPermissionError('Bạn không có quyền chỉnh sửa bài thơ của thi nhân khác.')
          setInitialLoading(false)
          return
        }

        setTitle(found.title)
        setContent(found.content)
        setMood(found.mood || 'Bình yên')
        const type = found.authorType || 'original'
        setAuthorType(type)
        if (type === 'collected') {
          setCollectedAuthor(found.author)
        }
      } catch (err: unknown) {
        if (isMounted) {
          setPermissionError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu bài thơ')
        }
      } finally {
        if (isMounted) setInitialLoading(false)
      }
    }

    loadPoem()
    return () => {
      isMounted = false
    }
  }, [id, user])

  // Chuẩn hóa câu chữ
  const handleAutoFormat = () => {
    if (!content.trim()) return
    const formatted = formatPoemContent(content)
    setContent(formatted)
    setSuccessInfo('✨ Đã tự động ngắt dòng, viết hoa đầu câu và căn chỉnh các khổ thơ!')
    setTimeout(() => setSuccessInfo(null), 3500)
  }

  // Đếm số dòng & khổ thơ
  const stats = useMemo(() => {
    const rawLines = content.split('\n')
    const nonEmptyLines = rawLines.filter((l) => l.trim().length > 0).length
    const stanzas = content
      .split(/\n\s*\n/)
      .filter((s) => s.trim().length > 0).length
    return { lines: nonEmptyLines, stanzas: stanzas || (nonEmptyLines > 0 ? 1 : 0) }
  }, [content])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!id) return
    setError(null)

    const cleanTitle = title.trim()
    const cleanContent = formatPoemContent(content)

    if (!cleanTitle || !cleanContent) {
      setError('Vui lòng nhập đầy đủ cả tựa đề và các câu thơ.')
      return
    }

    const lines = cleanContent.split('\n').filter((l) => l.trim().length > 0)
    if (lines.length < 2) {
      setError('Bài thơ cần có ít nhất 2 câu thơ.')
      return
    }

    if (authorType === 'collected' && !collectedAuthor.trim()) {
      setError('Vui lòng nhập tên tác giả nguyên tác của bài thơ sưu tầm.')
      return
    }

    const finalAuthor =
      authorType === 'collected'
        ? collectedAuthor.trim()
        : myPenName

    try {
      setSaving(true)
      await updatePoem(id, {
        title: cleanTitle,
        content: cleanContent,
        mood,
        author: finalAuthor,
        authorType,
      })
      navigate(`/poems/${id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể lưu thay đổi bài thơ')
    } finally {
      setSaving(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="py-20 text-center text-xs font-serif italic text-stone-400">
        Đang nạp bài thơ để chỉnh sửa...
      </div>
    )
  }

  if (permissionError) {
    return (
      <div className="text-center py-16 bg-white/95 dark:bg-[#1a1816] rounded-2xl border border-stone-200 dark:border-stone-800 p-8 space-y-4 max-w-md mx-auto shadow-2xs">
        <span className="text-3xl block">🔒</span>
        <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
          Không Thể Chỉnh Sửa
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-serif">
          {permissionError}
        </p>
        <Link
          to={id ? `/poems/${id}` : '/'}
          className="inline-block px-5 py-2 text-xs font-serif font-medium bg-stone-900 dark:bg-stone-800 text-stone-100 rounded-xl hover:bg-stone-800 transition-colors"
        >
          ← Quay lại
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header trang chỉnh sửa */}
      <div className="border-b border-stone-200/90 dark:border-stone-800 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to={`/poems/${id}`}
            className="text-xs text-stone-500 dark:text-stone-400 hover:text-amber-800 transition-colors mb-1 inline-block font-serif"
          >
            ← Hủy & quay lại bài thơ
          </Link>
          <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50 tracking-tight">
            Chỉnh Sửa Thi Phẩm
          </h1>
        </div>

        {/* Chuyển chế độ Viết / Xem trước */}
        <div className="flex border border-stone-200 dark:border-stone-700 rounded-lg p-0.5 text-xs font-serif">
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              !previewMode
                ? 'bg-amber-800 text-stone-50 font-medium shadow-2xs'
                : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            Sửa lời
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              previewMode
                ? 'bg-amber-800 text-stone-50 font-medium shadow-2xs'
                : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            Xem trước
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 font-serif">
          ⚠️ {error}
        </div>
      )}

      {successInfo && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-serif">
          {successInfo}
        </div>
      )}

      {previewMode ? (
        <div className="bg-white/95 dark:bg-[#1a1816] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-8 sm:p-14 shadow-xs">
          <header className="border-b border-stone-150 dark:border-stone-800 pb-6 mb-8 text-center">
            <span className="inline-block text-[11px] font-serif px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60 mb-2">
              {mood}
            </span>
            <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-50">
              {title || 'Tựa đề bài thơ'}
            </h2>
            <p className="mt-2 text-xs text-stone-500 font-serif">
              {authorType === 'collected'
                ? `Tác giả: ${collectedAuthor || 'Chưa nhập'} • Người chép: ${myPenName}`
                : `Sáng tác: ${myPenName}`} • Bản xem trước
            </p>
          </header>
          <div className="font-serif text-lg text-stone-900 dark:text-stone-100 leading-loose whitespace-pre-line text-center max-w-md mx-auto py-4">
            {formatPoemContent(content) || 'Chưa có nội dung lời thơ...'}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAutoFormat}
              disabled={!content.trim()}
              className="px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-40 text-stone-50 text-xs font-serif font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>🪄</span>
              <span>Chuẩn hóa thơ tự động</span>
            </button>
          </div>

          <div>
            <label
              htmlFor="edit-poem-title"
              className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5 font-serif"
            >
              Tựa đề bài thơ
            </label>
            <input
              id="edit-poem-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-base font-serif bg-white dark:bg-[#1a1816] border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          {/* Lựa chọn Tác quyền: Sáng tác của tôi vs Sưu tầm thơ tiền bối */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1816] border border-stone-200 dark:border-stone-800 space-y-3">
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 font-serif">
              Nguồn gốc bài thơ:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAuthorType('original')}
                className={`p-3 rounded-xl border text-left font-serif transition-all cursor-pointer ${
                  authorType === 'original'
                    ? 'border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 text-stone-900 dark:text-stone-100 ring-1 ring-amber-800'
                    : 'border-stone-200 dark:border-stone-700 hover:border-amber-700/60 text-stone-600 dark:text-stone-400'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                  <span>✍️</span>
                  <span>Sáng tác của tôi</span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Bút danh tác giả: <strong>{user?.user_metadata?.full_name || 'Bản thân bạn'}</strong>
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAuthorType('collected')}
                className={`p-3 rounded-xl border text-left font-serif transition-all cursor-pointer ${
                  authorType === 'collected'
                    ? 'border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 text-stone-900 dark:text-stone-100 ring-1 ring-amber-800'
                    : 'border-stone-200 dark:border-stone-700 hover:border-amber-700/60 text-stone-600 dark:text-stone-400'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                  <span>📜</span>
                  <span>Sưu tầm thơ tiền bối</span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Chép thơ của các thi hào (Xuân Quỳnh, Hàn Mặc Tử...)
                </p>
              </button>
            </div>

            {authorType === 'collected' && (
              <div className="pt-2 animate-fade-in space-y-1.5">
                <label
                  htmlFor="collected-author-edit"
                  className="block text-xs font-medium text-stone-700 dark:text-stone-300 font-serif"
                >
                  Tên tác giả nguyên tác:
                </label>
                <input
                  id="collected-author-edit"
                  type="text"
                  required
                  value={collectedAuthor}
                  onChange={(e) => setCollectedAuthor(e.target.value)}
                  className="w-full px-4 py-2 text-sm font-serif bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-700 text-stone-900 dark:text-stone-100"
                />
              </div>
            )}
          </div>

          {/* Chọn tâm trạng bài thơ */}
          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5 font-serif">
              Tâm trạng / Cảm xúc chủ đạo:
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.filter((m) => m !== 'Tất cả').map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`px-3 py-1 rounded-full text-xs font-serif transition-colors cursor-pointer border ${
                    mood === m
                      ? 'bg-amber-800 text-stone-50 border-amber-800 shadow-2xs'
                      : 'bg-white dark:bg-[#1a1816] border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-amber-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="edit-poem-content"
                className="block text-xs font-medium text-stone-700 dark:text-stone-300 font-serif"
              >
                Lời thơ
              </label>
              <span className="text-[11px] text-stone-400 font-serif">
                {stats.lines} câu • {stats.stanzas} khổ
              </span>
            </div>
            <textarea
              id="edit-poem-content"
              required
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3.5 text-base font-serif leading-relaxed bg-white dark:bg-[#1a1816] border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 transition-colors shadow-2xs whitespace-pre-line text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to={`/poems/${id}`}
              className="px-4 py-2 text-xs font-serif text-stone-600 dark:text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-200/50 transition-colors"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-stone-50 text-xs font-medium rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer font-serif"
            >
              {saving ? 'Đang lưu thay đổi...' : 'Cập nhật bài thơ'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

