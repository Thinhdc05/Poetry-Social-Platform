import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, getProfile, type UserProfile } from '../../features/auth'
import { usePoems, deletePoem, updatePoem } from '../../features/poems'
import { useBookmarks } from '../../features/bookmarks'
import { getSavedHighlights } from '../../features/line-annotations'
import { PoemCard } from '../../components/poem/PoemCard'
import { VermilionSeal } from '../../components/common'
import { ProfileSettingsSection } from './ProfileSettingsSection'
import { Feather, Bookmark, Sparkles, Settings, Edit3, Trash2, Globe, Lock, Eye, EyeOff } from 'lucide-react'

type ProfileTab = 'authored' | 'saved' | 'highlights' | 'settings'

export function ProfilePage() {
  const { user, profile: authProfile, refreshProfile } = useAuth()
  const { poems, loading, refetch } = usePoems()
  const { bookmarkedIds } = useBookmarks()
  const [activeTab, setActiveTab] = useState<ProfileTab>('authored')
  const [poemToDelete, setPoemToDelete] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const emailPrefix = user?.email?.split('@')[0] || ''
  const metaName = (
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.display_name as string) ||
    ''
  ).trim()

  const loadUserProfile = useCallback(async () => {
    if (!user) return
    const p = await getProfile(user.id)
    if (p) {
      if (metaName && emailPrefix && p.fullName?.toLowerCase() === emailPrefix.toLowerCase()) {
        p.fullName = metaName
      }
      setProfile(p)
    }
  }, [user, metaName, emailPrefix])

  useEffect(() => {
    loadUserProfile()
  }, [loadUserProfile])

  const displayName =
    profile?.fullName && profile.fullName.toLowerCase() !== emailPrefix.toLowerCase()
      ? profile.fullName
      : metaName || profile?.fullName || authProfile?.fullName || emailPrefix || 'Thi Nhân Ẩn Danh'

  const savedPoems = useMemo(
    () => poems.filter((p) => bookmarkedIds.includes(p.id)),
    [poems, bookmarkedIds]
  )

  const authoredPoems = useMemo(
    () =>
      poems.filter(
        (p) =>
          (user && p.authorId === user.id) ||
          p.author.toLowerCase() === displayName.toLowerCase()
      ),
    [poems, user, displayName]
  )

  const highlights = useMemo(() => getSavedHighlights(), [activeTab])

  const totalInteractions =
    savedPoems.length + highlights.length + authoredPoems.length
  const poetRank =
    totalInteractions >= 6
      ? '✨ Thi Nhân Tri Kỷ'
      : totalInteractions >= 3
      ? '✒️ Thi Hữu Tri Âm'
      : '🍃 Khách Thơ Tao Nhã'

  const toggleHidePoem = async (id: string, currentIsPublic?: boolean) => {
    const nextPublicState = currentIsPublic === false ? true : false
    try {
      await updatePoem(id, { isPublic: nextPublicState })
      refetch?.()
    } catch (err) {
      console.error('Không thể cập nhật trạng thái bài thơ:', err)
    }
  }

  const handleConfirmDelete = async () => {
    if (!poemToDelete) return
    try {
      await deletePoem(poemToDelete)
      setPoemToDelete(null)
      refetch?.()
    } catch (err: unknown) {
      alert('Không thể xóa bài thơ: ' + (err instanceof Error ? err.message : 'Đã có lỗi'))
    }
  }

  if (!user) {
    return (
      <div className="text-center py-20 bg-white/95 dark:bg-[#1a1816] rounded-2xl border border-stone-200 dark:border-stone-800 p-8 space-y-4 max-w-md mx-auto shadow-2xs font-serif">
        <div className="flex justify-center">
          <VermilionSeal text="Mộc" size="lg" shape="square" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
          Chưa Đăng Nhập
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          Vui lòng đăng nhập để mở sổ tay lưu thơ, quản lý tác phẩm và thiết lập hồ sơ thi nhân của bạn.
        </p>
        <Link
          to="/login"
          className="inline-block px-5 py-2 rounded-xl bg-amber-800 text-stone-50 text-xs font-medium shadow-2xs"
        >
          Đăng nhập ngay
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* 1. Thẻ Danh Thiếp & Không Gian Quản Lý Thi Nhân */}
      <section className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-10 border border-stone-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-start gap-4">
          <VermilionSeal text={displayName} size="lg" shape="square" title={`Ấn triện ${displayName}`} />
          <div className="space-y-1.5">
            <span className="inline-block text-[11px] font-serif px-3 py-0.5 rounded-full bg-amber-900/70 text-amber-200 border border-amber-700/60">
              {poetRank}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-50">
              {displayName}
            </h1>
            <p className="text-xs text-stone-400 font-serif italic max-w-lg">
              {profile?.bio || 'Chưa có lời tự sự. Bạn có thể thêm đôi dòng tự sự trong mục Cài đặt hồ sơ bên dưới.'}
            </p>
          </div>
        </div>

        {/* Thống kê cá nhân */}
        <div className="relative z-10 grid grid-cols-3 gap-3 sm:gap-4 text-center bg-stone-950/80 p-4 rounded-xl border border-stone-800 shrink-0">
          <div className="px-2">
            <span className="block text-xl font-serif font-bold text-amber-400">
              {authoredPoems.length}
            </span>
            <span className="text-[11px] text-stone-400 font-serif">Đã đăng</span>
          </div>
          <div className="px-2 border-x border-stone-800">
            <span className="block text-xl font-serif font-bold text-amber-400">
              {savedPoems.length}
            </span>
            <span className="text-[11px] text-stone-400 font-serif">Đã lưu</span>
          </div>
          <div className="px-2">
            <span className="block text-xl font-serif font-bold text-amber-400">
              {highlights.length}
            </span>
            <span className="text-[11px] text-stone-400 font-serif">Tâm đắc</span>
          </div>
        </div>
      </section>

      {/* 2. Thanh chuyển ngăn Sổ Tay */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('authored')}
            className={`px-3.5 py-2 rounded-xl text-xs font-serif font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'authored'
                ? 'bg-stone-900 text-stone-50 dark:bg-amber-700 shadow-2xs'
                : 'bg-stone-100 dark:bg-[#1c1a18] text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Thi Phẩm Của Tôi ({authoredPoems.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-2 rounded-xl text-xs font-serif font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-stone-900 text-stone-50 dark:bg-amber-700 shadow-2xs'
                : 'bg-stone-100 dark:bg-[#1c1a18] text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Sổ Tay Đã Lưu ({savedPoems.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('highlights')}
            className={`px-3.5 py-2 rounded-xl text-xs font-serif font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'highlights'
                ? 'bg-stone-900 text-stone-50 dark:bg-amber-700 shadow-2xs'
                : 'bg-stone-100 dark:bg-[#1c1a18] text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Câu Thơ Gạch Chân ({highlights.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-serif font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-stone-900 text-stone-50 dark:bg-amber-700 shadow-2xs'
                : 'bg-stone-100 dark:bg-[#1c1a18] text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Cài Đặt Hồ Sơ</span>
          </button>
        </div>

        {activeTab === 'authored' && (
          <Link
            to="/poems/new"
            className="px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-stone-50 text-xs font-serif font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Viết bài thơ mới</span>
          </Link>
        )}
      </div>

      {/* 3. Nội dung các tab */}
      {/* TAB 1: Bài thơ của tôi */}
      {activeTab === 'authored' && (
        <div>
          {loading ? (
            <div className="py-16 text-center text-xs font-serif italic text-stone-400">
              Đang lật mở thi phẩm của bạn...
            </div>
          ) : authoredPoems.length === 0 ? (
            <div className="text-center py-14 bg-white/95 dark:bg-[#1a1816] rounded-2xl border border-stone-200 dark:border-stone-800 p-8 space-y-3">
              <p className="text-sm font-serif italic text-stone-500">
                Bạn chưa có bài thơ nào trên Thi Đàn. Hãy là người tiếp theo đặt bút!
              </p>
              <Link
                to="/poems/new"
                className="inline-block px-5 py-2 rounded-xl bg-amber-800 text-stone-50 text-xs font-serif font-medium shadow-2xs"
              >
                Sáng tác bài thơ đầu tiên
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {authoredPoems.map((poem) => {
                const isHidden = poem.isPublic === false
                const isCollected = poem.authorType === 'collected'
                return (
                  <div
                    key={poem.id}
                    className="bg-white/95 dark:bg-[#1c1a18] border border-stone-200/90 dark:border-stone-800 rounded-xl p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                          {poem.title}
                        </h3>
                        <span
                          className={`text-[10px] font-serif px-2.5 py-0.5 rounded-full border ${
                            isCollected
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                          }`}
                        >
                          {isCollected ? `Sưu tầm (${poem.author})` : 'Tự sáng tác'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-serif px-2.5 py-0.5 rounded-full border ${
                            isHidden
                              ? 'bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-300 dark:border-stone-700'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          {isHidden ? (
                            <>
                              <Lock className="w-2.5 h-2.5" />
                              <span>Riêng tư</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-2.5 h-2.5" />
                              <span>Công khai</span>
                            </>
                          )}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 dark:text-stone-400 font-serif italic line-clamp-1">
                        &ldquo;{poem.excerpt?.split('\n')[0]}&rdquo;
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-stone-400 font-serif">
                        <span>Đăng ngày: {poem.createdAt}</span>
                        <span>•</span>
                        <span>{poem.readingTimeMinutes} phút đọc</span>
                        {poem.mood && (
                          <>
                            <span>•</span>
                            <span>#{poem.mood}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Thanh công cụ quản lý bài thơ */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Link
                        to={`/poems/${poem.id}/edit`}
                        className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-amber-700 bg-stone-50 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 text-xs font-serif font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => toggleHidePoem(poem.id, poem.isPublic)}
                        title={isHidden ? 'Hiện công khai lại bài thơ' : 'Lưu riêng tư'}
                        className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-serif text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{isHidden ? 'Hiện lại' : 'Ẩn bài'}</span>
                      </button>

                      <Link
                        to={`/poems/${poem.id}`}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-amber-100/80 dark:hover:bg-amber-950/50 text-stone-800 dark:text-stone-200 text-xs font-serif font-medium transition-colors"
                      >
                        Đọc bài
                      </Link>

                      <button
                        type="button"
                        onClick={() => setPoemToDelete(poem.id)}
                        className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-serif transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Sổ tay đã lưu */}
      {activeTab === 'saved' && (
        <div>
          {savedPoems.length === 0 ? (
            <div className="text-center py-16 bg-white/95 dark:bg-[#1a1816] rounded-2xl border border-stone-200 dark:border-stone-800 p-8 space-y-3">
              <p className="text-sm font-serif italic text-stone-500">
                Sổ tay lưu thơ của bạn hiện đang trống.
              </p>
              <p className="text-xs text-stone-400 font-serif">
                Khi đọc bất kỳ bài thơ nào tâm đắc, hãy bấm biểu tượng Lưu để lưu vào đây.
              </p>
              <Link
                to="/"
                className="inline-block text-xs font-serif font-medium text-amber-800 dark:text-amber-400 underline pt-2"
              >
                Khám phá thi đàn ngay →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {savedPoems.map((poem) => (
                <PoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Câu thơ gạch chân */}
      {activeTab === 'highlights' && (
        <div className="space-y-4">
          {highlights.length === 0 ? (
            <div className="text-center py-16 bg-white/95 dark:bg-[#1a1816] rounded-2xl border border-stone-200 dark:border-stone-800 p-8 space-y-3">
              <p className="text-sm font-serif italic text-stone-500">
                Chưa có câu thơ gạch chân nào. Hãy bấm vào một câu thơ bất kỳ khi đọc bài để lưu lại!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highlights.map((h) => (
                <div
                  key={h.id}
                  className="bg-white/95 dark:bg-[#1c1a18] border border-amber-300/60 dark:border-amber-900/40 rounded-xl p-5 shadow-2xs space-y-3"
                >
                  <blockquote className="border-l-2 border-amber-700 pl-3 py-0.5">
                    <p className="font-serif italic font-bold text-base text-stone-900 dark:text-stone-100">
                      &ldquo;{h.lineText}&rdquo;
                    </p>
                  </blockquote>
                  <div className="flex items-center justify-between text-xs font-serif text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <Link
                      to={`/poems/${h.poemId}`}
                      className="hover:text-amber-800 dark:hover:text-amber-400 hover:underline truncate max-w-[200px]"
                    >
                      Trích: {h.poemTitle} ({h.poemAuthor})
                    </Link>
                    <span className="text-[10px] text-stone-400">{h.savedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Cài đặt hồ sơ & Tài khoản */}
      {activeTab === 'settings' && (
        <ProfileSettingsSection
          profile={profile}
          onProfileUpdated={loadUserProfile}
        />
      )}

      {/* Modal xác nhận xóa bài thơ */}
      {poemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs font-serif">
          <div className="bg-white dark:bg-[#1c1a18] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              Xác Nhận Xóa Bài Thơ
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Bạn có chắc chắn muốn gỡ bài thơ này khỏi Thi Đàn Thơ Mộc? Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPoemToDelete(null)}
                className="px-4 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-xs text-white font-medium cursor-pointer"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
