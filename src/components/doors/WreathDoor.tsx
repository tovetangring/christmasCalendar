import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { sounds } from '../../games/sound'
import { ICONS } from '../../lib/icons'
import { getItems, giveItem } from '../../lib/items'
import { Icon } from '../Icon'
import { useMagicSparks } from '../../hooks/useMagicSparks'
import { MagicSparks } from '../MagicSparks'
import { Wreath } from '../Wreath'

// Door 12: spin the wreath one full turn (drag it round, or press the button) amid Christmas magic, and it is yours.
const TURN = 360

const angleOf = (e: PointerEvent<SVGSVGElement>) => {
  const box = e.currentTarget.getBoundingClientRect()
  return (Math.atan2(e.clientY - (box.top + box.height / 2), e.clientX - (box.left + box.width / 2)) * 180) / Math.PI
}

export function WreathDoor({ calendarId }: { calendarId: string }) {
  const [hadWreath] = useState(() => getItems(calendarId).wreath)
  const [total, setTotal] = useState(0) // degrees turned so far (signed)
  const [done, setDone] = useState(false)
  const { sparks, add: addSpark, remove: removeSpark } = useMagicSparks()
  const [autoSpinning, setAutoSpinning] = useState(false)
  const totalRef = useRef(0)
  const doneRef = useRef(false)
  const lastAngle = useRef<number | null>(null)
  const sparkAcc = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearInterval(timer.current), [])

  // A star flying outwards from the wreath at the given angle.
  function spark(angleDeg: number, radius: number, far = 26) {
    const a = (angleDeg * Math.PI) / 180
    const drift = far * (0.6 + Math.random() * 0.8)
    const out = Math.random() * Math.PI * 2
    addSpark(
      Math.cos(a) * radius,
      Math.sin(a) * radius,
      Math.cos(a) * drift + Math.cos(out) * 8,
      Math.sin(a) * drift + Math.sin(out) * 8 - 10,
    )
  }

  function complete() {
    doneRef.current = true
    setDone(true)
    giveItem(calendarId, 'wreath')
    sounds.magic()
    for (let i = 0; i < 40; i++) spark(Math.random() * 360, 40 + Math.random() * 30, 60)
  }

  function turnBy(delta: number, at: number) {
    totalRef.current += delta
    setTotal(totalRef.current)
    sparkAcc.current += Math.abs(delta)
    while (sparkAcc.current >= 9) {
      sparkAcc.current -= 9
      spark(at + (Math.random() - 0.5) * 40, 52 + Math.random() * 12)
    }
    if (!doneRef.current && Math.abs(totalRef.current) >= TURN) complete()
  }

  function onPointerDown(e: PointerEvent<SVGSVGElement>) {
    if (autoSpinning) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId) // keeps the drag going when the pointer leaves the picture
    } catch {
      /* not an active pointer: fine */
    }
    lastAngle.current = angleOf(e)
  }
  function onPointerMove(e: PointerEvent<SVGSVGElement>) {
    if (lastAngle.current === null) return
    const now = angleOf(e)
    let d = now - lastAngle.current
    if (d > 180) d -= 360
    if (d < -180) d += 360
    lastAngle.current = now
    turnBy(d, now)
  }
  const onPointerUp = () => {
    lastAngle.current = null
  }

  function autoSpin() {
    if (autoSpinning) return
    setAutoSpinning(true)
    // One more full turn in the direction it was already going, which is always enough to finish the turn.
    const direction = totalRef.current < 0 ? -1 : 1
    let turned = 0
    timer.current = window.setInterval(() => {
      const step = 5
      turned += step
      turnBy(step * direction, totalRef.current - 90)
      if (turned >= TURN) {
        window.clearInterval(timer.current)
        setAutoSpinning(false)
      }
    }, 16)
  }

  const progress = Math.min(Math.abs(total) / TURN, 1)
  const circumference = 2 * Math.PI * 78

  return (
    <div className="wreath-door">
      <svg
        viewBox="-100 -100 200 200"
        className={`wreath-stage ${done ? 'done' : ''}`}
        role="img"
        aria-label="En krans att snurra"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <defs>
          <radialGradient id="wreath-glow">
            <stop offset="0" stopColor="#fff3b0" stopOpacity="0.8" />
            <stop offset="1" stopColor="#fff3b0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle r="96" fill="url(#wreath-glow)" opacity={done ? 0.9 : progress * 0.6} className={done ? 'wreath-glow-pulse' : undefined} />
        <circle r="78" fill="none" stroke="rgba(244,213,141,0.25)" strokeWidth="3" />
        <circle
          r="78"
          fill="none"
          stroke="#f4d58d"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${circumference * progress} ${circumference}`}
          transform="rotate(-90)"
        />
        <g style={{ transform: `rotate(${total}deg)` }} className="wreath-spinner">
          <Wreath />
        </g>
        <MagicSparks sparks={sparks} onDone={removeSpark} />
      </svg>

      <p className="game-status" aria-live="polite">
        {!done &&
          (progress > 0
            ? `${Math.round(progress * 100)} % av ett varv…`
            : hadWreath
              ? 'Kransen hänger redan på dörren, men du kan snurra den för lite magi ✨'
              : 'Snurra kransen ett varv: dra runt den med musen!')}
        {done && !hadWreath && (
          <>
            <Icon icon={ICONS.wreath} size={20} /> ✨ Du fick en krans! Den hänger nu på dörren i julrummet.
          </>
        )}
        {done && hadWreath && 'Kransen hänger redan på dörren – men den snurrar gärna igen ✨'}
      </p>
      <button onClick={autoSpin} disabled={autoSpinning}>
        {done ? 'Snurra igen' : 'Snurra åt mig'}
      </button>
    </div>
  )
}
