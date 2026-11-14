import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { sounds } from '../../games/sound'
import { useMagicSparks } from '../../hooks/useMagicSparks'
import { ICONS } from '../../lib/icons'
import { getItems, giveItem } from '../../lib/items'
import { garlandY } from '../../lib/garland'
import { Garland } from '../Garland'
import { Icon } from '../Icon'
import { MagicSparks } from '../MagicSparks'

// Door 21: hang a garland along the edge of the ceiling by dragging it from the left to the right (or press the
// button) amid Christmas magic. Then it hangs in the Christmas room with twinkling lights.
const W = 560
const H = 200
const TOP = 26 // where the garland hangs from in this picture
const REACH = 48 // how far ahead of the hung part you can grab it

export function GarlandDoor({ calendarId }: { calendarId: string }) {
  const [hadGarland] = useState(() => getItems(calendarId).garland)
  const [progress, setProgress] = useState(0) // 0..1 of the garland hung up
  const [done, setDone] = useState(false)
  const [auto, setAuto] = useState(false)
  const { sparks, add: addSpark, remove: removeSpark } = useMagicSparks()
  const progressRef = useRef(0)
  const doneRef = useRef(false)
  const dragging = useRef(false)
  const sparkAcc = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearInterval(timer.current), [])

  function complete() {
    doneRef.current = true
    setDone(true)
    giveItem(calendarId, 'garland')
    sounds.magic()
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * W
      addSpark(x, garlandY(x, W, TOP), (Math.random() - 0.5) * 30, 10 + Math.random() * 40)
    }
  }

  // Hang the garland up to x (only ever further, never back).
  function hangTo(x: number) {
    const next = Math.min(1, x / W)
    const before = progressRef.current
    if (next <= before) return
    progressRef.current = next
    setProgress(next)
    sparkAcc.current += (next - before) * W
    while (sparkAcc.current >= 10) {
      sparkAcc.current -= 10
      const at = next * W
      addSpark(at, garlandY(at, W, TOP) + 4, (Math.random() - 0.5) * 24, 14 + Math.random() * 30)
    }
    if (!doneRef.current && next >= 0.98) {
      progressRef.current = 1
      setProgress(1)
      complete()
    }
  }

  const toPicture = (e: PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    return ((e.clientX - box.left) * W) / box.width
  }
  function onPointerDown(e: PointerEvent<SVGSVGElement>) {
    if (auto || doneRef.current) return
    const x = toPicture(e)
    if (x > progressRef.current * W + REACH) return // grab the garland at its loose end
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* not an active pointer: fine */
    }
    dragging.current = true
    hangTo(x)
  }
  function onPointerMove(e: PointerEvent<SVGSVGElement>) {
    if (!dragging.current) return
    const x = toPicture(e)
    // Follow the hand, but you can't skip ahead: it only hangs as far as you actually drag it.
    hangTo(Math.min(x, progressRef.current * W + REACH))
  }
  const onPointerUp = () => {
    dragging.current = false
  }

  function autoHang() {
    if (auto) return
    setAuto(true)
    timer.current = window.setInterval(() => {
      hangTo(progressRef.current * W + 9)
      if (progressRef.current >= 1) {
        window.clearInterval(timer.current)
        setAuto(false)
      }
    }, 16)
  }

  function again() {
    doneRef.current = false
    progressRef.current = 0
    setProgress(0)
    setDone(false)
  }

  const end = progress * W
  return (
    <div className="garland-door">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`garland-stage ${done ? 'done' : ''}`}
        role="img"
        aria-label="Takkanten i julrummet, där girlangen ska hänga"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <defs>
          <pattern id="garland-wall" width="28" height="10" patternUnits="userSpaceOnUse">
            <rect width="28" height="10" fill="#7d2f2f" />
            <rect width="2" height="10" fill="#8f3a3a" />
          </pattern>
          <clipPath id="garland-hung">
            <rect x="-10" y="0" width={end + 10} height={H} />
          </clipPath>
          <radialGradient id="garland-glow">
            <stop offset="0" stopColor="#fff3b0" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff3b0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#garland-wall)" />
        <rect width={W} height="16" fill="#e9dfc9" />
        <rect y="16" width={W} height="4" fill="#cfc3a8" />
        {done && <ellipse cx={W / 2} cy={TOP + 30} rx={W / 1.6} ry="70" fill="url(#garland-glow)" className="wreath-glow-pulse" />}

        {/* where the garland goes, then the part that is already hung */}
        {!done && <path d={`M0 ${TOP} L${W} ${TOP}`} stroke="rgba(244,213,141,0.35)" strokeWidth="2" strokeDasharray="6 8" />}
        <g clipPath="url(#garland-hung)">
          <Garland width={W} top={TOP} lit={done} />
        </g>
        {!done && (
          <g className="garland-grab" transform={`translate(${Math.max(end, 14)} ${garlandY(Math.max(end, 14), W, TOP)})`}>
            <circle r="15" fill="rgba(255,243,176,0.25)" stroke="#f4d58d" strokeWidth="2" strokeDasharray="4 3" />
            <text y="40" textAnchor="middle" className="garland-hint">
              {progress === 0 ? 'Dra härifrån →' : ''}
            </text>
          </g>
        )}
        <MagicSparks sparks={sparks} onDone={removeSpark} />
      </svg>

      <p className="game-status" aria-live="polite">
        {!done &&
          (progress > 0
            ? `${Math.round(progress * 100)} % uppe…`
            : hadGarland
              ? 'Girlangen hänger redan i julrummet, men du kan hänga upp den igen för lite magi ✨'
              : 'Dra girlangen längs takkanten, från vänster till höger!')}
        {done && !hadGarland && (
          <>
            <Icon icon={ICONS.garland} size={20} /> Du fick en girlang! Den hänger nu längs taket i julrummet.
          </>
        )}
        {done && hadGarland && 'Så fint det lyser! ✨'}
      </p>
      <button onClick={done ? again : autoHang} disabled={auto}>
        {done ? 'Ta ner och häng upp igen' : 'Häng upp åt mig'}
      </button>
    </div>
  )
}
