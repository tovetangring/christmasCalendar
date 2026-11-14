// Christmas curtains: red cloth with little white snowflakes, soft folds and a gold trim.
// <CurtainCloth id> holds the patterns (put it in the <defs> of each SVG that draws curtains, with its own id).

export function CurtainCloth({ id }: { id: string }) {
  return (
    <>
      <pattern id={`${id}-print`} width="18" height="18" patternUnits="userSpaceOnUse">
        <rect width="18" height="18" fill="#b3262e" />
        <path d="M9 5 L9 13 M5 9 L13 9 M6.2 6.2 L11.8 11.8 M11.8 6.2 L6.2 11.8" stroke="#fbeee6" strokeWidth="0.9" strokeLinecap="round" />
        <circle cx="0" cy="0" r="1" fill="#f4d58d" />
        <circle cx="18" cy="18" r="1" fill="#f4d58d" />
      </pattern>
      <linearGradient id={`${id}-folds`} x1="0" y1="0" x2="12" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
        <stop offset="0" stopColor="#000" stopOpacity="0.28" />
        <stop offset="0.45" stopColor="#fff" stopOpacity="0.12" />
        <stop offset="1" stopColor="#000" stopOpacity="0.28" />
      </linearGradient>
    </>
  )
}

// One curtain panel hanging from `top` to `bottom`, between x `from` and `to` (from = the side it is gathered at).
export function CurtainPanel({ id, from, to, top, bottom }: { id: string; from: number; to: number; top: number; bottom: number }) {
  const d = `M${from} ${top} L${to} ${top} L${to} ${bottom - 4} Q${(from + to) / 2} ${bottom + 6} ${from} ${bottom} Z`
  return (
    <g>
      <path d={d} fill={`url(#${id}-print)`} />
      <path d={d} fill={`url(#${id}-folds)`} />
      <path d={`M${to} ${top} L${to} ${bottom - 4}`} stroke="#e6c25a" strokeWidth="3" />
      <path d={`M${to} ${bottom - 4} Q${(from + to) / 2} ${bottom + 6} ${from} ${bottom}`} stroke="#e6c25a" strokeWidth="3" fill="none" />
    </g>
  )
}

// The curtains in the Christmas room: tied back at both sides of the window, with a valance on top.
// The room's window frame runs from x 22 to 158 and y 62 to 218.
export function RoomCurtains() {
  const side = (from: number, to: number, tieX: number) => {
    // gathered at the tie-back, so the cloth narrows in the middle
    const pinch = from + (to - from) * 0.35
    const d = `M${from} 56 L${to} 56 Q${pinch} 140 ${tieX} 152 Q${pinch} 170 ${to} 236 L${from} 236 Z`
    return (
      <g>
        <path d={d} fill="url(#room-curtain-print)" />
        <path d={d} fill="url(#room-curtain-folds)" />
        <path d={`M${to} 56 Q${pinch} 140 ${tieX} 152 Q${pinch} 170 ${to} 236`} stroke="#e6c25a" strokeWidth="2.5" fill="none" />
        <ellipse cx={(from + tieX) / 2} cy="152" rx={Math.abs(tieX - from) / 2 + 3} ry="4" fill="#e6c25a" stroke="#a8823a" strokeWidth="1" />
        <circle cx={(from + tieX) / 2} cy="152" r="3.5" fill="#f4d58d" stroke="#a8823a" strokeWidth="1" />
      </g>
    )
  }
  return (
    <g>
      <rect x="6" y="50" width="168" height="4" rx="2" fill="#7a5530" />
      <circle cx="6" cy="52" r="4.5" fill="#e6c25a" />
      <circle cx="174" cy="52" r="4.5" fill="#e6c25a" />
      {side(8, 48, 30)}
      {side(172, 132, 150)}
      {/* valance with a scalloped edge */}
      <path
        d="M10 52 L170 52 L170 66 Q160 76 150 66 Q140 76 130 66 Q120 76 110 66 Q100 76 90 66 Q80 76 70 66 Q60 76 50 66 Q40 76 30 66 Q20 76 10 66 Z"
        fill="url(#room-curtain-print)"
      />
      <path
        d="M10 66 Q20 76 30 66 Q40 76 50 66 Q60 76 70 66 Q80 76 90 66 Q100 76 110 66 Q120 76 130 66 Q140 76 150 66 Q160 76 170 66"
        stroke="#e6c25a"
        strokeWidth="2.5"
        fill="none"
      />
    </g>
  )
}
