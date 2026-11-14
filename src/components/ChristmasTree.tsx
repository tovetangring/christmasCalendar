import { isLit, type TreeState } from '../lib/tree'
import { ICONS } from '../lib/icons'
import { TIERS, halfWidthAt } from '../lib/treeShape'
import { SvgIcon } from './Icon'
import { TreeBody, TreeGarland } from './TreeShape'

// Twinkling lights strung along the bottom of each layer of branches (they come on when the tree is fully decorated).
const LIGHTS: [number, number][] = TIERS.flatMap((tier, i) => {
  const y = tier.bottom - 9
  const spread = halfWidthAt(tier, y) * 0.8
  const count = 2 + i
  return Array.from({ length: count }, (_, j): [number, number] => [
    100 - spread + (2 * spread * (j + 0.5)) / count,
    y + (j % 2 ? 2 : -1),
  ])
})
const LIGHT_COLORS = ['#ffd54a', '#ff5e5e', '#5ec8ff', '#7dff8a']

type Props = { tree: TreeState; garland?: boolean; x: number; y: number; width: number; height: number }

// The tree as an <svg> (nested inside the room scene), positioned by x/y/width/height.
// `garland` = the tinsel garland from door 15.
export function ChristmasTree({ tree, garland = false, x, y, width, height }: Props) {
  const has = (id: string) => tree.decorations.some((d) => d === id)
  const lit = isLit(tree)

  return (
      <svg x={x} y={y} width={width} height={height} viewBox="0 0 200 280" className={`xmas-tree ${lit ? 'lit' : ''}`} role="img" aria-label="Din julgran">
        <defs>
          <radialGradient id="ball-shine" cx="35%" cy="35%" r="70%">
            <stop offset="0" stopColor="#ff9c9c" />
            <stop offset="1" stopColor="#b3121c" />
          </radialGradient>
          <radialGradient id="tree-glow">
            <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform="translate(0 10)">
          {lit && <circle className="glow" cx="100" cy="140" r="135" fill="url(#tree-glow)" />}
          <TreeBody />
          {garland && <TreeGarland />}
          {lit &&
            LIGHTS.map(([x, y], i) => {
              const color = LIGHT_COLORS[i % LIGHT_COLORS.length]
              return (
                <circle
                  key={i}
                  className="light"
                  cx={x}
                  cy={y}
                  r="3.5"
                  style={{ color, fill: 'currentColor', animationDelay: `${(i % 5) * 0.25}s` }}
                />
              )
            })}
          {has('star') && <text x="100" y="26" fontSize="34" textAnchor="middle" dominantBaseline="central">⭐</text>}
          {has('ball') && <circle cx="78" cy="132" r="10" fill="url(#ball-shine)" />}
          {has('bell') && <text x="128" y="178" fontSize="22" textAnchor="middle" dominantBaseline="central">🔔</text>}
          {has('stocking') && <text x="62" y="192" fontSize="22" textAnchor="middle" dominantBaseline="central">🧦</text>}
          {has('cookie') && <text x="112" y="112" fontSize="22" textAnchor="middle" dominantBaseline="central">🍪</text>}
        </g>
        {tree.packages > 0 && (
          <g>
            <SvgIcon icon={ICONS.pack} x={52} y={254} size={30} />
            {tree.packages > 1 && (
              <text x="70" y="270" fontSize="14" fontWeight="bold" fill="#fff" stroke="#0f2a1d" strokeWidth="3" paintOrder="stroke">
                ×{tree.packages}
              </text>
            )}
          </g>
        )}
        {has('gift') && <text x="146" y="258" fontSize="30" textAnchor="middle" dominantBaseline="central">🎁</text>}
      </svg>
  )
}
