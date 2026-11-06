import type { Poem } from '../poems/poems.types'
import type { OracleDomain, OracleDomainOption, PoeticOracleResult } from './oracle.types'

export const ORACLE_DOMAINS: OracleDomainOption[] = [
  {
    key: 'love',
    name: 'Tình Duyên & Tri Âm',
    icon: '❤️',
    description: 'Hỏi về nhân duyên, sự đồng điệu trong tâm hồn, nỗi nhớ và người tri kỷ',
    mood: 'Tình yêu',
  },
  {
    key: 'career',
    name: 'Chí Hướng & Đường Đời',
    icon: '⛵',
    description: 'Hỏi về sự nghiệp, khát vọng tương lai, bước ngoặt và định hướng',
    mood: 'Khát vọng',
  },
  {
    key: 'peace',
    name: 'Tĩnh Lặng & Buông Bỏ',
    icon: '🍵',
    description: 'Hỏi về bình an nội tại, giải tỏa âu lo, tìm lại chốn an trú giữa đời xô bồ',
    mood: 'Tĩnh lặng',
  },
  {
    key: 'nostalgia',
    name: 'Hoài Niệm & Nỗi Nhớ',
    icon: '🍂',
    description: 'Hỏi về cố nhân, ký ức xưa cũ, nguồn cội và sự chiêm nghiệm thời gian',
    mood: 'Hoài niệm',
  },
]

// Bộ tên quẻ cổ phong theo từng cung
const FORTUNE_NAMES: Record<OracleDomain, string[]> = {
  love: [
    'Quẻ Hải Triều Vọng Nguyệt',
    'Quẻ Dạ Nguyệt Tương Phùng',
    'Quẻ Kim Trọng Tri Âm',
    'Quẻ Hồng Nhan Tương Tri',
    'Quẻ Uyên Ương Họa Điệp',
  ],
  career: [
    'Quẻ Thu Phong Phá Lãng',
    'Quẻ Bách Bộ Vân Tiêu',
    'Quẻ Tây Tiến Hùng Tâm',
    'Quẻ Thanh Vân Đắc Lộ',
    'Quẻ Đăng Phong Nghinh Triều',
  ],
  peace: [
    'Quẻ Thanh Trà Vọng Khách',
    'Quẻ Tĩnh Thủy Lưu Thâm',
    'Quẻ Trúc Lâm Thính Vũ',
    'Quẻ Thiền Tâm Lạc Nguyệt',
    'Quẻ Thư Trai Tức Lự',
  ],
  nostalgia: [
    'Quẻ Tràng Giang Lạc Lối',
    'Quẻ Cố Nhân Vạn Lý',
    'Quẻ Hoàng Hôn Vọng Thê',
    'Quẻ Thu Diệp Quy Căn',
    'Quẻ Thôn Đoài Tương Tư',
  ],
}

const OMENS = [
  'Đại Cát • Nhân Duyên Hòa Hợp',
  'Thượng Cát • Khởi Sắc Bất Ngờ',
  'Cát Tường • Tĩnh Tâm An Ổn',
  'Bình Hòa • Kiên Nhẫn Đợi Thời',
  'Tri Âm • Lòng Người Thấu Hiểu',
]

const INTERPRETATIONS: Record<OracleDomain, string[]> = {
  love: [
    'Tâm tư bạn trao đi không hề uổng phí. Hãy tin vào tiếng gọi chân thành, người hiểu được nhịp đập của bạn đang ở rất gần.',
    'Tình cảm như dòng nước chảy qua khe đá, càng gượng ép càng phân vân. Hãy cứ thả lỏng tâm hồn, duyên lành sẽ tự khắc tròn đầy.',
    'Khoảng lặng hiện tại là cần thiết để đôi bên soi rọi lại cõi lòng. Đừng vội vã phán xét, sự thấu hiểu bắt đầu từ lòng bao dung.',
  ],
  career: [
    'Đường xa vạn dặm bắt đầu từ bước chân kiên trì. Khó khăn lúc này chỉ là lửa thử vàng để bạn tôi luyện bản lĩnh vững vàng.',
    'Thời cơ chuyển mình đang hé lộ như mầm non sau cơn mưa. Hãy dũng cảm đặt bút bắt đầu dự định bạn từng ấp ủ.',
    'Chớ để những nghi ngại xung quanh làm nhụt chí lớn. Người nhìn xa trông rộng luôn chấp nhận vài khúc quanh của số phận.',
  ],
  peace: [
    'Mọi muộn phiền cũng chỉ như chiếc lá rụng rồi tan vào đất. Hãy cho phép bản thân nghỉ ngơi, buông bỏ những kỳ vọng quá nặng nề.',
    'Bình yên không nằm ở nơi chốn không có tiếng ồn, mà nằm ở sự vững chãi trong tâm. Một chén trà ấm hôm nay sẽ giúp lòng bạn phẳng lặng.',
    'Hãy trở về với hơi thở và những điều giản dị quanh mình. Sự giàu có thực sự của một tâm hồn là biết mỉm cười với hiện tại.',
  ],
  nostalgia: [
    'Kỷ niệm dẫu đẹp đến đâu cũng là hành trang để bước tiếp, không phải sợi dây níu giữ. Hãy trân trọng người xưa và mỉm cười với ngày mới.',
    'Nỗi nhớ nhung hôm nay chứng minh rằng bạn từng yêu thương sâu sắc. Hãy biến nỗi niềm ấy thành sự dịu dàng đối đãi với người xung quanh.',
    'Thời gian có thể làm mờ cảnh vật, nhưng tình nghĩa chân thành thì vĩnh cửu. Một lời hỏi thăm bất ngờ sẽ làm ấm lại mối thâm tình.',
  ],
}

/**
 * Trích xuất 2-4 câu thơ tinh hoa nhất từ bài thơ
 */
function extractPoeticStanza(content: string): string {
  const lines = (content || '').replace(/\\n/g, '\n').split('\n').filter((l) => l.trim().length > 0)
  if (lines.length <= 4) {
    return lines.join('\n')
  }
  // Lấy 4 dòng đầu hoặc ngẫu nhiên một khổ thơ
  return lines.slice(0, 4).join('\n')
}

/**
 * Thuật toán gieo quẻ thơ động:
 * 1. Tìm các bài thơ trong Database có liên quan tới Domain hoặc Mood
 * 2. Lấy ngẫu nhiên hoặc tính toán theo hạt giống ngày
 * 3. Sinh quẻ thơ có cấu trúc trang nhã, giàu chất văn
 */
export function drawPoeticOracle(
  domain: OracleDomain,
  poems: Poem[]
): PoeticOracleResult {
  const domainInfo = ORACLE_DOMAINS.find((d) => d.key === domain) || ORACLE_DOMAINS[0]

  // Tìm các bài thơ phù hợp theo mood hoặc tự do
  let eligiblePoems = poems.filter((p) => {
    if (domain === 'love') return p.mood === 'Tình yêu' || p.mood === 'Nỗi nhớ'
    if (domain === 'career') return p.mood === 'Hoài niệm' || p.title.toLowerCase().includes('tây tiến')
    if (domain === 'peace') return p.mood === 'Tĩnh lặng' || p.mood === 'Bình yên'
    if (domain === 'nostalgia') return p.mood === 'Hoài niệm' || p.mood === 'Mưa rơi'
    return true
  })

  if (eligiblePoems.length === 0) {
    eligiblePoems = poems.length > 0 ? poems : []
  }

  // Chọn bài thơ làm căn cứ quẻ
  let chosenPoem: Poem | null = null
  let verses = ''

  if (eligiblePoems.length > 0) {
    const poemIndex = Math.floor(Math.random() * eligiblePoems.length)
    chosenPoem = eligiblePoems[poemIndex]
    verses = extractPoeticStanza(chosenPoem.content)
  }

  // Fallback nếu database trống
  if (!chosenPoem || !verses) {
    verses = 'Dữ dội và dịu êm\nỒn ào và lặng lẽ\nSông không hiểu nổi mình\nSóng tìm ra tận bể.'
    chosenPoem = {
      id: 'fallback-oracle',
      title: 'Sóng',
      author: 'Xuân Quỳnh',
      content: verses,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    }
  }

  const fortuneList = FORTUNE_NAMES[domain] || FORTUNE_NAMES.love
  const interpList = INTERPRETATIONS[domain] || INTERPRETATIONS.love

  const fortuneName = fortuneList[Math.floor(Math.random() * fortuneList.length)]
  const omenType = OMENS[Math.floor(Math.random() * OMENS.length)]
  const interpretation = interpList[Math.floor(Math.random() * interpList.length)]

  return {
    id: `oracle-${Date.now()}`,
    domain,
    domainLabel: domainInfo.name,
    fortuneName,
    omenType,
    verses,
    interpretation,
    poemId: chosenPoem.id,
    poemTitle: chosenPoem.title,
    poemAuthor: chosenPoem.author,
    drawnAt: new Date().toLocaleDateString('vi-VN'),
  }
}

