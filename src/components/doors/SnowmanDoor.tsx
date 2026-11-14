import { useEffect, useRef, useState } from 'react'
import { sounds } from '../../games/sound'
import { useMagicSparks } from '../../hooks/useMagicSparks'
import { ICONS } from '../../lib/icons'
import { getItems, giveItem } from '../../lib/items'
import { ignoreKey } from '../../games/keys'
import { Icon } from '../Icon'
import { MagicSparks } from '../MagicSparks'
import { Snowman, type SnowmanPart } from '../Snowman'

// Door 7: build a snowman. Hold the mouse (or Space) to roll a snowball bigger and let go to put it on; each ball has
// to be smaller than the one below or it rolls off. Then dress him, and he stands outside the window of the room.
const W = 300
const H = 230
const GROUND = 200
const X = 150
const START_R = 6
const MAX_R = 46
const GROW_PER_SECOND = 22
const MIN_BOTTOM = 26 // the bottom ball has to carry the others
const MIN_R = 9
const PARTS: { id: SnowmanPart; label: string }[] = [
  { id: 'eyes', label: 'Kolögon' },
  { id: 'nose', label: 'Morot' },
  { id: 'hat', label: 'Hatt' },
  { id: 'scarf', label: 'Halsduk' },
  { id: 'buttons', label: 'Knappar' },
]
const FLAKES: [number, number, number][] = [[30, 0.2, 6], [80, 2.1, 7], [130, 1.1, 5.5], [190, 3.0, 6.5], [240, 0.7, 7.5], [280, 2.6, 6]]

type AddSpark = (x: number, y: number, dx: number, dy: number) => void

// A little glitter where a part was put on.
function sparkleOn(add: AddSpark) {
  for (let i = 0; i < 6; i++) add(X + (Math.random() - 0.5) * 40, 90 + Math.random() * 40, (Math.random() - 0.5) * 30, -10 - Math.random() * 20)
}
// A burst of glitter all around the finished snowman.
function sparkleAround(add: AddSpark) {
  for (let i = 0; i < 36; i++) {
    const a = Math.random() * Math.PI * 2
    add(X + Math.cos(a) * 40, 120 + Math.sin(a) * 60, Math.cos(a) * 50, Math.sin(a) * 40 - 15)
  }
}

export function SnowmanDoor({ calendarId }: { calendarId: string }) {
  const [hadSnowman] = useState(() => getItems(calendarId).snowman)
  const [balls, setBalls] = useState<number[]>([])
  const [growing, setGrowing] = useState<number | null>(null) // the radius of the ball being rolled
  const [parts, setParts] = useState<SnowmanPart[]>([])
  const [message, setMessage] = useState('')
  const [rollingOff, setRollingOff] = useState<{ id: number; r: number } | null>(null)
  const [done, setDone] = useState(false)
  const { sparks, add: addSpark, remove: removeSpark } = useMagicSparks()
  const growRef = useRef<number | null>(null)
  const nextId = useRef(0)

  const stacked = balls.length === 3

  // Roll the ball: it grows for as long as you hold.
  useEffect(() => {
    if (growing === null) return
    let raf = 0
    let last = performance.now()
    const frame = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      growRef.current = Math.min(MAX_R, (growRef.current ?? START_R) + GROW_PER_SECOND * dt)
      setGrowing(growRef.current)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // Only (re)start the loop when rolling starts or stops, not on every size change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [growing === null])

  function startRolling() {
    if (stacked || growRef.current !== null) return
    setMessage('')
    growRef.current = START_R
    setGrowing(START_R)
  }

  function place(r: number) {
    const below = balls[balls.length - 1]
    if (balls.length === 0 && r < MIN_BOTTOM) return 'Lite större! Den nedersta ska bära två bollar till.'
    if (r < MIN_R) return 'Den är för liten – rulla lite längre.'
    if (below !== undefined && r >= below * 0.92) {
      setRollingOff({ id: nextId.current++, r })
      sounds.miss()
      return 'Oj, för stor! Den ramlade av – rulla en mindre.'
    }
    sounds.cut()
    const next = [...balls, r]
    setBalls(next)
    return next.length === 3 ? 'Snyggt! Klä nu på honom.' : ''
  }

  function stopRolling() {
    const r = growRef.current
    if (r === null) return
    growRef.current = null
    setGrowing(null)
    setMessage(place(r))
  }

  // Space works like holding the mouse.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (ignoreKey(e) || e.code !== 'Space' || e.repeat) return
      e.preventDefault()
      startRolling()
    }
    const up = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      e.preventDefault()
      stopRolling()
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  })

  function addPart(id: SnowmanPart) {
    if (parts.includes(id)) return
    const next = [...parts, id]
    setParts(next)
    setMessage('')
    sounds.cut()
    sparkleOn(addSpark)
    if (next.length === PARTS.length) complete()
  }

  function complete() {
    setDone(true)
    setMessage('')
    giveItem(calendarId, 'snowman')
    sounds.magic()
    sparkleAround(addSpark)
  }

  function buildForMe() {
    const sizes = [38, 28, 20]
    setBalls(sizes)
    setParts(PARTS.map((p) => p.id))
    complete()
  }

  function again() {
    setBalls([])
    setParts([])
    setDone(false)
    setMessage('')
  }

  // The ball being rolled is shown where it will go.
  const shown = growing !== null ? [...balls, growing] : balls

  return (
    <div className="snowman-door">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`snowman-stage ${stacked ? 'stacked' : ''}`}
        role="img"
        aria-label="En snöig trädgård där du bygger en snögubbe"
        onPointerDown={(e) => {
          try {
            e.currentTarget.setPointerCapture(e.pointerId)
          } catch {
            /* not an active pointer: fine */
          }
          startRolling()
        }}
        onPointerUp={stopRolling}
        onPointerCancel={stopRolling}
      >
        <defs>
          <linearGradient id="snowman-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#14204a" />
            <stop offset="1" stopColor="#5d6fae" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#snowman-sky)" />
        <circle cx="250" cy="40" r="14" fill="#fff6c8" />
        {[[40, 30], [100, 50], [180, 22], [210, 70]].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="1.3" fill="#fff" />
        ))}
        <polygon points="40,120 64,196 16,196" fill="#1b3a44" />
        <polygon points="262,110 290,196 234,196" fill="#1b3a44" />
        <path d={`M0 ${GROUND - 6} Q150 ${GROUND - 18} 300 ${GROUND - 6} L300 ${H} L0 ${H} Z`} fill="#eef4fb" />
        {done && <ellipse cx={X} cy="130" rx="110" ry="100" fill="rgba(255,243,176,0.18)" className="wreath-glow-pulse" />}
        <Snowman x={X} ground={GROUND} radii={shown} parts={parts} />
        {rollingOff && (
          <circle
            key={rollingOff.id}
            className="snowball-off"
            cx={X}
            cy={GROUND - 90}
            r={rollingOff.r}
            fill="#f7fbff"
            stroke="#c3d2e6"
            onAnimationEnd={() => setRollingOff(null)}
          />
        )}
        {FLAKES.map(([x, delay, duration], i) => (
          <circle key={i} className="room-flake forest-flake" cx={x} cy={-6} r="1.8" fill="#fff" style={{ animationDelay: `-${delay}s`, animationDuration: `${duration}s` }} />
        ))}
        <MagicSparks sparks={sparks} onDone={removeSpark} />
      </svg>

      <p className="game-status" aria-live="polite">
        {message ||
          (done
            ? hadSnowman
              ? 'En till snögubbe! Han står redan utanför fönstret ✨'
              : null
            : stacked
              ? `Klä på snögubben (${parts.length}/${PARTS.length})`
              : growing !== null
                ? 'Rullar…'
                : `Håll inne musen (eller mellanslag) för att rulla snöboll ${balls.length + 1} av 3, släpp för att lägga den.`)}
        {done && !hadSnowman && (
          <>
            <Icon icon={ICONS.snowman} size={20} /> Vilken fin snögubbe! Han står nu ute i snön utanför fönstret i julrummet.
          </>
        )}
      </p>

      {stacked && !done && (
        <div className="snowman-parts">
          {PARTS.map((p) => (
            <button
              key={p.id}
              disabled={parts.includes(p.id)}
              onClick={(e) => {
                addPart(p.id)
                e.currentTarget.blur()
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      {!done && <button onClick={buildForMe}>Bygg åt mig</button>}
      {done && <button onClick={again}>Bygg en till</button>}
    </div>
  )
}
