import { PAPER_LOOK, RIBBON_LOOK, type Paper, type Ribbon } from '../lib/wrappedGift'

// The patterns, as <pattern> elements with ids `${prefix}-stars` etc. Put this inside <defs>.
export function PaperPatterns({ prefix, size = 18 }: { prefix: string; size?: number }) {
  const s = size
  return (
    <>
      <pattern id={`${prefix}-stars`} width={s} height={s} patternUnits="userSpaceOnUse">
        <rect width={s} height={s} fill={PAPER_LOOK.stars.base} />
        <path
          d={`M${s / 2} ${s * 0.18} l${s * 0.07} ${s * 0.2} ${s * 0.2} ${s * 0.04} -${s * 0.16} ${s * 0.13} ${s * 0.06} ${s * 0.2} -${s * 0.17} -${s * 0.12} -${s * 0.17} ${s * 0.12} ${s * 0.06} -${s * 0.2} -${s * 0.16} -${s * 0.13} ${s * 0.2} -${s * 0.04} Z`}
          fill="#f4d58d"
        />
      </pattern>
      <pattern id={`${prefix}-dots`} width={s} height={s} patternUnits="userSpaceOnUse">
        <rect width={s} height={s} fill={PAPER_LOOK.dots.base} />
        <circle cx={s * 0.25} cy={s * 0.25} r={s * 0.09} fill="#fbf7ee" />
        <circle cx={s * 0.75} cy={s * 0.75} r={s * 0.09} fill="#fbf7ee" />
      </pattern>
      <pattern id={`${prefix}-snow`} width={s} height={s} patternUnits="userSpaceOnUse">
        <rect width={s} height={s} fill={PAPER_LOOK.snow.base} />
        <path
          d={`M${s / 2} ${s * 0.22} V${s * 0.78} M${s * 0.22} ${s / 2} H${s * 0.78} M${s * 0.3} ${s * 0.3} L${s * 0.7} ${s * 0.7} M${s * 0.7} ${s * 0.3} L${s * 0.3} ${s * 0.7}`}
          stroke="#eaf2ff"
          strokeWidth={s * 0.05}
          strokeLinecap="round"
        />
      </pattern>
    </>
  )
}

// A wrapped present: a box `w` x `h` with its bottom centre at (0, 0). `ribbon`/`bow` can be left off while wrapping.
export function GiftBox({
  prefix,
  paper,
  ribbon,
  bow = true,
  w,
  h,
}: {
  prefix: string
  paper: Paper
  ribbon?: Ribbon
  bow?: boolean
  w: number
  h: number
}) {
  const r = ribbon ? RIBBON_LOOK[ribbon] : undefined
  const band = Math.max(3, w * 0.12)
  return (
    <g>
      <ellipse cx="0" cy="1" rx={w * 0.6} ry={h * 0.06 + 1} fill="rgba(0,0,0,0.25)" />
      <rect x={-w / 2} y={-h} width={w} height={h} fill={`url(#${prefix}-${paper})`} stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
      <rect x={-w / 2} y={-h} width={w * 0.18} height={h} fill="#fff" opacity="0.12" />
      {r && (
        <g>
          <rect x={-band / 2} y={-h} width={band} height={h} fill={r.fill} stroke={r.edge} strokeWidth="0.6" />
          <rect x={-w / 2} y={-h * 0.56 - band / 2} width={w} height={band} fill={r.fill} stroke={r.edge} strokeWidth="0.6" />
          {bow && (
            <g transform={`translate(0 ${-h})`}>
              <path d={`M0 0 C${-w * 0.42} ${-h * 0.42} ${-w * 0.5} 0 0 0 Z`} fill={r.fill} stroke={r.edge} strokeWidth="1" />
              <path d={`M0 0 C${w * 0.42} ${-h * 0.42} ${w * 0.5} 0 0 0 Z`} fill={r.fill} stroke={r.edge} strokeWidth="1" />
              <circle r={band * 0.55} fill={r.fill} stroke={r.edge} strokeWidth="1" />
            </g>
          )}
        </g>
      )}
    </g>
  )
}
