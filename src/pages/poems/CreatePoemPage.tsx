import { useState, useEffect, useMemo, useRef, type FormEvent, type ChangeEvent } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../features/auth'
import { createPoem, formatPoemContent, parsePoemFile } from '../../features/poems'
import { getCurrentWeeklyChallenge } from '../../features/weekly-challenges'
import { MOODS } from '../../features/reading'
import { PoeticMeterVisualizer } from '../../components/poem'
import { TagInput } from '../../components/tag'
import {
  Upload,
  Wand2,
  Undo2,
  Feather,
  ScrollText,
  Lock,
  Globe,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'

const DRAFT_TITLE_KEY = 'tho_moc_draft_title'
const DRAFT_CONTENT_KEY = 'tho_moc_draft_content'

export function CreatePoemPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentWeeklyChallenge = useMemo(() => getCurrentWeeklyChallenge(), [])
  const challengeTag = searchParams.get('challenge')
  const isChallengeSubmission = Boolean(challengeTag && challengeTag === currentWeeklyChallenge.tag)

  const [title, setTitle] = useState(() => localStorage.getItem(DRAFT_TITLE_KEY) || '')
  const [content, setContent] = useState(() => localStorage.getItem(DRAFT_CONTENT_KEY) || '')
  const [previousContent, setPreviousContent] = useState<string | null>(null)
  const [mood, setMood] = useState(() =>
    isChallengeSubmission ? currentWeeklyChallenge.suggestedMood : 'Bình yên'
  )
  const [customTags, setCustomTags] = useState<string[]>([])
  const [authorType, setAuthorType] = useState<'original' | 'collected'>('original')
  const [collectedAuthor, setCollectedAuthor] = useState('')
  const [sourceCitation, setSourceCitation] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<string | null>(null)

  // Tùy chọn cho Poem Linter
  const [autoCapitalize, setAutoCapitalize] = useState(true)
  const [replaceSlashes, setReplaceSlashes] = useState(true)

  // Tự động lưu nháp
  useEffect(() => {
    localStorage.setItem(DRAFT_TITLE_KEY, title)
  }, [title])

  useEffect(() => {
    localStorage.setItem(DRAFT_CONTENT_KEY, content)
  }, [content])

  // Chuẩn hóa câu chữ tức thì có tùy chọn & hỗ trợ hoàn tác
  const handleAutoFormat = () => {
    if (!content.trim()) return
    setPreviousContent(content)
    const formatted = formatPoemContent(content, {
      capitalize: autoCapitalize,
      replaceSlashes,
      cleanBlankLines: true,
    })
    setContent(formatted)
    setSuccessInfo('✨ Đã căn chỉnh các khổ thơ theo tùy chọn của bạn!')
    setTimeout(() => setSuccessInfo(null), 3500)
  }

  const handleUndoFormat = () => {
    if (previousContent !== null) {
      setContent(previousContent)
      setPreviousContent(null)
      setSuccessInfo('↩️ Đã hoàn tác về văn bản trước khi căn chỉnh.')
      setTimeout(() => setSuccessInfo(null), 3000)
    }
  }

  // Tải tệp tin (.json, .txt, .md)
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const parsed = await parsePoemFile(file)
      if (parsed.title) setTitle(parsed.title)
      if (parsed.mood && (MOODS as readonly string[]).includes(parsed.mood)) {
        setMood(parsed.mood)
      }
      if (parsed.content) setContent(parsed.content)

      setSuccessInfo(`📁 Đã nạp thành công bài thơ từ tệp "${file.name}"!`)
      setTimeout(() => setSuccessInfo(null), 4000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể đọc tệp tin này')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Đếm số dòng & số khổ thơ
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
    setError(null)

    if (!user) {
      setError('Bạn cần đăng nhập để đăng bài thơ.')
      return
    }

    const cleanTitle = title.trim()
    const cleanContent = formatPoemContent(content, {
      capitalize: autoCapitalize,
      replaceSlashes,
      cleanBlankLines: true,
    })

    if (!cleanTitle || !cleanContent) {
      setError('Vui lòng nhập đầy đủ cả tựa đề và các câu thơ.')
      return
    }

    const lines = cleanContent.split('\n').filter((l) => l.trim().length > 0)
    if (lines.length < 2) {
      setError('Bài thơ cần có ít nhất 2 câu thơ để đảm bảo cấu trúc vần điệu.')
      return
    }

    if (authorType === 'collected' && !collectedAuthor.trim()) {
      setError('Vui lòng nhập tên tác giả nguyên tác của bài thơ bạn sưu tầm.')
      return
    }

    const finalAuthor =
      authorType === 'collected'
        ? collectedAuthor.trim()
        : user.user_metadata?.full_name || 'Bạn Thơ'

    try {
      setLoading(true)
      const tagsList = Array.from(
        new Set([
          mood,
          ...(isChallengeSubmission ? [currentWeeklyChallenge.tag] : []),
          ...customTags.map((t) => t.trim()).filter(Boolean),
        ])
      )
      const newPoem = await createPoem(
        {
          title: cleanTitle,
          content: cleanContent,
          mood,
          author: finalAuthor,
          authorType,
          tags: tagsList,
          isPublic,
          sourceCitation: authorType === 'collected' ? sourceCitation.trim() : undefined,
        },
        user.id
      )
      // Xóa nháp khi đăng thành công
      localStorage.removeItem(DRAFT_TITLE_KEY)
      localStorage.removeItem(DRAFT_CONTENT_KEY)
      navigate(`/poems/${newPoem.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu bài thơ'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header trang soạn thảo */}
      <div className="border-b border-stone-200/90 dark:border-stone-800 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/"
            className="text-xs text-stone-500 dark:text-stone-400 hover:text-amber-800 transition-colors mb-1 inline-flex items-center gap-1 font-serif"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay về trang chủ</span>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50 tracking-tight">
            Sáng Tác Vần Thơ Mới
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
            Viết thơ
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
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-serif animate-fade-in">
          {successInfo}
        </div>
      )}

      {/* Chế độ Xem trước */}
      {previewMode ? (
        <div className="bg-white/95 dark:bg-[#1a1816] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-8 sm:p-14 shadow-xs">
          <header className="border-b border-stone-150 dark:border-stone-800 pb-6 mb-8 text-center">
            {mood && (
              <span className="inline-block text-[11px] font-serif px-3 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 mb-3">
                {mood}
              </span>
            )}
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-50">
              {title || 'Tựa đề bài thơ'}
            </h2>
            <div className="mt-3 text-xs text-stone-500 font-serif">
              Tác giả:{' '}
              {authorType === 'collected'
                ? collectedAuthor || 'Khuyết danh'
                : user?.user_metadata?.full_name || 'Bạn'}
              {!isPublic && (
                <span className="ml-2 text-rose-600 dark:text-rose-400 font-sans">
                  • 🔒 Riêng tư
                </span>
              )}
            </div>
          </header>

          <div className="font-serif text-center max-w-lg mx-auto py-2 whitespace-pre-line text-lg leading-relaxed text-stone-800 dark:text-stone-100">
            {content || 'Chưa có nội dung câu thơ nào...'}
          </div>

          <div className="mt-8 pt-4 border-t border-stone-150 dark:border-stone-800 flex justify-center">
            <button
              type="button"
              onClick={() => setPreviewMode(false)}
              className="px-5 py-2 text-xs font-serif bg-stone-900 text-stone-100 rounded-xl hover:bg-stone-800 cursor-pointer"
            >
              ← Quay lại chỉnh sửa
            </button>
          </div>
        </div>
      ) : (
        /* Form Soạn thảo */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Thử thách tuần nếu người dùng đang tham gia */}
          {isChallengeSubmission && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-serif space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Bạn đang tham gia thử thách: {currentWeeklyChallenge.title}</span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-400">
                {currentWeeklyChallenge.prompt}
              </p>
            </div>
          )}

          {/* Hàng công cụ hỗ trợ: Nhập file & Chuẩn hóa */}
          <div className="p-3 bg-stone-100/80 dark:bg-[#1f1c19] border border-stone-200 dark:border-stone-800 rounded-xl space-y-2 text-xs font-serif">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="poem-file-upload"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:border-amber-600 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải tệp (.json, .txt, .md)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {previousContent !== null && (
                  <button
                    type="button"
                    onClick={handleUndoFormat}
                    className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200/60 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>Hoàn tác</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAutoFormat}
                  disabled={!content.trim()}
                  className="px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 disabled:opacity-40 text-stone-50 font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Căn chỉnh khổ thơ</span>
                </button>
              </div>
            </div>

            {/* Tùy chọn Linter */}
            <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-stone-200/60 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 font-sans">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCapitalize}
                  onChange={(e) => setAutoCapitalize(e.target.checked)}
                  className="rounded text-amber-800 focus:ring-amber-700"
                />
                <span>Viết hoa đầu dòng thơ</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceSlashes}
                  onChange={(e) => setReplaceSlashes(e.target.checked)}
                  className="rounded text-amber-800 focus:ring-amber-700"
                />
                <span>Đổi dấu gạch chéo (/) thành ngắt dòng</span>
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="poem-title"
              className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5 font-serif"
            >
              Tựa đề bài thơ
            </label>
            <input
              id="poem-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Hoàng hôn bên dòng sông, Tiếng lá rơi..."
              className="w-full px-4 py-2.5 text-base font-serif bg-white dark:bg-[#1a1816] border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 transition-colors shadow-2xs text-stone-900 dark:text-stone-100"
            />
          </div>

          {/* Lựa chọn Tác quyền: Sáng tác của tôi vs Sưu tầm thơ tiền bối */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#1a1816] border border-stone-200 dark:border-stone-800 space-y-3">
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
                  <Feather className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
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
                  <ScrollText className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>Sưu tầm thơ tiền bối</span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Chép thơ các thi hào (Xuân Quỳnh, Hàn Mặc Tử, Nguyễn Bính...)
                </p>
              </button>
            </div>

            {authorType === 'collected' && (
              <div className="pt-2 animate-fade-in space-y-3">
                <div className="space-y-1">
                  <label
                    htmlFor="collected-author"
                    className="block text-xs font-medium text-stone-700 dark:text-stone-300 font-serif"
                  >
                    Tên tác giả nguyên tác:
                  </label>
                  <input
                    id="collected-author"
                    type="text"
                    required
                    value={collectedAuthor}
                    onChange={(e) => setCollectedAuthor(e.target.value)}
                    placeholder="Ví dụ: Xuân Quỳnh, Hàn Mặc Tử, Nguyễn Bính, Huy Cận..."
                    className="w-full px-4 py-2 text-sm font-serif bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-700 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="source-citation"
                    className="block text-xs font-medium text-stone-700 dark:text-stone-300 font-serif"
                  >
                    Nguồn trích dẫn / Nhà xuất bản (tùy chọn):
                  </label>
                  <input
                    id="source-citation"
                    type="text"
                    value={sourceCitation}
                    onChange={(e) => setSourceCitation(e.target.value)}
                    placeholder="Ví dụ: Tuyển tập Thơ Mới 1932-1945, NXB Văn học..."
                    className="w-full px-4 py-2 text-xs font-serif bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-700 text-stone-900 dark:text-stone-100"
                  />
                </div>
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

          {/* Thẻ thơ tự do (Tags) */}
          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5 font-serif">
              Thẻ thơ (Gắn chủ đề / thể loại tự do):
            </label>
            <TagInput
              tags={customTags}
              onChange={setCustomTags}
              placeholder="Nhập thẻ rồi nhấn Enter (vd: lục bát, trăng thu, hoài niệm)..."
            />
          </div>

          {/* Soạn thảo câu thơ */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="poem-content"
                className="block text-xs font-medium text-stone-700 dark:text-stone-300 font-serif"
              >
                Lời thơ (xuống dòng tự nhiên, cách 1 dòng để tách khổ)
              </label>
              <span className="text-[11px] text-stone-400 font-serif">
                {stats.lines} câu • {stats.stanzas} khổ
              </span>
            </div>
            <textarea
              id="poem-content"
              required
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Gõ từng câu thơ ở đây...\n\nVí dụ:\nDữ dội và dịu êm\nỒn ào và lặng lẽ\n\nSông không hiểu nổi mình\nSóng tìm ra tận bể...`}
              className="w-full px-4 py-3 text-base font-serif leading-relaxed bg-white dark:bg-[#1a1816] border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 transition-colors shadow-2xs whitespace-pre-line text-stone-900 dark:text-stone-100"
            />
          </div>

          {/* Bộ Giám định Niêm luật & Thẩm âm thể thơ trực tiếp */}
          <PoeticMeterVisualizer content={content} />

          {/* Quyền riêng tư của bài thơ (Bảo mật is_public) */}
          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1a1816] flex items-center justify-between gap-3 text-xs font-serif">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {isPublic ? <Globe className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-amber-600" />}
              </span>
              <div>
                <span className="font-bold text-stone-900 dark:text-stone-100 block">
                  {isPublic ? 'Công khai trên Thi Đàn' : 'Lưu riêng tư (Chỉ mình bạn xem)'}
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  {isPublic
                    ? 'Mọi bạn thơ đều có thể đọc, gạch chân và họa thơ cùng bạn.'
                    : 'Bài thơ được bảo vệ bằng RLS, chỉ hiển thị trong trang cá nhân của bạn.'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                isPublic
                  ? 'border-emerald-600/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                  : 'border-amber-600/60 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300'
              }`}
            >
              {isPublic ? 'Đang công khai' : 'Đang riêng tư'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/"
              className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-200/50 transition-colors"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-stone-50 text-xs font-medium rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer font-serif"
            >
              {loading ? 'Đang gửi gắm...' : 'Đăng bài thơ'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
