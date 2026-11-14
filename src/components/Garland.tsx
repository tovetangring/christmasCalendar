import { GARLAND_DIP, garlandY, LIGHT_COLORS, SWAGS } from '../lib/garland'

// A Christmas garland hung in swags along the edge of the ceiling, with little red bows at the hooks and
// coloured lights along it (they twinkle when `lit`). Drawn from x 0 to `width`, hanging from `top`.
export function Garland({ width, top, lit = true }: { width: number; top: number; lit?: boolean }) {
  const swag = width / SWAGS
  const path = Array.from({ length: SWAGS }, (_, i) => {
    const x0 = i * swag
    return `${i === 0 ? `M${x0} ${top}` : ''} Q${x0 + swag / 2} ${top + GARLAND_DIP * 2} ${x0 + swag} ${top}`
  }).join(' ')
  const lights = Array.from({ length: SWAGS * 4 }, (_, i) => (i + 0.5) * (swag / 4))

  return (
    <g>
      <path d={path} fill="none" stroke="#14492a" strokeWidth="11" strokeLinecap="round" />
      <path d={path} fill="none" stroke="#21703f" strokeWidth="8" strokeLinecap="round" strokeDasharray="3 2" />
      <path d={path} fill="none" stroke="#3aa862" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 4" />
      {lights.map((x, i) => {
        const color = LIGHT_COLORS[i % LIGHT_COLORS.length]
        return (
          <circle
            key={i}
            className={lit ? 'garland-light' : undefined}
            cx={x}
            cy={garlandY(x, width, top) + 3}
            r="3"
            style={{ color, fill: 'currentColor', animationDelay: `${(i % 5) * 0.3}s` }}
          />
        )
      })}
      {Array.from({ length: SWAGS + 1 }, (_, i) => (
        <g key={i} transform={`translate(${Math.min(Math.max(i * swag, 8), width - 8)} ${top})`}>
          <ellipse cx="-6" cy="0" rx="6" ry="3.6" transform="rotate(-20 -6 0)" fill="#d8332c" stroke="#8f1d17" strokeWidth="1" />
          <ellipse cx="6" cy="0" rx="6" ry="3.6" transform="rotate(20 6 0)" fill="#d8332c" stroke="#8f1d17" strokeWidth="1" />
          <path d="M-1 1 L-5 10 M1 1 L5 10" stroke="#c0392b" strokeWidth="2.5" strokeLinecap="round" />
          <circle r="2.8" fill="#e04437" stroke="#8f1d17" strokeWidth="1" />
        </g>
      ))}
    </g>
  )
}
