// A snowman (door 7): three snowballs stacked on the ground at (x, ground), plus the things you dress him in.
export type SnowmanPart = 'eyes' | 'nose' | 'hat' | 'scarf' | 'buttons'

export function Snowman({ x, ground, radii, parts }: { x: number; ground: number; radii: number[]; parts: SnowmanPart[] }) {
  // Centres of the balls, bottom first, each one sitting a little into the one below.
  const centres: number[] = []
  radii.forEach((r, i) => {
    const below = i === 0 ? ground : centres[i - 1] - radii[i - 1] * 0.82
    centres.push(below - r * (i === 0 ? 1 : 0.82))
  })
  const has = (p: SnowmanPart) => parts.includes(p)
  const head = radii.length === 3 ? { y: centres[2], r: radii[2] } : null
  const body = radii.length >= 2 ? { y: centres[1], r: radii[1] } : null

  return (
    <g>
      <ellipse cx={x} cy={ground + 1} rx={(radii[0] ?? 10) * 1.1} ry={(radii[0] ?? 10) * 0.18} fill="rgba(60,80,120,0.25)" />
      {radii.map((r, i) => (
        <g key={i}>
          <circle cx={x} cy={centres[i]} r={r} fill="#f7fbff" stroke="#c3d2e6" strokeWidth={Math.max(0.8, r * 0.05)} />
          <circle cx={x - r * 0.35} cy={centres[i] - r * 0.35} r={r * 0.35} fill="#ffffff" opacity="0.8" />
        </g>
      ))}
      {body && has('buttons') &&
        [-0.4, 0, 0.4].map((f) => <circle key={f} cx={x} cy={body.y + f * body.r} r={body.r * 0.09} fill="#2b2b33" />)}
      {head && body && has('scarf') && (
        <g>
          <path
            d={`M${x - head.r * 1.05} ${head.y + head.r * 0.72} Q${x} ${head.y + head.r * 1.12} ${x + head.r * 1.05} ${head.y + head.r * 0.72}`}
            stroke="#c8202e"
            strokeWidth={head.r * 0.34}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M${x + head.r * 0.45} ${head.y + head.r * 0.95} l${head.r * 0.25} ${head.r * 0.85}`}
            stroke="#c8202e"
            strokeWidth={head.r * 0.3}
            strokeLinecap="round"
          />
          <path
            d={`M${x - head.r * 0.7} ${head.y + head.r * 0.82} L${x - head.r * 0.4} ${head.y + head.r * 0.95} M${x - head.r * 0.1} ${head.y + head.r * 0.98} L${x + head.r * 0.2} ${head.y + head.r * 0.96}`}
            stroke="#f4d58d"
            strokeWidth={head.r * 0.12}
            strokeLinecap="round"
          />
        </g>
      )}
      {head && has('eyes') &&
        [-1, 1].map((s) => <circle key={s} cx={x + s * head.r * 0.33} cy={head.y - head.r * 0.18} r={head.r * 0.1} fill="#2b2b33" />)}
      {head && has('eyes') && (
        <path
          d={`M${x - head.r * 0.35} ${head.y + head.r * 0.38} Q${x} ${head.y + head.r * 0.58} ${x + head.r * 0.35} ${head.y + head.r * 0.38}`}
          stroke="#2b2b33"
          strokeWidth={head.r * 0.07}
          strokeDasharray={`${head.r * 0.06} ${head.r * 0.12}`}
          strokeLinecap="round"
          fill="none"
        />
      )}
      {head && has('nose') && (
        <path
          d={`M${x} ${head.y - head.r * 0.02} L${x + head.r * 0.85} ${head.y + head.r * 0.12} L${x} ${head.y + head.r * 0.22} Z`}
          fill="#f08a24"
          stroke="#c0651a"
          strokeWidth={head.r * 0.04}
        />
      )}
      {head && has('hat') && (
        <g>
          <rect x={x - head.r * 0.95} y={head.y - head.r * 0.92} width={head.r * 1.9} height={head.r * 0.2} rx={head.r * 0.08} fill="#22222a" />
          <rect x={x - head.r * 0.6} y={head.y - head.r * 1.75} width={head.r * 1.2} height={head.r * 0.9} rx={head.r * 0.08} fill="#2b2b33" />
          <rect x={x - head.r * 0.6} y={head.y - head.r * 1.12} width={head.r * 1.2} height={head.r * 0.18} fill="#c8202e" />
        </g>
      )}
    </g>
  )
}
