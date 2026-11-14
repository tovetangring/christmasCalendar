import { useState } from 'react'
import { sounds } from '../../games/sound'
import { useMagicSparks } from '../../hooks/useMagicSparks'
import { getWrappedGift, PAPER_LOOK, PAPERS, RIBBON_LOOK, RIBBONS, saveWrappedGift, type Paper, type Ribbon } from '../../lib/wrappedGift'
import { MagicSparks } from '../MagicSparks'
import { GiftBox, PaperPatterns } from '../WrappedGift'

// Door 22: wrap a Christmas present. Pick a paper, fold in the four sides (click them), pick a ribbon and put the
// bow on. The present then lies under the tree in the Christmas room.
const BOX = { x: 100, y: 70, w: 100, h: 80 }
type Side = 'left' | 'right' | 'top' | 'bottom'
const SIDES: Side[] = ['left', 'right', 'top', 'bottom']
const SIDE_LABEL: Record<Side, string> = { left: 'vänstra', right: 'högra', top: 'övre', bottom: 'nedre' }

// The flap of paper sticking out on each side, and the part of the box it covers once folded in
// (the sides cover the edges; it is fully wrapped once the top and bottom are folded too).
const FLAP: Record<Side, string> = {
  left: `M${BOX.x} ${BOX.y} L${BOX.x - 62} ${BOX.y + 12} L${BOX.x - 62} ${BOX.y + BOX.h - 12} L${BOX.x} ${BOX.y + BOX.h} Z`,
  right: `M${BOX.x + BOX.w} ${BOX.y} L${BOX.x + BOX.w + 62} ${BOX.y + 12} L${BOX.x + BOX.w + 62} ${BOX.y + BOX.h - 12} L${BOX.x + BOX.w} ${BOX.y + BOX.h} Z`,
  top: `M${BOX.x} ${BOX.y} L${BOX.x + 12} ${BOX.y - 44} L${BOX.x + BOX.w - 12} ${BOX.y - 44} L${BOX.x + BOX.w} ${BOX.y} Z`,
  bottom: `M${BOX.x} ${BOX.y + BOX.h} L${BOX.x + 12} ${BOX.y + BOX.h + 44} L${BOX.x + BOX.w - 12} ${BOX.y + BOX.h + 44} L${BOX.x + BOX.w} ${BOX.y + BOX.h} Z`,
}
const COVER: Record<Side, { x: number; y: number; w: number; h: number; origin: string }> = {
  left: { x: BOX.x, y: BOX.y, w: BOX.w * 0.36, h: BOX.h, origin: `${BOX.x}px ${BOX.y + BOX.h / 2}px` },
  right: { x: BOX.x + BOX.w * 0.64, y: BOX.y, w: BOX.w * 0.36, h: BOX.h, origin: `${BOX.x + BOX.w}px ${BOX.y + BOX.h / 2}px` },
  top: { x: BOX.x, y: BOX.y, w: BOX.w, h: BOX.h / 2, origin: `${BOX.x + BOX.w / 2}px ${BOX.y}px` },
  bottom: { x: BOX.x, y: BOX.y + BOX.h / 2, w: BOX.w, h: BOX.h / 2, origin: `${BOX.x + BOX.w / 2}px ${BOX.y + BOX.h}px` },
}

type AddSpark = (x: number, y: number, dx: number, dy: number) => void
function sparkleAround(add: AddSpark) {
  for (let i = 0; i < 36; i++) {
    const a = Math.random() * Math.PI * 2
    add(150 + Math.cos(a) * 60, 110 + Math.sin(a) * 50, Math.cos(a) * 50, Math.sin(a) * 40 - 15)
  }
}

export function GiftWrapDoor({ calendarId }: { calendarId: string }) {
  const [hadGift] = useState(() => getWrappedGift(calendarId) !== null)
  const [paper, setPaper] = useState<Paper | null>(null)
  const [folded, setFolded] = useState<Side[]>([])
  const [ribbon, setRibbon] = useState<Ribbon | null>(null)
  const [done, setDone] = useState(false)
  const { sparks, add: addSpark, remove: removeSpark } = useMagicSparks()

  const allFolded = folded.length === SIDES.length

  function fold(side: Side) {
    if (!paper || folded.includes(side)) return
    sounds.cut()
    setFolded((f) => [...f, side])
  }

  function putOnBow() {
    if (!paper || !ribbon) return
    setDone(true)
    saveWrappedGift(calendarId, { paper, ribbon })
    sounds.magic()
    sparkleAround(addSpark)
  }

  function wrapForMe() {
    const p = paper ?? 'stars'
    const r = ribbon ?? 'gold'
    setPaper(p)
    setFolded([...SIDES])
    setRibbon(r)
    setDone(true)
    saveWrappedGift(calendarId, { paper: p, ribbon: r })
    sounds.magic()
    sparkleAround(addSpark)
  }

  function again() {
    setPaper(null)
    setFolded([])
    setRibbon(null)
    setDone(false)
  }

  return (
    <div className="giftwrap-door">
      <svg viewBox="0 0 300 220" className="giftwrap-stage" role="img" aria-label="Ett bord där du slår in en julklapp">
        <defs>
          <PaperPatterns prefix="wrap" />
          <pattern id="wrap-table" width="60" height="20" patternUnits="userSpaceOnUse">
            <rect width="60" height="20" fill="#9c6a3a" />
            <rect y="18" width="60" height="2" fill="#7a4f28" />
          </pattern>
        </defs>
        <rect width="300" height="220" fill="url(#wrap-table)" />

        {done ? (
          <g>
            <ellipse cx="150" cy="120" rx="120" ry="90" fill="rgba(255,243,176,0.2)" className="wreath-glow-pulse" />
            <g transform="translate(150 180)">
              <GiftBox prefix="wrap" paper={paper!} ribbon={ribbon!} w={110} h={88} />
            </g>
          </g>
        ) : (
          <g>
            {/* the paper under the box, with the flaps that still stick out */}
            {paper &&
              SIDES.filter((s) => !folded.includes(s)).map((s) => (
                <path
                  key={s}
                  className="wrap-flap"
                  role="button"
                  tabIndex={0}
                  aria-label={`Vik in den ${SIDE_LABEL[s]} kanten`}
                  d={FLAP[s]}
                  fill={`url(#wrap-${paper})`}
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="1"
                  onClick={() => fold(s)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      fold(s)
                    }
                  }}
                />
              ))}
            {/* the cardboard box */}
            <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} fill="#c9a06c" stroke="#8a6a3a" strokeWidth="2" />
            <path d={`M${BOX.x} ${BOX.y + BOX.h / 2} H${BOX.x + BOX.w}`} stroke="#a8824e" strokeWidth="2" strokeDasharray="5 4" />
            {paper && !allFolded && (
              <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} fill="none" stroke="rgba(255,243,176,0.7)" strokeWidth="1.5" strokeDasharray="4 4" />
            )}
            {folded.map((s) => {
              const c = COVER[s]
              return (
                <rect
                  key={s}
                  className="wrap-folded"
                  x={c.x}
                  y={c.y}
                  width={c.w}
                  height={c.h}
                  fill={`url(#wrap-${paper})`}
                  stroke="rgba(0,0,0,0.25)"
                  strokeWidth="0.8"
                  style={{ transformOrigin: c.origin, '--fold': s === 'left' || s === 'right' ? 'scaleX(0)' : 'scaleY(0)' } as React.CSSProperties}
                />
              )
            })}
            {allFolded && ribbon && (
              <g>
                <rect x={145} y={BOX.y} width={10} height={BOX.h} fill={RIBBON_LOOK[ribbon].fill} stroke={RIBBON_LOOK[ribbon].edge} strokeWidth="0.6" />
                <rect x={BOX.x} y={BOX.y + 32} width={BOX.w} height={10} fill={RIBBON_LOOK[ribbon].fill} stroke={RIBBON_LOOK[ribbon].edge} strokeWidth="0.6" />
              </g>
            )}
          </g>
        )}
        <MagicSparks sparks={sparks} onDone={removeSpark} />
      </svg>

      <p className="game-status" aria-live="polite">
        {!paper && 'Välj ett papper att slå in julklappen i:'}
        {paper && !allFolded && `Vik in kanterna – klicka på dem (${folded.length}/4)`}
        {allFolded && !ribbon && 'Fint! Välj ett band:'}
        {allFolded && ribbon && !done && 'Sätt på rosetten!'}
        {done && (hadGift ? 'Ett nytt paket! Det ligger nu under granen i stället för det gamla ✨' : 'Vilken fin julklapp! Den ligger nu under granen i julrummet ✨')}
      </p>

      {!paper && (
        <div className="giftwrap-choices">
          {PAPERS.map((p) => (
            <button key={p} onClick={() => setPaper(p)} aria-label={PAPER_LOOK[p].label}>
              <svg viewBox="0 0 36 24" width="54" height="36" aria-hidden>
                <defs>
                  <PaperPatterns prefix={`swatch-${p}`} size={12} />
                </defs>
                <rect width="36" height="24" rx="3" fill={`url(#swatch-${p}-${p})`} />
              </svg>
            </button>
          ))}
        </div>
      )}
      {allFolded && !ribbon && (
        <div className="giftwrap-choices">
          {RIBBONS.map((r) => (
            <button key={r} onClick={() => setRibbon(r)} aria-label={`${RIBBON_LOOK[r].label} band`}>
              <span className="ribbon-swatch" style={{ background: RIBBON_LOOK[r].fill, borderColor: RIBBON_LOOK[r].edge }} />
              {RIBBON_LOOK[r].label}
            </button>
          ))}
        </div>
      )}
      {allFolded && ribbon && !done && <button onClick={putOnBow}>🎀 Sätt på rosetten</button>}
      {!done && <button onClick={wrapForMe}>Slå in åt mig</button>}
      {done && <button onClick={again}>Slå in en ny</button>}
    </div>
  )
}
