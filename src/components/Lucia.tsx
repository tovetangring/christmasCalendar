// Lucia, her maids and a star boy (door 13), and the saffron buns ("lussekatter") they bring.
// Figures stand with their feet at (0, 0) and are about 110 tall.

const CROWN_X = [-16, -11, -5, 0, 5, 11, 16]

// Lucia with her crown of candles. `lit` = how many of the seven candles burn (from the middle out is fine).
// `onCandle` makes the candles clickable (door 13 lets you light them one by one).
export function LuciaFigure({ lit, onCandle }: { lit: boolean[]; onCandle?: (i: number) => void }) {
  return (
    <g>
      <ellipse cx="0" cy="2" rx="26" ry="4" fill="rgba(0,0,0,0.3)" />
      <path d="M-10 -78 L-26 0 L26 0 L10 -78 Z" fill="#fbfbf8" stroke="#d6d1c4" strokeWidth="1.2" />
      <path d="M-14 -56 L14 -56 L16 -48 L-16 -48 Z" fill="#c8202e" />
      <path d="M-4 -50 L-10 -24 M4 -50 L10 -24" stroke="#c8202e" strokeWidth="3" strokeLinecap="round" />
      {/* arms holding a candle */}
      <path d="M-10 -72 Q-16 -56 -4 -46 M10 -72 Q16 -56 4 -46" stroke="#fbfbf8" strokeWidth="7" strokeLinecap="round" fill="none" />
      <rect x="-2" y="-58" width="4" height="12" rx="1" fill="#fff6dc" />
      <path className="lucia-flame" d="M0 -66 C3 -62 3 -60 0 -58 C-3 -60 -3 -62 0 -66 Z" fill="#ffc83d" />
      {/* head, long hair, face */}
      <path d="M-11 -92 Q-14 -74 -10 -70 L10 -70 Q14 -74 11 -92 Z" fill="#e8c27a" />
      <circle cx="0" cy="-88" r="10" fill="#f5cfa0" />
      <circle cx="-3.5" cy="-89" r="1.2" fill="#3b2a1a" />
      <circle cx="3.5" cy="-89" r="1.2" fill="#3b2a1a" />
      <path d="M-3 -84 Q0 -82 3 -84" stroke="#b5675a" strokeWidth="1" fill="none" />
      <path d="M-10 -92 Q0 -102 10 -92 Q6 -97 0 -97 Q-6 -97 -10 -92 Z" fill="#e8c27a" />
      {/* the lingonberry crown with seven candles */}
      <path d="M-18 -96 Q0 -92 18 -96" stroke="#2a7a3d" strokeWidth="4" fill="none" strokeLinecap="round" />
      {[-14, -6, 6, 14].map((x) => (
        <circle key={x} cx={x} cy={-95} r="1.6" fill="#c8202e" />
      ))}
      {CROWN_X.map((x, i) => (
        <g
          key={i}
          className={onCandle ? 'crown-candle' : undefined}
          role={onCandle ? 'button' : undefined}
          tabIndex={onCandle && !lit[i] ? 0 : undefined}
          aria-label={onCandle ? `Tänd ljus ${i + 1}` : undefined}
          onClick={onCandle ? () => onCandle(i) : undefined}
          onKeyDown={
            onCandle
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onCandle(i)
                  }
                }
              : undefined
          }
        >
          <rect x={x - 6} y={-114} width="12" height="22" fill="transparent" />
          <rect x={x - 1.6} y={-106 + Math.abs(x) * 0.18} width="3.2" height={10 - Math.abs(x) * 0.18} rx="0.8" fill="#fff6dc" stroke="#d8cdb5" strokeWidth="0.4" />
          {lit[i] ? (
            <g>
              <circle cx={x} cy={-109 + Math.abs(x) * 0.18} r="5" fill="#ffe9a0" opacity="0.45" />
              <path
                className="lucia-flame"
                style={{ animationDelay: `-${i * 0.17}s` }}
                d={`M${x} ${-112 + Math.abs(x) * 0.18} c2 3 2 5 0 6.4 c-2 -1.4 -2 -3.4 0 -6.4 Z`}
                fill="#ffc83d"
              />
            </g>
          ) : (
            <rect x={x - 0.4} y={-108 + Math.abs(x) * 0.18} width="0.8" height="2.4" fill="#3b2a1a" />
          )}
        </g>
      ))}
    </g>
  )
}

// A maid in white with tinsel in her hair, holding a candle.
export function TarnaFigure() {
  return (
    <g transform="scale(0.88)">
      <ellipse cx="0" cy="2" rx="24" ry="4" fill="rgba(0,0,0,0.3)" />
      <path d="M-10 -78 L-24 0 L24 0 L10 -78 Z" fill="#fbfbf8" stroke="#d6d1c4" strokeWidth="1.2" />
      <path d="M-13 -56 L13 -56 L15 -50 L-15 -50 Z" fill="#e6c25a" />
      <path d="M-10 -72 Q-16 -56 -4 -46 M10 -72 Q16 -56 4 -46" stroke="#fbfbf8" strokeWidth="7" strokeLinecap="round" fill="none" />
      <rect x="-2" y="-58" width="4" height="12" rx="1" fill="#fff6dc" />
      <path className="lucia-flame" d="M0 -66 C3 -62 3 -60 0 -58 C-3 -60 -3 -62 0 -66 Z" fill="#ffc83d" />
      <path d="M-11 -92 Q-14 -76 -10 -72 L10 -72 Q14 -76 11 -92 Z" fill="#7a4a24" />
      <circle cx="0" cy="-88" r="10" fill="#f5cfa0" />
      <circle cx="-3.5" cy="-89" r="1.2" fill="#3b2a1a" />
      <circle cx="3.5" cy="-89" r="1.2" fill="#3b2a1a" />
      <path d="M-10 -92 Q0 -102 10 -92 Q6 -97 0 -97 Q-6 -97 -10 -92 Z" fill="#7a4a24" />
      <path d="M-12 -94 Q0 -100 12 -94" stroke="#f4d58d" strokeWidth="2.4" strokeDasharray="2 1.5" fill="none" />
    </g>
  )
}

// A star boy in a tall pointed hat, holding a star on a stick.
export function StarBoyFigure() {
  return (
    <g transform="scale(0.88)">
      <ellipse cx="0" cy="2" rx="24" ry="4" fill="rgba(0,0,0,0.3)" />
      <path d="M-10 -76 L-22 0 L22 0 L10 -76 Z" fill="#fbfbf8" stroke="#d6d1c4" strokeWidth="1.2" />
      <path d="M12 -64 L22 -96" stroke="#8a6a3a" strokeWidth="2" />
      <path d="M22 -104 l2.4 5 5.4 0.6 -4 3.8 1.2 5.4 -5 -2.8 -5 2.8 1.2 -5.4 -4 -3.8 5.4 -0.6 Z" fill="#f4c842" stroke="#b8862a" strokeWidth="0.8" />
      <path d="M-10 -70 Q-16 -56 -4 -48 M10 -70 Q14 -66 12 -62" stroke="#fbfbf8" strokeWidth="7" strokeLinecap="round" fill="none" />
      <circle cx="0" cy="-86" r="10" fill="#f5cfa0" />
      <circle cx="-3.5" cy="-87" r="1.2" fill="#3b2a1a" />
      <circle cx="3.5" cy="-87" r="1.2" fill="#3b2a1a" />
      <path d="M-11 -92 L0 -132 L11 -92 Z" fill="#fbfbf8" stroke="#d6d1c4" strokeWidth="1" />
      <path d="M0 -114 l1.6 3.2 3.4 0.4 -2.5 2.4 0.7 3.4 -3.2 -1.8 -3.2 1.8 0.7 -3.4 -2.5 -2.4 3.4 -0.4 Z" fill="#f4c842" />
    </g>
  )
}

// One saffron bun: an S-shape with a raisin in each curl.
function Lussekatt({ x, y, r = 0 }: { x: number; y: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <path d="M-7 -2 C-11 -7 -5 -10 -2 -6 C1 -2 2 2 5 4 C9 7 12 2 8 -1" stroke="#c97a1a" strokeWidth="5.6" strokeLinecap="round" fill="none" />
      <path d="M-7 -2 C-11 -7 -5 -10 -2 -6 C1 -2 2 2 5 4 C9 7 12 2 8 -1" stroke="#f0a83a" strokeWidth="3.6" strokeLinecap="round" fill="none" />
      <circle cx="-6.2" cy="-5.4" r="1.4" fill="#3b1e10" />
      <circle cx="8" cy="2.6" r="1.4" fill="#3b1e10" />
    </g>
  )
}

// A tray of lussekatter. Origin = where it stands.
export function LussekattTray() {
  return (
    <g>
      <ellipse cx="0" cy="1" rx="26" ry="4.5" fill="rgba(0,0,0,0.25)" />
      <ellipse cx="0" cy="-1" rx="24" ry="5" fill="#a8b3bd" stroke="#7d8892" strokeWidth="1" />
      <ellipse cx="0" cy="-2" rx="21" ry="3.8" fill="#cfd8e0" />
      <Lussekatt x={-11} y={-6} r={-8} />
      <Lussekatt x={9} y={-6} r={12} />
      <Lussekatt x={-1} y={-11} r={2} />
    </g>
  )
}
