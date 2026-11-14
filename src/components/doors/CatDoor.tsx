import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { sounds } from '../../games/sound'
import { feedCat, getItems } from '../../lib/items'
import { BlackCat, FloorFish } from '../RoomPets'

// Door 16: a black cat peeks in. Lure it closer by slowly dragging a treat (the fish from door 5, or a ball of yarn
// if you have none); too fast and it gets scared. Then pet it until it purrs. A cat that got the fish stays in the
// room; with only the yarn it plays for a while and then pads off.
const W = 320
const H = 200
const FLOOR = 172
const CAT_START = 290
const ARRIVED = 150 // the cat has come in once it is this far left
const FOLLOW_GAP = 40 // the cat stops this far from the treat
const CAT_SPEED = 55 // units per second
const SCARY_SPEED = 420 // dragging faster than this scares the cat
const PET_NEEDED = 900 // how much stroking it takes
const HEART = 'M0 9 C-19 -5 -11 -23 0 -13 C11 -23 19 -5 0 9 Z'

type Phase = 'lure' | 'eat' | 'pet' | 'done' | 'leaving'

// A ball of red yarn with a loose thread, origin = where it lies on the floor.
function Yarn() {
  return (
    <g>
      <ellipse cx="0" cy="1" rx="12" ry="2.5" fill="rgba(0,0,0,0.25)" />
      <path d="M8 -4 C22 -2 26 2 40 -1" stroke="#c8202e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="0" cy="-10" r="10" fill="#d8332c" stroke="#8f1d17" strokeWidth="1" />
      <path d="M-8 -14 Q0 -6 8 -16 M-9 -8 Q0 -2 9 -10 M-4 -19 Q2 -10 -2 -1" stroke="#ff7a70" strokeWidth="1.2" fill="none" />
    </g>
  )
}

export function CatDoor({ calendarId }: { calendarId: string }) {
  const [start] = useState(() => getItems(calendarId))
  const withFish = start.fish && !start.cat // the cat eats the fish and moves in
  const [phase, setPhase] = useState<Phase>('lure')
  const [catX, setCatX] = useState(CAT_START)
  const [treatX, setTreatX] = useState(70)
  const [walking, setWalking] = useState(false)
  const [message, setMessage] = useState('')
  const [petted, setPetted] = useState(0) // 0..1
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([])
  const catRef = useRef(CAT_START)
  const treatRef = useRef(70)
  const scaredRef = useRef(false)
  const lastMove = useRef<{ x: number; t: number } | null>(null)
  const lastY = useRef<number | null>(null)
  const petRef = useRef(0)
  const heartAcc = useRef(0)
  const lastPurr = useRef(0)
  const nextId = useRef(0)
  const timers = useRef<number[]>([])
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((t) => window.clearTimeout(t))
  }, [])

  function arrive() {
    setWalking(false)
    if (withFish) {
      feedCat(calendarId) // it ate the fish, so it moves in
      setPhase('eat')
      setMessage('Mums! Katten åt upp fisken.')
      sounds.cut()
      timers.current.push(
        window.setTimeout(() => {
          setMessage('')
          setPhase('pet')
        }, 1400),
      )
    } else {
      setPhase('pet')
    }
  }

  // The cat walks towards the treat (or back out when scared, or away at the end).
  useEffect(() => {
    if (phase !== 'lure' && phase !== 'leaving') return
    let raf = 0
    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      let x = catRef.current
      let moving = false
      if (phase === 'leaving') {
        x += CAT_SPEED * 1.6 * dt
        moving = true
      } else if (scaredRef.current) {
        x = Math.min(CAT_START, x + CAT_SPEED * 3 * dt)
        moving = x < CAT_START
        if (!moving) scaredRef.current = false
      } else if (treatRef.current + FOLLOW_GAP < x) {
        x = Math.max(treatRef.current + FOLLOW_GAP, x - CAT_SPEED * dt)
        moving = true
      }
      catRef.current = x
      setCatX(x)
      setWalking(moving)
      if (phase === 'lure' && x <= ARRIVED && !scaredRef.current) {
        arrive()
        return
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // arrive() only changes state; the loop restarts when the phase changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function finish() {
    petRef.current = 1
    setPetted(1)
    if (withFish) feedCat(calendarId) // (already done on arrival, unless "do it for me" skipped it)
    sounds.purr()
    if (withFish || start.cat) {
      setPhase('done')
    } else {
      setPhase('leaving')
      timers.current.push(window.setTimeout(() => setPhase('done'), 2600))
    }
  }

  const toPicture = (e: PointerEvent<SVGSVGElement>): [number, number] => {
    const box = e.currentTarget.getBoundingClientRect()
    return [((e.clientX - box.left) * W) / box.width, ((e.clientY - box.top) * H) / box.height]
  }

  function onPointerDown(e: PointerEvent<SVGSVGElement>) {
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* not an active pointer: fine */
    }
    lastMove.current = { x: toPicture(e)[0], t: performance.now() }
  }

  function onPointerMove(e: PointerEvent<SVGSVGElement>) {
    const [x, y] = toPicture(e)
    const now = performance.now()
    const prev = lastMove.current
    if (phase === 'lure' && e.buttons && prev) {
      const speed = Math.abs(x - prev.x) / Math.max(0.001, (now - prev.t) / 1000)
      const nextTreat = Math.max(40, Math.min(catRef.current - 20, x))
      treatRef.current = nextTreat
      setTreatX(nextTreat)
      if (speed > SCARY_SPEED && Math.abs(x - prev.x) > 6 && !scaredRef.current && catRef.current < CAT_START - 10) {
        scaredRef.current = true
        setMessage('För snabbt – katten blev rädd! Ta det lugnt.')
        sounds.miss()
      } else if (!scaredRef.current && message.startsWith('För snabbt')) {
        setMessage('')
      }
    }
    // Petting: stroke the cat with the mouse.
    if (phase === 'pet' && prev && Math.abs(x - catRef.current) < 34 && y > 95 && y < FLOOR) {
      const moved = Math.abs(x - prev.x) + Math.abs(y - (lastY.current ?? y))
      petRef.current = Math.min(1, petRef.current + moved / PET_NEEDED)
      setPetted(petRef.current)
      heartAcc.current += moved
      if (heartAcc.current > 70) {
        heartAcc.current = 0
        const id = nextId.current++
        setHearts((all) => [...all.slice(-8), { id, x: catRef.current + (id % 3) * 10 - 10 }])
      }
      if (now - lastPurr.current > 1700) {
        lastPurr.current = now
        sounds.purr()
      }
      if (petRef.current >= 1) finish()
    }
    lastMove.current = { x, t: now }
    lastY.current = y
  }

  function doItForMe() {
    timers.current.forEach((t) => window.clearTimeout(t))
    scaredRef.current = false
    catRef.current = ARRIVED
    setCatX(ARRIVED)
    treatRef.current = ARRIVED - FOLLOW_GAP
    setTreatX(ARRIVED - FOLLOW_GAP)
    setMessage('')
    finish()
  }

  const treatGone = withFish ? phase !== 'lure' : false
  const showTreat = !treatGone && (phase === 'lure' || !withFish)

  return (
    <div className="cat-door">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`cat-stage phase-${phase}`}
        role="img"
        aria-label="En svart katt tittar in"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (lastMove.current = null)}
      >
        <defs>
          <pattern id="cat-floor" width="80" height="22" patternUnits="userSpaceOnUse">
            <rect width="80" height="22" fill="#9c6a3a" />
            <rect y="20" width="80" height="2" fill="#7a4f28" />
            <rect x="38" width="2" height="20" fill="#7a4f28" />
          </pattern>
        </defs>
        <rect width={W} height="120" fill="#7d2f2f" />
        <rect y="112" width={W} height="8" fill="#e9dfc9" />
        <rect y="120" width={W} height={H - 120} fill="url(#cat-floor)" />
        {/* a doorway on the right, where the cat comes from */}
        <rect x="282" y="20" width="44" height="100" fill="#2a1a12" />
        <rect x="276" y="16" width="6" height="104" fill="#5a3516" />

        {showTreat && (
          <g transform={`translate(${treatX} ${FLOOR})`} className={phase === 'lure' ? 'cat-treat' : undefined}>
            {withFish ? (
              <g transform="scale(0.9)">
                <FloorFish />
              </g>
            ) : (
              <Yarn />
            )}
          </g>
        )}
        <g transform={`translate(${catX} ${FLOOR}) scale(0.95)`}>
          <g className={walking ? 'cat-walk' : petted > 0 && phase === 'pet' ? 'cat-purring' : undefined}>
            <BlackCat />
          </g>
        </g>
        {hearts.map((h) => (
          <g key={h.id} transform={`translate(${h.x} ${FLOOR - 104})`}>
            <path className="cat-heart" d={HEART} fill="#e0263a" stroke="#9c1423" strokeWidth="1.5" onAnimationEnd={() => setHearts((all) => all.filter((x) => x.id !== h.id))} />
          </g>
        ))}
        {phase === 'pet' && (
          <g>
            <rect x="110" y="16" width="100" height="10" rx="5" fill="rgba(0,0,0,0.35)" stroke="#f4d58d" strokeWidth="1" />
            <rect x="110" y="16" width={100 * petted} height="10" rx="5" fill="#e0263a" />
          </g>
        )}
      </svg>

      <p className="game-status" aria-live="polite">
        {message ||
          (phase === 'lure' &&
            (withFish
              ? 'En katt tittar in! Dra fisken sakta mot dig för att locka in den.'
              : start.cat
                ? 'Katten vill leka! Dra garnnystanet sakta mot dig.'
                : 'En katt tittar in! Locka in den genom att sakta dra garnnystanet mot dig.')) ||
          (phase === 'pet' && 'Klappa katten! Dra musen fram och tillbaka över den.') ||
          (phase === 'leaving' && 'Katten lekte en stund men tassar nu iväg…') ||
          (phase === 'done' &&
            (withFish
              ? 'Katten spinner nöjt och har flyttat in – nu sitter den på golvet i julrummet.'
              : start.cat
                ? 'Katten spinner nöjt i julrummet.'
                : 'Katten gick sin väg. Den kanske stannar om den får något gott att äta…'))}
      </p>
      {(phase === 'lure' || phase === 'pet') && <button onClick={doItForMe}>Gör det åt mig</button>}
    </div>
  )
}
