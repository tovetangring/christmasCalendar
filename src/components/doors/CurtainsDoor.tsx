import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { sounds } from '../../games/sound'
import { useMagicSparks } from '../../hooks/useMagicSparks'
import { ICONS } from '../../lib/icons'
import { getItems, giveCurtains } from '../../lib/items'
import { CurtainCloth, CurtainPanel } from '../Curtains'
import { Icon } from '../Icon'
import { MagicSparks } from '../MagicSparks'

// Door 19: new Christmas curtains hang closed in front of a window. Drag them apart (or press the button)
// amid Christmas magic, and they are yours: they then hang in the window of the Christmas room.
const ROD_Y = 34
const BOTTOM = 226
const LEFT_EDGE = 46
const RIGHT_EDGE = 254
const MIDDLE = 150
const GATHERED = 0.22 // how much of its width a curtain keeps when fully opened
const PULL = (MIDDLE - LEFT_EDGE) * (1 - GATHERED) // drag distance that opens a curtain all the way

type Side = 'left' | 'right'
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const FLAKES: [number, number, number][] = [[90, 0.3, 5], [120, 1.8, 6.5], [150, 0.9, 5.5], [180, 2.6, 6], [210, 1.2, 7]]

export function CurtainsDoor({ calendarId }: { calendarId: string }) {
  const [hadCurtains] = useState(() => getItems(calendarId).curtains)
  const [open, setOpen] = useState({ left: 0, right: 0 })
  const [done, setDone] = useState(false)
  const [auto, setAuto] = useState(false)
  const { sparks, add: addSpark, remove: removeSpark } = useMagicSparks()
  const openRef = useRef({ left: 0, right: 0 })
  const doneRef = useRef(false)
  const drag = useRef<{ side: Side; startX: number; startOpen: number; scale: number } | null>(null)
  const sparkAcc = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearInterval(timer.current), [])

  const innerEdge = (side: Side, value: number) =>
    side === 'left' ? MIDDLE - (MIDDLE - LEFT_EDGE) * (1 - GATHERED) * value : MIDDLE + (RIGHT_EDGE - MIDDLE) * (1 - GATHERED) * value

  function complete() {
    doneRef.current = true
    setDone(true)
    giveCurtains(calendarId)
    sounds.magic()
    for (let i = 0; i < 36; i++) {
      const a = Math.random() * Math.PI * 2
      addSpark(MIDDLE + Math.cos(a) * 40, 130 + Math.sin(a) * 50, Math.cos(a) * 50, Math.sin(a) * 50 - 12)
    }
  }

  function setSide(side: Side, value: number) {
    const before = openRef.current[side]
    const next = { ...openRef.current, [side]: clamp01(value) }
    openRef.current = next
    setOpen(next)
    // Glitter along the edge of the curtain as it moves.
    sparkAcc.current += Math.abs(next[side] - before) * PULL
    while (sparkAcc.current >= 6) {
      sparkAcc.current -= 6
      const x = innerEdge(side, next[side])
      addSpark(x, 50 + Math.random() * 170, (side === 'left' ? 1 : -1) * (8 + Math.random() * 18), -10 - Math.random() * 20)
    }
    if (!doneRef.current && next.left >= 0.97 && next.right >= 0.97) {
      openRef.current = { left: 1, right: 1 }
      setOpen(openRef.current)
      complete()
    }
  }

  function onPointerDown(e: PointerEvent<SVGSVGElement>) {
    if (auto) return
    const box = e.currentTarget.getBoundingClientRect()
    const scale = 300 / box.width // screen pixels -> picture units
    const side: Side = (e.clientX - box.left) * scale < MIDDLE ? 'left' : 'right'
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* not an active pointer: fine */
    }
    drag.current = { side, startX: e.clientX, startOpen: openRef.current[side], scale }
  }
  function onPointerMove(e: PointerEvent<SVGSVGElement>) {
    const d = drag.current
    if (!d) return
    const moved = (e.clientX - d.startX) * d.scale * (d.side === 'left' ? -1 : 1)
    setSide(d.side, d.startOpen + moved / PULL)
  }
  const onPointerUp = () => {
    drag.current = null
  }

  function autoOpen() {
    if (auto) return
    setAuto(true)
    timer.current = window.setInterval(() => {
      const { left, right } = openRef.current
      if (left < 1) setSide('left', left + 0.04)
      if (right < 1) setSide('right', right + 0.04)
      if (openRef.current.left >= 1 && openRef.current.right >= 1) {
        window.clearInterval(timer.current)
        setAuto(false)
      }
    }, 16)
  }

  function again() {
    doneRef.current = false
    openRef.current = { left: 0, right: 0 }
    setOpen(openRef.current)
    setDone(false)
  }

  const progress = (open.left + open.right) / 2

  return (
    <div className="curtains-door">
      <svg
        viewBox="0 0 300 250"
        className={`curtains-stage ${done ? 'done' : ''}`}
        role="img"
        aria-label="Ett fönster med stängda julgardiner"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <defs>
          <CurtainCloth id="door-curtain" />
          <linearGradient id="curtains-night" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#14204a" />
            <stop offset="1" stopColor="#34478f" />
          </linearGradient>
          <radialGradient id="curtains-glow">
            <stop offset="0" stopColor="#fff3b0" stopOpacity="0.7" />
            <stop offset="1" stopColor="#fff3b0" stopOpacity="0" />
          </radialGradient>
          <clipPath id="curtains-pane">
            <rect x="70" y="50" width="160" height="160" />
          </clipPath>
        </defs>

        <rect width="300" height="250" fill="#7d2f2f" />
        {/* the window and the view outside */}
        <rect x="60" y="40" width="180" height="180" rx="3" fill="#efe6d2" />
        <rect x="70" y="50" width="160" height="160" fill="url(#curtains-night)" />
        <g clipPath="url(#curtains-pane)">
          <circle cx="196" cy="78" r="13" fill="#fff6c8" />
          {[[96, 70], [130, 92], [168, 64], [210, 118]].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="1.3" fill="#fff" />
          ))}
          <polygon points="100,150 124,206 76,206" fill="#1b3a44" />
          <polygon points="200,140 228,206 172,206" fill="#1b3a44" />
          {FLAKES.map(([x, delay, duration], i) => (
            <circle key={i} className="room-flake" cx={x} cy={52} r="1.8" fill="#fff" style={{ animationDelay: `-${delay}s`, animationDuration: `${duration}s` }} />
          ))}
          <ellipse cx="150" cy="212" rx="96" ry="12" fill="#f4f8ff" />
        </g>
        <rect x="148" y="50" width="4" height="160" fill="#efe6d2" />
        <rect x="70" y="128" width="160" height="4" fill="#efe6d2" />
        <rect x="52" y="218" width="196" height="10" rx="2" fill="#d8cdb5" />
        <ellipse cx="150" cy="130" rx="110" ry="100" fill="url(#curtains-glow)" opacity={done ? 0.9 : progress * 0.5} className={done ? 'wreath-glow-pulse' : undefined} />

        {/* the curtains */}
        <g className="curtain-grab">
          <CurtainPanel id="door-curtain" from={LEFT_EDGE} to={innerEdge('left', open.left)} top={ROD_Y + 2} bottom={BOTTOM} />
          <CurtainPanel id="door-curtain" from={RIGHT_EDGE} to={innerEdge('right', open.right)} top={ROD_Y + 2} bottom={BOTTOM} />
        </g>
        <rect x="36" y={ROD_Y - 3} width="228" height="5" rx="2.5" fill="#7a5530" />
        <circle cx="36" cy={ROD_Y - 0.5} r="6" fill="#e6c25a" />
        <circle cx="264" cy={ROD_Y - 0.5} r="6" fill="#e6c25a" />
        {done &&
          [LEFT_EDGE + 12, RIGHT_EDGE - 12].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy="140" rx="16" ry="4.5" fill="#e6c25a" stroke="#a8823a" strokeWidth="1" />
              <circle cx={x} cy="140" r="4" fill="#f4d58d" stroke="#a8823a" strokeWidth="1" />
            </g>
          ))}
        <MagicSparks sparks={sparks} onDone={removeSpark} />
      </svg>

      <p className="game-status" aria-live="polite">
        {!done &&
          (progress > 0
            ? `${Math.round(progress * 100)} % öppet…`
            : hadCurtains
              ? 'Gardinerna hänger redan i julrummet, men du kan öppna dem igen för lite magi ✨'
              : 'Dra isär gardinerna med musen, åt vänster och åt höger!')}
        {done && !hadCurtains && (
          <>
            <Icon icon={ICONS.curtains} size={20} /> ✨ Du fick juliga gardiner! De hänger nu i fönstret i julrummet.
          </>
        )}
        {done && hadCurtains && 'Så fint det blev! ✨'}
      </p>
      <button onClick={done ? again : autoOpen} disabled={auto}>
        {done ? 'Dra för igen' : 'Dra isär åt mig'}
      </button>
    </div>
  )
}
