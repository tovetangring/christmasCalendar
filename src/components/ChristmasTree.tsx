import { isLit, type TreeState } from '../lib/tree'
import { ICONS } from '../lib/icons'
import { TIERS, halfWidthAt } from '../lib/treeShape'
import { Decoration } from './Decoration'
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
          {has('star') && <Decoration id="star" x={100} y={24} size={34} />}
          {has('ball') && <Decoration id="ball" x={78} y={132} size={22} />}
          {has('bell') && <Decoration id="bell" x={128} y={176} size={22} />}
          {has('stocking') && <Decoration id="stocking" x={62} y={190} size={22} />}
          {has('cookie') && <Decoration id="cookie" x={112} y={112} size={22} />}
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
        {has('gift') && <Decoration id="gift" x={148} y={256} size={30} />}
      </svg>
  )
}
