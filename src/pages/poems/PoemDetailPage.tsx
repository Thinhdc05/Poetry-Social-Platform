import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePoemDetail } from '../../features/poems'
import { useComments } from '../../features/comments'
import { useAuth } from '../../features/auth'
import { useReading, FONT_SIZE_CLASSES } from '../../features/reading'
import { usePoeticDuels } from '../../features/poetic-duels'
import { useLineAnnotations } from '../../features/line-annotations'
import { useBookmarks } from '../../features/bookmarks'
import { CommentForm } from '../../components/comment/CommentForm'
import { CommentList } from '../../components/comment/CommentList'
import { VermilionSeal } from '../../components/common'
import {
  InteractivePoemLines,
  MarginaliaPanel,
  PoeticResponseSection,
  ReportPoemModal,
} from '../../components/poem'
import {
  ReadingToolbar,
  ReactionButtons,
  SharePoemModal,
  AmbientSoundBar,
} from '../../components/reading'
import { ArrowLeft, Bookmark, Edit3, Flag, ScrollText, Feather } from 'lucide-react'

export function PoemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { poem, loading: poemLoading, error: poemError } = usePoemDetail(id)
  const { comments, loading: commentsLoading, addComment, removeComment } =
    useComments(id)
  const { fontSize, isFocusMode } = useReading()
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const {
    responses,
    submitResponse,
    handleLikeResponse,
    handleToggleEndorse,
  } = usePoeticDuels(id)

  const {
    notes,
    highlights,
    selectedLineIndex,
    setSelectedLineIndex,
    addLineNote,
    toggleHighlightLine,
  } = useLineAnnotations(id, poem?.title || '', poem?.author || '')

  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [interactionTab, setInteractionTab] = useState<'duels' | 'comments'>('duels')

  const currentUserName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Thi hữu tri âm'

  if (poemLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin" />
        <p className="text-xs text-stone-500 dark:text-stone-400 font-serif italic">
          Đang lật mở trang thơ...
        </p>
      </div>
    )
  }

  if (poemError || !poem) {
    return (
      <div className="text-center py-16 bg-white/95 dark:bg-[#1a1816] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-8 space-y-4 shadow-2xs max-w-md mx-auto">
        <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
          Không tìm thấy bài thơ
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-serif">
          Bài thơ bạn đang tìm kiếm không tồn tại hoặc đã được tác giả gỡ bỏ.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2 text-xs font-serif font-medium bg-stone-900 text-stone-100 rounded-xl hover:bg-stone-800 transition-colors"
        >
          ← Quay về trang chủ
        </Link>
      </div>
    )
  }

  const saved = isBookmarked(poem.id)
  const lines = (poem.content || '').replace(/\\n/g, '\n').split('\n')
  const selectedLineText =
    selectedLineIndex !== null && selectedLineIndex < lines.length
      ? lines[selectedLineIndex]
      : ''

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Khung cảnh 12 cột mở rộng: 3 cột rail trái | 6 cột tờ thơ | 3 cột Marginalia lề sách */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 1. CỘT TRÁI (3 cột): Điều khiển đọc & Khí chất văn chương */}
        {!isFocusMode && (
          <aside className="lg:col-span-3 space-y-5 lg:sticky lg:top-20 order-2 lg:order-1">
            <div className="space-y-3">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 hover:text-amber-800 dark:hover:text-amber-400 transition-colors font-medium font-serif"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại Thi Đàn</span>
              </Link>
            </div>

            {/* Thẻ con dấu tác giả */}
            <div className="p-5 rounded-xl bg-white/95 dark:bg-[#1a1816] border border-stone-200/90 dark:border-stone-800 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-serif tracking-wider text-amber-800 dark:text-amber-400 font-semibold">
                  {poem.authorType === 'collected' ? (
                    <>
                      <ScrollText className="w-3 h-3" />
                      <span>Thơ Sưu Tầm</span>
                    </>
                  ) : (
                    <>
                      <Feather className="w-3 h-3" />
                      <span>Thơ Sáng Tác</span>
                    </>
                  )}
                </span>
                {user?.id === poem.authorId && (
                  <span className="text-[10px] font-serif px-2 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Bài của bạn
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <VermilionSeal text={poem.author} size="md" shape="square" />
                <div>
                  <Link
                    to={`/authors/${encodeURIComponent(poem.author)}`}
                    className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 hover:text-amber-800 dark:hover:text-amber-400 hover:underline block"
                  >
                    {poem.author}
                  </Link>
                  <span className="text-[11px] text-stone-400 font-serif">
                    {poem.readingTimeMinutes} phút đọc • {poem.createdAt}
                  </span>
                </div>
              </div>

              {poem.authorType === 'collected' && poem.curatorName && (
                <div className="pt-1 text-[11px] text-stone-500 dark:text-stone-400 font-serif border-t border-stone-150 dark:border-stone-800">
                  <span>Người chép thơ: </span>
                  <span className="font-medium text-stone-700 dark:text-stone-300">
                    @{poem.curatorName}
                  </span>
                </div>
              )}

              {/* Nút Chỉnh sửa dành cho chủ nhân bài thơ */}
              {user?.id === poem.authorId && (
                <Link
                  to={`/poems/${poem.id}/edit`}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-stone-800 dark:text-stone-200 text-xs font-serif font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa bài thơ này</span>
                </Link>
              )}

              {/* Nút lưu Sổ tay nhanh */}
              <button
                type="button"
                onClick={() => toggleBookmark(poem.id)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-serif font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  saved
                    ? 'bg-amber-800 text-stone-50 border-amber-800 shadow-2xs'
                    : 'bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:border-amber-600'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
                <span>{saved ? 'Đã lưu trong Sổ tay' : 'Lưu bài thơ vào Sổ tay'}</span>
              </button>

              {/* Nút báo cáo bản quyền */}
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="w-full py-1 text-[11px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 font-serif flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Flag className="w-3 h-3" />
                <span>Báo cáo bản quyền / Vi phạm</span>
              </button>
            </div>

            {/* Bảng công cụ đọc thơ */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-serif tracking-widest text-stone-400 font-semibold block px-1">
                Công Cụ Trải Nghiệm
              </span>
              <ReadingToolbar
                poemContent={`${poem.title}\n\nTác giả: ${poem.author}\n\n${poem.content}`}
                onOpenShareModal={() => setIsShareModalOpen(true)}
                layout="vertical"
              />
            </div>

            {/* Máy phát thanh âm quán sách */}
            <div className="p-4 rounded-xl bg-white/95 dark:bg-[#1a1816] border border-stone-200/90 dark:border-stone-800 space-y-2 shadow-2xs">
              <span className="text-[10px] uppercase font-serif tracking-widest text-stone-400 font-semibold block">
                Thanh Âm Không Gian
              </span>
              <AmbientSoundBar />
            </div>
          </aside>
        )}

        {/* 2. CỘT GIỮA (6 cột hoặc toàn trang khi Focus Mode): Tờ giấy thơ chính */}
        <main
          className={`${
            isFocusMode
              ? 'max-w-3xl mx-auto col-span-12'
              : 'lg:col-span-6 order-1 lg:order-2'
          } space-y-8`}
        >
          {/* Tờ giấy thơ trang nhã */}
          <div className="bg-white dark:bg-[#181614] border border-stone-300/80 dark:border-[#2e2a26] rounded-2xl p-6 sm:p-12 shadow-sm transition-colors duration-300 ring-1 ring-stone-900/5 dark:ring-white/5">
            <header className="border-b border-stone-150 dark:border-stone-800 pb-6 mb-8 text-center">
              {poem.mood && (
                <span className="inline-block text-[11px] font-serif px-3 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60 mb-3">
                  {poem.mood}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
                {poem.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-serif">
                {poem.authorType === 'collected' ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-sans">
                      <ScrollText className="w-2.5 h-2.5 text-amber-500" />
                      <span>Sưu tầm</span>
                    </span>
                    <span>Tác giả:</span>
                    <Link
                      to={`/authors/${encodeURIComponent(poem.author)}`}
                      className="font-medium text-stone-800 dark:text-stone-200 hover:text-amber-800 dark:hover:text-amber-400 hover:underline"
                    >
                      {poem.author}
                    </Link>
                    {poem.curatorName && (
                      <span className="text-[11px] text-stone-400 dark:text-stone-500 font-sans">
                        • Người chép: @{poem.curatorName}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 font-sans">
                      <Feather className="w-2.5 h-2.5" />
                      <span>Sáng tác</span>
                    </span>
                    <Link
                      to={`/authors/${encodeURIComponent(poem.author)}`}
                      className="font-medium text-stone-800 dark:text-stone-200 hover:text-amber-800 dark:hover:text-amber-400 hover:underline"
                    >
                      {poem.author}
                    </Link>
                  </>
                )}
                <span>•</span>
                <time>{poem.createdAt}</time>
                {user?.id === poem.authorId && (
                  <>
                    <span>•</span>
                    <Link
                      to={`/poems/${poem.id}/edit`}
                      className="text-amber-800 dark:text-amber-400 hover:underline font-medium flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Sửa bài</span>
                    </Link>
                  </>
                )}
              </div>
            </header>

            {/* Thân bài thơ tương tác từng câu */}
            <InteractivePoemLines
              content={poem.content}
              fontSizeClass={FONT_SIZE_CLASSES[fontSize] || FONT_SIZE_CLASSES.base}
              notes={notes}
              highlights={highlights}
              selectedLineIndex={selectedLineIndex}
              onSelectLine={setSelectedLineIndex}
            />

            {/* Thả cảm xúc tri âm */}
            <div className="mt-10 pt-6 border-t border-stone-150 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-stone-600 dark:text-stone-400 font-serif italic">
                Gửi chút tâm tình đến tác giả:
              </span>
              <ReactionButtons
                poemId={poem.id}
                initialLikesCount={poem.likesCount || 0}
              />
            </div>
          </div>

          {/* Không gian đối ẩm bên dưới tờ giấy thơ (Thơ Họa Đáp & Lời Bình Toàn Bài) */}
          {!isFocusMode && (
            <section className="border-t border-stone-200 dark:border-stone-800 pt-8 space-y-6">
              <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
                <button
                  type="button"
                  onClick={() => setInteractionTab('duels')}
                  className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    interactionTab === 'duels'
                      ? 'bg-stone-900 text-stone-50 dark:bg-amber-700'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  <Feather className="w-3.5 h-3.5" />
                  <span>Thơ Họa Đáp</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                    {responses.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setInteractionTab('comments')}
                  className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    interactionTab === 'comments'
                      ? 'bg-stone-900 text-stone-50 dark:bg-amber-700'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  <span>Lời Bình & Tri Âm</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                    {comments.length}
                  </span>
                </button>
              </div>

              {interactionTab === 'duels' ? (
                <PoeticResponseSection
                  poemTitle={poem.title}
                  poemAuthor={poem.author}
                  responses={responses}
                  currentUserName={currentUserName}
                  currentUserId={user?.id}
                  onSubmitResponse={submitResponse}
                  onLikeResponse={handleLikeResponse}
                  onToggleEndorse={handleToggleEndorse}
                />
              ) : (
                <div className="space-y-6">
                  <CommentForm
                    onSubmit={async (content) => {
                      if (user) {
                        await addComment(content, user.id)
                      }
                    }}
                  />

                  {commentsLoading ? (
                    <div className="py-6 text-center text-xs text-stone-400 font-serif italic">
                      Đang tải lời bình...
                    </div>
                  ) : (
                    <CommentList
                      comments={comments}
                      currentUserId={user?.id}
                      onDelete={removeComment}
                    />
                  )}
                </div>
              )}
            </section>
          )}
        </main>

        {/* 3. CỘT PHẢI (3 cột): Marginalia Lề Sách Tri Âm */}
        {!isFocusMode && (
          <div className="lg:col-span-3 order-3">
            <MarginaliaPanel
              selectedLineIndex={selectedLineIndex}
              selectedLineText={selectedLineText}
              notes={notes}
              highlights={highlights}
              currentUserName={currentUserName}
              currentUserId={user?.id}
              lines={lines}
              onSelectLine={setSelectedLineIndex}
              onToggleHighlight={toggleHighlightLine}
              onAddNote={addLineNote}
            />
          </div>
        )}
      </div>

      {/* Modal tạo ảnh thẻ thơ chia sẻ */}
      <SharePoemModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={poem.title}
        author={poem.author}
        content={poem.content}
      />

      {/* Modal báo cáo bản quyền */}
      <ReportPoemModal
        poemId={poem.id}
        poemTitle={poem.title}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentUserId={user?.id}
      />
    </div>
  )
}
