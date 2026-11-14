import { iconUrl, WHITE_TO_ALPHA, type IconDef } from '../lib/icons'

// Rendered once near the root: turns white pixels see-through for icons with `whiteBackground`.
export function IconFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <filter id="white-to-alpha" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -1.17 -1.17 -1.17 0 3.5" />
      </filter>
    </svg>
  )
}

// An icon as normal page content: the image if one is set, otherwise the emoji.
export function Icon({ icon, size = 24 }: { icon: IconDef; size?: number }) {
  const url = iconUrl(icon)
  return url ? (
    <img
      className="icon"
      src={url}
      alt=""
      draggable={false}
      style={{ width: size, height: size, filter: icon.whiteBackground ? WHITE_TO_ALPHA : undefined }}
    />
  ) : (
    <span className="icon" aria-hidden style={{ fontSize: size, lineHeight: 1 }}>
      {icon.emoji}
    </span>
  )
}

// The same, for use inside an <svg>, centred on (x, y).
export function SvgIcon({ icon, x, y, size }: { icon: IconDef; x: number; y: number; size: number }) {
  const url = iconUrl(icon)
  return url ? (
    <image
      href={url}
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      filter={icon.whiteBackground ? WHITE_TO_ALPHA : undefined}
    />
  ) : (
    <text x={x} y={y} fontSize={size} textAnchor="middle" dominantBaseline="central">
      {icon.emoji}
    </text>
  )
}
