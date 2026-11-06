import type { Poem } from './poems.types'

/**
 * Sinh số băm nguyên từ chuỗi ngày (YYYY-MM-DD)
 */
function getDailySeed(date = new Date()): number {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const str = `${y}-${m}-${d}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * Thuật toán thông minh chọn Bài Thơ Của Ngày (Poem of the Day):
 * 1. Lọc các bài thơ hoàn chỉnh (ít nhất 4 dòng)
 * 2. Ưu tiên bài có nội dung trang nhã hoặc lượng yêu thích cao
 * 3. Lấy theo chu kỳ ngày để mỗi ngày mở trang chủ là một tuyệt tác mới
 */
export function getDailyFeaturedPoem(poems: Poem[], customSeed?: number): Poem | null {
  if (!poems || poems.length === 0) return null

  // Lọc danh sách bài thơ đủ tiêu chuẩn làm tiêu điểm
  const candidates = poems.filter((p) => {
    const lines = (p.content || '').split('\n').filter((l) => l.trim().length > 0)
    return lines.length >= 4
  })

  const pool = candidates.length > 0 ? candidates : poems
  const seed = customSeed !== undefined ? customSeed : getDailySeed()
  const index = seed % pool.length

  return pool[index]
}

