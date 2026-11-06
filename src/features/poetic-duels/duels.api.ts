import type { PoeticResponse, CreatePoeticResponseInput } from './duels.types'

const STORAGE_KEY = 'tho_moc_poetic_responses_v1'
const INITIAL_RESPONSES: PoeticResponse[] = []

function loadStoredResponses(): PoeticResponse[] {
  if (typeof window === 'undefined') return INITIAL_RESPONSES
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return INITIAL_RESPONSES
    }
    const parsed = JSON.parse(raw) as PoeticResponse[]
    // Loại bỏ các response mẫu cũ gắn với poemId số
    return parsed.filter((r) => r.poemId !== '1' && r.poemId !== '2' && r.poemId !== '3' && r.poemId !== '4')
  } catch {
    return INITIAL_RESPONSES
  }
}

function saveStoredResponses(list: PoeticResponse[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // Bỏ qua nếu bộ nhớ đầy
  }
}

export function getResponsesByPoemId(poemId: string): PoeticResponse[] {
  const all = loadStoredResponses()
  return all.filter((r) => r.poemId === poemId)
}

export function getAllResponsesCountByPoem(): Record<string, number> {
  const all = loadStoredResponses()
  return all.reduce<Record<string, number>>((acc, item) => {
    acc[item.poemId] = (acc[item.poemId] || 0) + 1
    return acc
  }, {})
}

export function addPoeticResponse(input: CreatePoeticResponseInput): PoeticResponse {
  const all = loadStoredResponses()
  const created: PoeticResponse = {
    id: `resp-${Date.now()}`,
    poemId: input.poemId,
    authorName: input.authorName || 'Thi hữu ẩn danh',
    authorId: input.authorId,
    content: input.content.trim(),
    createdAt: new Date().toLocaleDateString('vi-VN'),
    likesCount: 1,
    isAuthorEndorsed: false,
    rhymeNote: input.rhymeNote?.trim() || 'Thơ họa đáp',
  }
  const updated = [created, ...all]
  saveStoredResponses(updated)
  return created
}

export function toggleResponseLike(responseId: string): PoeticResponse[] {
  const all = loadStoredResponses()
  const updated = all.map((r) =>
    r.id === responseId ? { ...r, likesCount: r.likesCount + 1 } : r
  )
  saveStoredResponses(updated)
  return updated
}

export function toggleAuthorEndorse(responseId: string): PoeticResponse[] {
  const all = loadStoredResponses()
  const updated = all.map((r) =>
    r.id === responseId ? { ...r, isAuthorEndorsed: !r.isAuthorEndorsed } : r
  )
  saveStoredResponses(updated)
  return updated
}
