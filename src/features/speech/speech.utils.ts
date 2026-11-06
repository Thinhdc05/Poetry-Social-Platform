export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function hasVietnameseVoice(): boolean {
  if (!isSpeechSupported()) return false
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) {
    // Khi danh sách voice chưa tải xong, kiểm tra ngôn ngữ máy
    return typeof navigator !== 'undefined' && (navigator.language.startsWith('vi') || navigator.languages?.some((l) => l.startsWith('vi')))
  }
  return voices.some((v) => v.lang.toLowerCase().includes('vi'))
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel()
  }
}

export function speakPoem(
  text: string,
  onEnd?: () => void,
  onError?: () => void
): boolean {
  if (!isSpeechSupported()) return false

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'vi-VN'
  utterance.rate = 0.88 // Nhịp chậm rãi, trầm lắng hợp với ngâm thơ
  utterance.pitch = 0.95

  // Tìm giọng tiếng Việt nếu trình duyệt có sẵn
  const voices = window.speechSynthesis.getVoices()
  const viVoice = voices.find((v) => v.lang.toLowerCase().includes('vi'))
  if (viVoice) {
    utterance.voice = viVoice
  }

  utterance.onend = () => {
    onEnd?.()
  }

  utterance.onerror = () => {
    onError?.()
  }

  window.speechSynthesis.speak(utterance)
  return true
}
