import type { ImportPoemInput } from '../admin/admin.types'

export interface ParseResult {
  poems: ImportPoemInput[]
  errors: string[]
}

/**
 * Phân tích và kiểm tra tính hợp lệ của file JSON nhập bài thơ.
 * Định dạng mong đợi:
 * [
 *   {
 *     "title": "Tiêu đề bài thơ",
 *     "content": "Nội dung bài thơ...",
 *     "author": "Tác giả (tùy chọn)",
 *     "tags": ["thơ lục bát", "thơ tình"]
 *   }
 * ]
 */
export function parsePoemsJson(jsonString: string): ParseResult {
  const errors: string[] = []
  const poems: ImportPoemInput[] = []

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch (err) {
    return {
      poems: [],
      errors: ['Định dạng JSON không hợp lệ: ' + (err instanceof Error ? err.message : String(err))],
    }
  }

  if (!Array.isArray(parsed)) {
    return {
      poems: [],
      errors: ['Nội dung JSON phải là một mảng danh sách bài thơ (bắt đầu bằng [ và kết thúc bằng ]).'],
    }
  }

  if (parsed.length === 0) {
    return {
      poems: [],
      errors: ['Tệp JSON rỗng, không tìm thấy bài thơ nào.'],
    }
  }

  parsed.forEach((item, index) => {
    const itemNum = index + 1
    if (typeof item !== 'object' || item === null) {
      errors.push(`Mục thứ ${itemNum} không phải là một đối tượng hợp lệ.`)
      return
    }

    const record = item as Record<string, unknown>
    const title = typeof record.title === 'string' ? record.title.trim() : ''
    const content = typeof record.content === 'string' ? record.content.trim() : ''
    const author = typeof record.author === 'string' ? record.author.trim() : undefined

    let tags: string[] | undefined
    if (Array.isArray(record.tags)) {
      tags = record.tags
        .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
        .map((t) => t.trim())
    }

    if (!title) {
      errors.push(`Mục thứ ${itemNum}: Thiếu tiêu đề (title).`)
      return
    }

    if (!content) {
      errors.push(`Mục thứ ${itemNum} ("${title}"): Thiếu nội dung thơ (content).`)
      return
    }

    poems.push({
      title,
      content,
      author,
      tags,
    })
  })

  return { poems, errors }
}

