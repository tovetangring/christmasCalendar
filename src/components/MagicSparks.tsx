import type { CSSProperties } from 'react'
import type { Spark } from '../hooks/useMagicSparks'

// Draws the glittering stars from useMagicSparks inside an SVG (in that SVG's coordinates).
const STAR = 'M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z'

export function MagicSparks({ sparks, onDone }: { sparks: Spark[]; onDone: (id: number) => void }) {
  return (
    <>
      {sparks.map((s) => (
        <g key={s.id} transform={`translate(${s.x} ${s.y})`}>
          <path
            className="magic-spark"
            d={STAR}
            fill={s.color}
            style={{ '--dx': `${s.dx}px`, '--dy': `${s.dy}px`, '--s': s.size } as CSSProperties}
            onAnimationEnd={() => onDone(s.id)}
          />
        </g>
      ))}
    </>
  )
}
