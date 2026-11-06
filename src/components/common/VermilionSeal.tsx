interface VermilionSealProps {
  text: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'square' | 'rounded' | 'circle'
  className?: string
  title?: string
}

const SIZE_MAP = {
  xs: { box: 24, font: 11, border: 1.5 },
  sm: { box: 32, font: 14, border: 1.8 },
  md: { box: 44, font: 18, border: 2 },
  lg: { box: 56, font: 24, border: 2.2 },
  xl: { box: 72, font: 32, border: 2.5 },
}

/**
 * Con dấu Triện Chu Sa (Vermilion Seal) truyền thống của Thơ Mộc.
 * Màu đỏ son chu sa trầm mặc, viền kép cổ điển, khắc chữ bút danh thi nhân.
 */
export function VermilionSeal({
  text,
  size = 'md',
  shape = 'square',
  className = '',
  title,
}: VermilionSealProps) {
  const { box, font, border } = SIZE_MAP[size] || SIZE_MAP.md
  const displayChar = (text || 'M').trim().charAt(0).toUpperCase()
  const padding = border * 2

  const rx = shape === 'circle' ? box / 2 : shape === 'rounded' ? 6 : 2
  const innerRx = shape === 'circle' ? (box - padding * 2) / 2 : shape === 'rounded' ? 4 : 1

  return (
    <svg
      width={box}
      height={box}
      viewBox={`0 0 ${box} ${box}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      role="img"
      aria-label={title || `Ấn triện ${displayChar}`}
    >
      {title && <title>{title}</title>}
      {/* Nền son chu sa trầm */}
      <rect
        x="0.5"
        y="0.5"
        width={box - 1}
        height={box - 1}
        rx={rx}
        className="fill-red-900/90 dark:fill-red-950 stroke-red-800 dark:stroke-red-700"
        strokeWidth="1"
      />

      {/* Viền mực trong (double border phong cách ấn triện) */}
      <rect
        x={padding}
        y={padding}
        width={box - padding * 2}
        height={box - padding * 2}
        rx={innerRx}
        className="stroke-amber-100/70 dark:stroke-amber-200/60"
        strokeWidth={border}
      />

      {/* Ký tự khắc chìm/nổi kiểu thư pháp mộc */}
      <text
        x={box / 2}
        y={box / 2 + font * 0.35}
        textAnchor="middle"
        fontFamily="Playfair Display, Georgia, Cambria, serif"
        fontWeight="800"
        fontSize={font}
        className="fill-amber-100 dark:fill-amber-100/90 tracking-tight"
        style={{ letterSpacing: '-0.02em' }}
      >
        {displayChar}
      </text>
    </svg>
  )
}

