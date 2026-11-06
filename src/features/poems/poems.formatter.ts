// Hàm viết hoa chữ cái đầu tiên chuẩn Unicode tiếng Việt
export function capitalizeFirstChar(str: string): string {
  const trimmed = str.trim()
  if (!trimmed) return ''
  return trimmed.charAt(0).toLocaleUpperCase('vi-VN') + trimmed.slice(1)
}

export interface FormatPoemOptions {
  capitalize?: boolean
  replaceSlashes?: boolean
  cleanBlankLines?: boolean
}

// Chuẩn hóa và làm sạch nội dung thơ (Linter & Auto-formatter có tùy chọn)
export function formatPoemContent(
  rawContent: string,
  options: FormatPoemOptions = { capitalize: true, replaceSlashes: true, cleanBlankLines: true }
): string {
  if (!rawContent) return ''

  let text = rawContent

  // 1. Thay thế các dấu phân cách dòng thường gặp khi copy từ mạng: //, /, |, ;
  if (options.replaceSlashes !== false) {
    text = text
      .replace(/\s*\/\/\s*/g, '\n\n') // Dấu // biểu thị ngắt khổ
      .replace(/\s*[\/|;]\s*/g, '\n') // Dấu /, |, ; biểu thị ngắt dòng
  }

  // 2. Tách từng dòng và xử lý viết hoa, bỏ khoảng trắng thừa
  const rawLines = text.split('\n')
  const formattedLines: string[] = []

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim()

    if (line.length === 0) {
      if (options.cleanBlankLines !== false) {
        // Tránh lặp nhiều hơn 1 dòng trắng liên tiếp giữa các khổ thơ
        if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
          formattedLines.push('')
        }
      } else {
        formattedLines.push('')
      }
    } else {
      // Viết hoa chữ cái đầu câu thơ (hoặc giữ nguyên nếu tùy chọn tắt)
      formattedLines.push(options.capitalize !== false ? capitalizeFirstChar(line) : line)
    }
  }

  return formattedLines.join('\n').trim()
}

export interface ParsedPoemData {
  title?: string
  author?: string
  mood?: string
  content?: string
  tags?: string[]
}

// Bóc tách dữ liệu từ tệp tin tải lên (.json, .txt, .md)
export async function parsePoemFile(file: File): Promise<ParsedPoemData> {
  const text = await file.text()
  const fileName = file.name.toLowerCase()

  // 1. Nếu là tệp JSON
  if (fileName.endsWith('.json')) {
    try {
      const parsed = JSON.parse(text)
      const data = Array.isArray(parsed) ? parsed[0] : parsed

      return {
        title: data.title || data.name || '',
        author: data.author || data.tac_gia || '',
        mood: data.mood || data.tam_trang || 'Bình yên',
        content: formatPoemContent(data.content || data.noi_dung || data.body || ''),
        tags: Array.isArray(data.tags) ? data.tags : undefined,
      }
    } catch {
      throw new Error('Tệp JSON không đúng định dạng. Vui lòng kiểm tra lại cấu trúc tệp.')
    }
  }

  // 2. Nếu là tệp Text (.txt) hoặc Markdown (.md)
  const lines = text.split('\n')
  let title = ''
  let author = ''
  let mood = ''
  const contentLines: string[] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      contentLines.push('')
      continue
    }

    if (!title && (line.startsWith('# ') || line.toLowerCase().startsWith('tiêu đề:') || line.toLowerCase().startsWith('tựa đề:'))) {
      title = line.replace(/^(#\s*|tiêu đề:\s*|tựa đề:\s*)/i, '').trim()
      continue
    }

    if (!author && (line.toLowerCase().startsWith('tác giả:') || line.toLowerCase().startsWith('thi sĩ:'))) {
      author = line.replace(/^(tác giả:\s*|thi sĩ:\s*)/i, '').trim()
      continue
    }

    if (!mood && (line.toLowerCase().startsWith('tâm trạng:') || line.toLowerCase().startsWith('thể loại:'))) {
      mood = line.replace(/^(tâm trạng:\s*|thể loại:\s*)/i, '').trim()
      continue
    }

    if (!title) {
      title = line
      continue
    }

    contentLines.push(line)
  }

  return {
    title,
    author,
    mood: mood || 'Bình yên',
    content: formatPoemContent(contentLines.join('\n')),
  }
}
