// Christmas cookies (door 9): the shapes you cut out, and the plate of them left in the window for Santa.
export type CookieKind = 'star' | 'heart' | 'tree'

const STAR = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 ? 6 : 14
  const a = (Math.PI / 5) * i - Math.PI / 2
  return `${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`
}).join(' L')
const SHAPES: Record<CookieKind, string> = {
  star: `M${STAR} Z`,
  heart: 'M0 11 C-17 -1 -11 -15 0 -7 C11 -15 17 -1 0 11 Z',
  tree: 'M0 -14 L9 -3 L5 -3 L11 7 L2 7 L2 12 L-2 12 L-2 7 L-11 7 L-5 -3 L-9 -3 Z',
}

// One cookie centred on (x, y). `color` = the dough colour (it browns in the oven); `iced` adds white icing.
export function CookieShape({ kind, x, y, scale = 1, color, iced = false, rotate = 0 }: {
  kind: CookieKind
  x: number
  y: number
  scale?: number
  color: string
  iced?: boolean
  rotate?: number
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path d={SHAPES[kind]} fill={color} stroke="rgba(80,40,10,0.45)" strokeWidth="1.2" strokeLinejoin="round" />
      {iced && <path d={SHAPES[kind]} transform="scale(0.72)" fill="none" stroke="#fffaf0" strokeWidth="1.6" strokeDasharray="2 2" strokeLinejoin="round" />}
    </g>
  )
}

// A plate of iced cookies with a glass of milk, standing on the window sill. Origin = where the plate touches the sill.
export function CookiePlate() {
  return (
    <g>
      <ellipse cx="0" cy="0" rx="24" ry="4.5" fill="#cfd8e0" />
      <ellipse cx="0" cy="-1.5" rx="21" ry="3.6" fill="#ffffff" stroke="#b9c4ce" strokeWidth="1" />
      <CookieShape kind="heart" x={-9} y={-7} scale={0.55} color="#c98a3e" iced rotate={-12} />
      <CookieShape kind="tree" x={9} y={-8} scale={0.55} color="#b97a34" iced rotate={10} />
      <CookieShape kind="star" x={0} y={-12} scale={0.55} color="#c98a3e" iced rotate={4} />
      {/* the glass of milk */}
      <g transform="translate(34 0)">
        <path d="M-6 -22 L6 -22 L5 0 L-5 0 Z" fill="rgba(220,235,245,0.55)" stroke="#9fb3c2" strokeWidth="1" />
        <path d="M-5.6 -16 L5.6 -16 L5 0 L-5 0 Z" fill="#fbfdff" />
        <ellipse cx="0" cy="-16" rx="5.6" ry="1.4" fill="#ffffff" />
      </g>
    </g>
  )
}
