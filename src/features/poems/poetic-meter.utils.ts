/**
 * Bộ thẩm âm & Giám định niêm luật thể thơ Việt Nam
 * (Vietnamese Poetic Meter & Rhythm Analyzer)
 */

export type PoeticFormType =
  | 'luc-bat'
  | 'song-that-luc-bat'
  | 'that-ngon'
  | 'ngu-ngon'
  | 'bon-chu'
  | 'tam-chu'
  | 'tu-do'

export interface LineMeterAnalysis {
  lineIndex: number
  text: string
  wordCount: number
  expectedWordCount?: number
  isAnomaly: boolean
  tones: ('B' | 'T')[] // B: Bằng, T: Trắc
  lastWordTone: 'B' | 'T'
}

export interface PoemMeterReport {
  detectedForm: PoeticFormType
  detectedFormName: string
  totalLines: number
  totalWords: number
  anomaliesCount: number
  lineAnalyses: LineMeterAnalysis[]
  suggestions: string[]
}

// Bảng nhận diện thanh Bằng / Trắc trong tiếng Việt
// Bằng: Không dấu + Dấu huyền
// Trắc: Sắc, Hỏi, Ngã, Nặng
const SAC_CHARS = 'áắấéếíóốớúứý'
const HUYEN_CHARS = 'àằầèềìòồờùừỳ'
const HOI_CHARS = 'ảẳẩẻểỉỏổởủửỷ'
const NGA_CHARS = 'ãẵẫẽễĩõỗỡũữỹ'
const NANG_CHARS = 'ạặậẹệịọộợụựỵ'

export function getWordTone(word: string): 'B' | 'T' {
  const w = word.toLowerCase()
  for (const c of w) {
    if (SAC_CHARS.includes(c) || HOI_CHARS.includes(c) || NGA_CHARS.includes(c) || NANG_CHARS.includes(c)) {
      return 'T' // Thanh Trắc
    }
  }
  // Nếu có dấu huyền hoặc không dấu -> Thanh Bằng
  return 'B'
}

export function analyzePoemMeter(content: string): PoemMeterReport {
  const rawLines = (content || '').replace(/\\n/g, '\n').split('\n')
  const validLines: { idx: number; text: string }[] = []

  rawLines.forEach((l, idx) => {
    const t = l.trim()
    if (t.length > 0) {
      validLines.push({ idx, text: t })
    }
  })

  if (validLines.length === 0) {
    return {
      detectedForm: 'tu-do',
      detectedFormName: 'Thơ Tự Do',
      totalLines: 0,
      totalWords: 0,
      anomaliesCount: 0,
      lineAnalyses: [],
      suggestions: ['Hãy viết vài câu thơ để hệ thống bắt đầu giám định niêm luật.'],
    }
  }

  // 1. Phân tích từng dòng: đếm từ & thanh điệu
  const counts = validLines.map((l) => {
    const words = l.text.split(/\s+/).filter(Boolean)
    const tones = words.map(getWordTone)
    return {
      lineIndex: l.idx,
      text: l.text,
      wordCount: words.length,
      tones,
      lastWordTone: tones[tones.length - 1] || 'B',
    }
  })

  // 2. Nhận diện thể thơ chủ đạo
  let detectedForm: PoeticFormType = 'tu-do'
  let detectedFormName = 'Thơ Tự Do'
  const suggestions: string[] = []

  const totalLines = counts.length
  const totalWords = counts.reduce((acc, c) => acc + c.wordCount, 0)
  const averageWords = Math.round(totalWords / (totalLines || 1))

  // Kiểm tra Lục bát: Có ít nhất 2 câu, câu 0 gần 6 và câu 1 gần 8
  const lucBatMatches = counts.filter((c, i) => (i % 2 === 0 ? c.wordCount === 6 : c.wordCount === 8)).length
  const thatNgonMatches = counts.filter((c) => c.wordCount === 7).length
  const nguNgonMatches = counts.filter((c) => c.wordCount === 5).length
  const bonChuMatches = counts.filter((c) => c.wordCount === 4).length
  const tamChuMatches = counts.filter((c) => c.wordCount === 8).length

  if (totalLines >= 2 && lucBatMatches / totalLines >= 0.6) {
    detectedForm = 'luc-bat'
    detectedFormName = 'Thơ Lục Bát'
  } else if (thatNgonMatches / totalLines >= 0.7) {
    detectedForm = 'that-ngon'
    detectedFormName = 'Thất Ngôn (7 chữ)'
  } else if (nguNgonMatches / totalLines >= 0.7) {
    detectedForm = 'ngu-ngon'
    detectedFormName = 'Ngũ Ngôn (5 chữ)'
  } else if (bonChuMatches / totalLines >= 0.7) {
    detectedForm = 'bon-chu'
    detectedFormName = 'Thơ Bốn Chữ'
  } else if (tamChuMatches / totalLines >= 0.7) {
    detectedForm = 'tam-chu'
    detectedFormName = 'Thơ Tám Chữ'
  } else {
    detectedForm = 'tu-do'
    detectedFormName = `Thơ Tự Do (bình quân ~${averageWords} tiếng/dòng)`
  }

  // 3. Đánh giá dòng lệch nhịp theo thể thơ phát hiện
  const lineAnalyses: LineMeterAnalysis[] = counts.map((c, i) => {
    let expectedWordCount: number | undefined
    let isAnomaly = false

    if (detectedForm === 'luc-bat') {
      expectedWordCount = i % 2 === 0 ? 6 : 8
      if (c.wordCount !== expectedWordCount) {
        isAnomaly = true
      }
    } else if (detectedForm === 'that-ngon') {
      expectedWordCount = 7
      if (c.wordCount !== 7) isAnomaly = true
    } else if (detectedForm === 'ngu-ngon') {
      expectedWordCount = 5
      if (c.wordCount !== 5) isAnomaly = true
    } else if (detectedForm === 'bon-chu') {
      expectedWordCount = 4
      if (c.wordCount !== 4) isAnomaly = true
    } else if (detectedForm === 'tam-chu') {
      expectedWordCount = 8
      if (c.wordCount !== 8) isAnomaly = true
    }

    return {
      lineIndex: c.lineIndex,
      text: c.text,
      wordCount: c.wordCount,
      expectedWordCount,
      isAnomaly,
      tones: c.tones,
      lastWordTone: c.lastWordTone,
    }
  })

  const anomaliesCount = lineAnalyses.filter((l) => l.isAnomaly).length

  // 4. Sinh lời khuyên văn chương
  if (detectedForm === 'luc-bat') {
    if (anomaliesCount === 0) {
      suggestions.push('✨ Tuyệt vời! Cấu trúc xen kẽ 6-8 tiếng của bài Lục bát rất chuẩn chỉnh.')
    } else {
      suggestions.push(`⚠️ Có ${anomaliesCount} dòng chưa đúng nhịp 6 hoặc 8 tiếng của thể Lục bát.`)
    }
  } else if (detectedForm === 'that-ngon') {
    if (anomaliesCount === 0) {
      suggestions.push('✨ Nhịp thất ngôn (7 tiếng) đều đặn, trang trọng và liền mạch.')
    } else {
      suggestions.push(`⚠️ Có ${anomaliesCount} dòng lệch khỏi cấu trúc 7 chữ.`)
    }
  } else {
    suggestions.push('💡 Thơ tự do cho phép phóng bút phá cách, không bị trói buộc niêm luật nghiêm ngặt.')
  }

  return {
    detectedForm,
    detectedFormName,
    totalLines,
    totalWords,
    anomaliesCount,
    lineAnalyses,
    suggestions,
  }
}

