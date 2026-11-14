import { SWAGS, TIERS, TREE_GREENS, halfWidthAt, swagPoint, tierPath } from '../lib/treeShape'

// The tree itself, drawn in the tree picture's coordinates (see src/lib/treeShape.ts).
export function TreeBody() {
  return (
    <g>
      {/* trunk with a little bark */}
      <rect x="90" y="200" width="20" height="42" fill="#6b4423" />
      <rect x="90" y="200" width="6" height="42" fill="#7d5230" />
      <path d="M100 206 L101 222 M105 214 L104 236 M94 220 L95 234" stroke="#4a2c14" strokeWidth="1.3" strokeLinecap="round" />
      {/* the layers, bottom first so the upper ones lie on top, each with a shadow below it */}
      {TIERS.map((tier, i) => ({ tier, i }))
        .reverse()
        .map(({ tier, i }) => {
          const needles = 3 + i
          const needleY = tier.top + (tier.bottom - tier.top) * 0.72
          const spread = halfWidthAt(tier, needleY) * 0.75
          return (
            <g key={i}>
              {i < TIERS.length - 1 && <path d={tierPath(tier, 5)} fill="#0b3d22" opacity="0.35" />}
              <path d={tierPath(tier)} fill={TREE_GREENS[i]} />
              {/* the shady left half gives the tree some depth */}
              <path d={`M100 ${tier.top} L${100 - tier.half} ${tier.bottom} L100 ${tier.bottom + 4} Z`} fill="#000" opacity="0.12" />
              {Array.from({ length: needles }, (_, j) => {
                const x = 100 - spread + (2 * spread * (j + 0.5)) / needles
                const side = x < 100 ? -1 : 1
                return (
                  <path
                    key={j}
                    d={`M${x} ${needleY - 4} l${side * 5} 7`}
                    stroke="#5fcb88"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    opacity="0.55"
                  />
                )
              })}
            </g>
          )
        })}
    </g>
  )
}

// The gold tinsel garland, wound from the bottom up. `progress` 0..1 = how much of it is on the tree.
export function TreeGarland({ progress = 1 }: { progress?: number }) {
  const n = SWAGS.length
  return (
    <g className="tree-garland">
      {SWAGS.map((swag, k) => {
        const share = Math.max(0, Math.min(1, progress * n - k))
        if (share <= 0) return null
        const forwards = k % 2 === 0 // zigzag: every other swag goes the other way
        const [x0, y0] = swagPoint(swag, 0, forwards)
        const [x1, y1] = swagPoint(swag, 1, forwards)
        const d = `M${x0} ${y0} Q100 ${swag.y + 2 * swag.dip} ${x1} ${y1}`
        const dash = { pathLength: 1, strokeDasharray: `${share} 1` }
        return (
          <g key={k}>
            <path d={d} fill="none" stroke="#a8823a" strokeWidth="5" strokeLinecap="round" {...dash} />
            <path d={d} fill="none" stroke="#f4d58d" strokeWidth="3.5" strokeLinecap="round" {...dash} />
            <path d={d} fill="none" stroke="#fff8d6" strokeWidth="1.6" strokeLinecap="round" pathLength={1} strokeDasharray={`0.012 0.03`} opacity={share >= 1 ? 0.9 : 0} />
          </g>
        )
      })}
    </g>
  )
}
