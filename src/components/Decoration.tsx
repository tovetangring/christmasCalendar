import type { DecorationId } from '../games/tree/decorations'
import { DECORATION_ART } from '../lib/decorationArt'

// A tree decoration in SVG, centred on (x, y), `size` wide (see src/lib/decorationArt.ts).
export function Decoration({ id, x, y, size }: { id: DecorationId; x: number; y: number; size: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 24})`}>
      {DECORATION_ART[id].map((layer, i) => (
        <path
          key={i}
          d={layer.d}
          fill={layer.fill ?? 'none'}
          stroke={layer.stroke}
          strokeWidth={layer.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={layer.opacity}
        />
      ))}
    </g>
  )
}

// A small decoration as page content (e.g. the list of what you have collected).
export function DecorationIcon({ id, size = 28 }: { id: DecorationId; size?: number }) {
  return (
    <svg className="icon" viewBox="-13 -14 26 28" width={size} height={size} aria-hidden>
      <Decoration id={id} x={0} y={0} size={24} />
    </svg>
  )
}
