import { useEffect, useRef, useState } from 'react'
import { Icon, SvgIcon } from '../../components/Icon'
import { ICONS } from '../../lib/icons'
import { addPackage, getTree } from '../../lib/tree'
import { addCandy, spendCandy, useCandy } from '../../lib/wallet'

type Outcome = 'nothing' | 'candy' | 'pack'

// Equal slices, so the odds are simply the share of slices: 4/8 nothing, 3/8 candy (which only refunds the spin), 1/8 package.
const SLICES: Outcome[] = ['nothing', 'candy', 'nothing', 'pack', 'nothing', 'candy', 'nothing', 'candy']
const SLICE_ANGLE = 360 / SLICES.length
const COST = 1
const CANDY_PRIZE = 1
const COLORS: Record<Outcome, string> = { nothing: '#4a5d6e', candy: '#d94a85', pack: '#d99a2b' }
const ICON_FOR = { nothing: ICONS.nothing, candy: ICONS.candy, pack: ICONS.pack }

// Angles run clockwise from the top, which is where the pointer is.
const polar = (angle: number, r: number) => {
  const rad = (angle * Math.PI) / 180
  return [100 + r * Math.sin(rad), 100 - r * Math.cos(rad)]
}

function applyOutcome(calendarId: string, outcome: Outcome) {
  if (outcome === 'candy') addCandy(calendarId, CANDY_PRIZE)
  else if (outcome === 'pack') addPackage(calendarId)
}

export function WheelGame({ calendarId }: { calendarId: string }) {
  const candy = useCandy(calendarId)
  const [rot, setRot] = useState(0)
  const [seconds, setSeconds] = useState(4.5)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{ outcome: Outcome; packages: number; hasTree: boolean } | null>(null)
  const pending = useRef<Outcome | null>(null)
  const timer = useRef<number | undefined>(undefined)

  // Closing the dialog mid-spin must not lose the prize.
  useEffect(() => {
    return () => {
      window.clearTimeout(timer.current)
      if (pending.current) {
        applyOutcome(calendarId, pending.current)
        pending.current = null
      }
    }
  }, [calendarId])

  function spin() {
    if (spinning || candy < COST || !spendCandy(calendarId, COST)) return
    // Pick where the wheel stops (never right on a border), and spin to that spot.
    let stop = Math.random() * 360
    while (stop % SLICE_ANGLE < 3 || stop % SLICE_ANGLE > SLICE_ANGLE - 3) stop = Math.random() * 360
    const outcome = SLICES[Math.floor(stop / SLICE_ANGLE)]
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reduced ? 0.4 : 4.5
    const delta = (360 - stop - (rot % 360) + 360) % 360
    setSeconds(duration)
    setRot(rot + (reduced ? 1 : 5) * 360 + delta)
    setSpinning(true)
    setResult(null)
    pending.current = outcome
    timer.current = window.setTimeout(() => {
      applyOutcome(calendarId, outcome)
      pending.current = null
      const tree = getTree(calendarId)
      setResult({ outcome, packages: tree.packages, hasTree: tree.chopped })
      setSpinning(false)
    }, duration * 1000 + 150)
  }

  return (
    <div className="wheel-game">
      <div className="wheel-wrap">
        <div className="wheel-pointer" />
        <div className="wheel-disc" style={{ transform: `rotate(${rot}deg)`, transitionDuration: `${seconds}s` }}>
          <svg viewBox="0 0 200 200" role="img" aria-label="Lyckohjul">
            {SLICES.map((outcome, i) => {
              const [x1, y1] = polar(i * SLICE_ANGLE, 96)
              const [x2, y2] = polar((i + 1) * SLICE_ANGLE, 96)
              const [ix, iy] = polar((i + 0.5) * SLICE_ANGLE, 66)
              return (
                <g key={i}>
                  <path d={`M100 100 L${x1} ${y1} A96 96 0 0 1 ${x2} ${y2} Z`} fill={COLORS[outcome]} stroke="#f4d58d" strokeWidth="1.5" />
                  <SvgIcon icon={ICON_FOR[outcome]} x={ix} y={iy} size={28} />
                </g>
              )
            })}
            <circle cx="100" cy="100" r="9" fill="#f4d58d" />
          </svg>
        </div>
      </div>

      <p className="wheel-balance">
        Du har <strong>{candy}</strong> <Icon icon={ICONS.candy} size={18} /> · ett snurr kostar {COST}{' '}
        <Icon icon={ICONS.candy} size={18} />
      </p>
      <button onClick={spin} disabled={spinning || candy < COST}>
        {spinning ? 'Snurrar…' : 'Snurra hjulet!'}
      </button>
      {candy < COST && !spinning && <p className="hint">Du har ingen godis kvar – spela ett spel för att få mer!</p>}

      <p className="game-status" aria-live="polite">
        {result?.outcome === 'nothing' && 'Ingenting den här gången… försök igen!'}
        {result?.outcome === 'candy' && (
          <>
            Du vann {CANDY_PRIZE} <Icon icon={ICONS.candy} size={18} />!
          </>
        )}
        {result?.outcome === 'pack' && (
          <>
            <Icon icon={ICONS.pack} size={18} /> Du vann ett paket!{' '}
            {result.hasTree
              ? `Det ligger nu under din gran${result.packages > 1 ? ` (${result.packages} paket)` : ''}.`
              : 'Hugg ner en gran i lucka 4 så kan du lägga det under den.'}
          </>
        )}
      </p>
      <p className="hint">
        <Icon icon={ICONS.nothing} size={14} /> ingenting · <Icon icon={ICONS.candy} size={14} /> {CANDY_PRIZE} godis ·{' '}
        <Icon icon={ICONS.pack} size={14} /> paket under granen
      </p>
    </div>
  )
}
