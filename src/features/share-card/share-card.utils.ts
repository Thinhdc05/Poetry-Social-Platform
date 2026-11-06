export interface ShareCardOptions {
  title: string
  lines: string[]
  author: string
  theme: 'paper' | 'sepia' | 'ink'
}

export function generatePoemCardImage(options: ShareCardOptions): string {
  const canvas = document.createElement('canvas')
  const width = 1080
  const height = 1350
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // 1. Phông nền
  let bgColor = '#f8f6f0'
  let textColor = '#2b2622'
  let subColor = '#7a7267'
  let borderColor = '#dfd9cc'

  if (options.theme === 'sepia') {
    bgColor = '#f4eedb'
    textColor = '#433423'
    subColor = '#7e6b56'
    borderColor = '#dfd3bc'
  } else if (options.theme === 'ink') {
    bgColor = '#161514'
    textColor = '#eeeae3'
    subColor = '#9e978d'
    borderColor = '#2d2b27'
  }

  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)

  // Khung viền mộc mạc đôi
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 2
  ctx.strokeRect(48, 48, width - 96, height - 96)
  ctx.strokeRect(56, 56, width - 112, height - 112)

  // 2. Tiêu đề thương hiệu Thơ Mộc
  ctx.fillStyle = subColor
  ctx.font = 'italic 26px Lora, Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText('— Thơ Mộc —', width / 2, 140)

  // 3. Tựa đề bài thơ
  ctx.fillStyle = textColor
  ctx.font = 'bold 52px Lora, Georgia, serif'
  ctx.fillText(options.title, width / 2, 280)

  // Tác giả
  ctx.fillStyle = subColor
  ctx.font = '30px "Plus Jakarta Sans", sans-serif'
  ctx.fillText(`Tác giả: ${options.author}`, width / 2, 340)

  // Đường kẻ ngang mỏng
  ctx.strokeStyle = borderColor
  ctx.beginPath()
  ctx.moveTo(width / 2 - 80, 390)
  ctx.lineTo(width / 2 + 80, 390)
  ctx.stroke()

  // 4. Các dòng thơ (tối đa 8 dòng đẹp nhất)
  ctx.fillStyle = textColor
  ctx.font = '38px Lora, Georgia, serif'
  const startY = 520
  const lineHeight = 66
  options.lines.slice(0, 8).forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight)
  })

  // 5. Đóng con dấu triện chu sa (Vermilion Seal) của thi nhân
  const sealSize = 88
  const sealX = width / 2 - sealSize / 2
  const sealY = height - 260

  ctx.fillStyle = '#8b1e1e'
  ctx.fillRect(sealX, sealY, sealSize, sealSize)

  ctx.strokeStyle = '#fef3c7'
  ctx.lineWidth = 3
  ctx.strokeRect(sealX + 5, sealY + 5, sealSize - 10, sealSize - 10)

  const sealChar = (options.author || 'Mộc').trim().charAt(0).toUpperCase()
  ctx.fillStyle = '#fef3c7'
  ctx.font = 'bold 44px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(sealChar, sealX + sealSize / 2, sealY + sealSize / 2 + 15)

  // 6. Watermark chân trang
  ctx.fillStyle = subColor
  ctx.font = '24px "Plus Jakarta Sans", sans-serif'
  ctx.fillText('thomoc.vn • Nơi câu chữ tìm thấy nhau', width / 2, height - 120)

  return canvas.toDataURL('image/png')
}

export function downloadPoemCard(dataUrl: string, fileName: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `${fileName}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
