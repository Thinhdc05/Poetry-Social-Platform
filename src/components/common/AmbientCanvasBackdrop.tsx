import { useEffect, useRef, useState } from 'react'
import { useReading } from '../../features/reading'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  rotation: number
  rotationSpeed: number
  character?: string
}

export function AmbientCanvasBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { activeMood } = useReading()
  const [isEnabled, setIsEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('tho_moc_ambient_motion')
      return saved !== 'false'
    } catch {
      return true
    }
  })

  useEffect(() => {
    if (!isEnabled) return

    // Kiểm tra prefers-reduced-motion của hệ thống
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    // Khởi tạo các hạt tương ứng với tâm trạng hiện tại
    const isAutumn = activeMood === 'Mùa thu'
    const isRain = activeMood === 'Mưa rơi'
    const particleCount = isRain ? 35 : isAutumn ? 16 : 14

    const particles: Particle[] = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: isRain ? Math.random() * 15 + 10 : Math.random() * 3 + 2,
      speedX: isRain ? -1.5 : Math.random() * 0.8 - 0.4,
      speedY: isRain ? Math.random() * 4 + 4 : Math.random() * 0.6 + 0.3,
      opacity: Math.random() * 0.4 + 0.15,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      character: isAutumn ? (Math.random() > 0.5 ? '🍂' : '🍁') : undefined,
    }))

    let isDocumentVisible = !document.hidden

    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    const render = () => {
      if (!isDocumentVisible) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        p.x += p.speedX
        p.y += p.speedY
        p.rotation += p.rotationSpeed

        // Tái tạo khi bay ra khỏi màn hình
        if (p.y > height + 20) {
          p.y = -20
          p.x = Math.random() * width
        }
        if (p.x < -20) p.x = width + 20
        if (p.x > width + 20) p.x = -20

        ctx.save()
        ctx.globalAlpha = p.opacity

        if (isRain) {
          // Vẽ vệt mưa rơi nghiêng thanh mảnh
          ctx.strokeStyle = 'rgba(180, 200, 220, 0.45)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - 3, p.y + p.size)
          ctx.stroke()
        } else if (isAutumn && p.character) {
          // Vẽ lá vàng bay lượn
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.font = '14px serif'
          ctx.fillText(p.character, 0, 0)
        } else {
          // Vẽ đốm sáng ấm áp lơ lửng như ánh nến
          ctx.fillStyle = 'rgba(217, 119, 6, 0.3)'
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isEnabled, activeMood])

  const toggleMotion = () => {
    setIsEnabled((prev) => {
      const next = !prev
      try {
        localStorage.setItem('tho_moc_ambient_motion', String(next))
      } catch {
        // bỏ qua
      }
      return next
    })
  }

  return (
    <>
      {isEnabled && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-0 opacity-80"
        />
      )}

      {/* Nút bật/tắt chuyển động không gian tinh tế ở góc dưới bên trái */}
      <aside aria-label="Điều khiển hiệu ứng không gian" className="fixed bottom-5 left-5 z-40 hidden sm:block">
        <button
          type="button"
          onClick={toggleMotion}
          title={isEnabled ? 'Tắt hiệu ứng lá rơi/mưa bay' : 'Bật hiệu ứng không gian thơ'}
          className="px-3 py-1.5 rounded-full bg-stone-900/80 dark:bg-[#1a1816]/80 border border-stone-800 text-[11px] font-serif text-stone-400 hover:text-amber-300 transition-colors cursor-pointer backdrop-blur-xs flex items-center gap-1.5 shadow-sm"
        >
          <span>{isEnabled ? '🍃' : '🍂'}</span>
          <span>{isEnabled ? 'Không gian: Đang lay động' : 'Không gian: Đang tĩnh'}</span>
        </button>
      </aside>
    </>
  )
}

