import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { sounds } from '../../games/sound'
import { useMagicSparks } from '../../hooks/useMagicSparks'
import { ICONS } from '../../lib/icons'
import { getItems, giveItem } from '../../lib/items'
import { CookiePlate, CookieShape, type CookieKind } from '../Cookies'
import { Icon } from '../Icon'
import { MagicSparks } from '../MagicSparks'

// Door 9: bake Christmas cookies for Santa. Cut six cookies out of the dough, put them in the oven and take them
// out when they are golden (not too early, not burnt). Then a plate of them stands in the window of the room.
const W = 300
const H = 220
const DOUGH = { x: 30, y: 34, w: 240, h: 132 }
const COUNT = 6
const GAP = 34 // cookies can't be cut closer together than this
const KINDS: CookieKind[] = ['star', 'heart', 'tree']
const BAKE_SECONDS = 5
const GOLDEN = { from: 0.55, to: 0.8 } // the part of the bake that is just right
// Ready-made spots for "do it for me".
const SPOTS: [number, number][] = [[72, 72], [150, 70], [228, 74], [76, 130], [152, 128], [226, 132]]

type Cookie = { x: number; y: number; kind: CookieKind }
type Phase = 'cut' | 'baking' | 'burnt' | 'done'

// Dough -> golden -> burnt, as the bake goes from 0 to 1.
function doughColor(t: number) {
  const stops: [number, [number, number, number]][] = [
    [0, [232, 199, 154]],
    [GOLDEN.from, [214, 160, 88]],
    [GOLDEN.to, [184, 116, 50]],
    [1, [70, 40, 20]],
  ]
  for (let i = 1; i < stops.length; i++) {
    const [t1, c1] = stops[i]
    const [t0, c0] = stops[i - 1]
    if (t <= t1) {
      const f = (t - t0) / (t1 - t0)
      return `rgb(${c0.map((c, j) => Math.round(c + (c1[j] - c) * f)).join(',')})`
    }
  }
  return 'rgb(70,40,20)'
}

export function CookieDoor({ calendarId }: { calendarId: string }) {
  const [hadPlate] = useState(() => getItems(calendarId).cookies)
  const [phase, setPhase] = useState<Phase>('cut')
  const [cookies, setCookies] = useState<Cookie[]>([])
  const [bake, setBake] = useState(0) // 0..1
  const [message, setMessage] = useState('')
  const { sparks, add: addSpark, remove: removeSpark } = useMagicSparks()
  const bakeRef = useRef(0)

  // The oven: the bake goes up over BAKE_SECONDS; leaving them in too long burns them.
  useEffect(() => {
    if (phase !== 'baking') return
    let raf = 0
    const start = performance.now()
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / 1000 / BAKE_SECONDS)
      bakeRef.current = t
      setBake(t)
      if (t >= 1) {
        sounds.miss()
        setMessage('')
        setPhase('burnt')
        return
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  function cutAt(x: number, y: number) {
    if (phase !== 'cut' || cookies.length >= COUNT) return
    const inside = x > DOUGH.x + 16 && x < DOUGH.x + DOUGH.w - 16 && y > DOUGH.y + 16 && y < DOUGH.y + DOUGH.h - 16
    if (!inside) return
    if (cookies.some((c) => Math.hypot(c.x - x, c.y - y) < GAP)) {
      setMessage('Lite längre isär, annars går kakorna ihop!')
      return
    }
    setMessage('')
    sounds.cut()
    setCookies((all) => [...all, { x, y, kind: KINDS[all.length % KINDS.length] }])
  }

  function onPointerDown(e: PointerEvent<SVGSVGElement>) {
    const box = e.currentTarget.getBoundingClientRect()
    cutAt(((e.clientX - box.left) * W) / box.width, ((e.clientY - box.top) * H) / box.height)
  }

  function cutForMe() {
    const free = SPOTS.filter(([x, y]) => !cookies.some((c) => Math.hypot(c.x - x, c.y - y) < GAP))
    const next = [...cookies]
    for (const [x, y] of free) if (next.length < COUNT) next.push({ x, y, kind: KINDS[next.length % KINDS.length] })
    setCookies(next)
    setMessage(next.length < COUNT ? 'Det finns inte plats för fler här – flytta dem genom att baka om.' : '')
    sounds.cut()
  }

  function intoOven() {
    bakeRef.current = 0
    setBake(0)
    setMessage('')
    setPhase('baking')
  }

  function takeOut() {
    const t = bakeRef.current
    if (t < GOLDEN.from) {
      setMessage('De är fortfarande bleka – vänta lite till!')
      return
    }
    if (t > GOLDEN.to) {
      sounds.miss()
      setMessage('')
      setPhase('burnt')
      return
    }
    setMessage('')
    setPhase('done')
    giveItem(calendarId, 'cookies')
    sounds.magic()
    for (let i = 0; i < 36; i++) {
      const a = Math.random() * Math.PI * 2
      addSpark(150 + Math.cos(a) * 30, 120 + Math.sin(a) * 20, Math.cos(a) * 60, Math.sin(a) * 40 - 20)
    }
  }

  function startOver() {
    setCookies([])
    setBake(0)
    setMessage('')
    setPhase('cut')
  }

  const color = phase === 'burnt' ? '#2e1a0e' : doughColor(bake)
  return (
    <div className="cookie-door">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`cookie-stage phase-${phase}`}
        role="img"
        aria-label="Pepparkaksdeg på ett bakbord"
        onPointerDown={onPointerDown}
      >
        <defs>
          <pattern id="cookie-table" width="60" height="20" patternUnits="userSpaceOnUse">
            <rect width="60" height="20" fill="#9c6a3a" />
            <rect y="18" width="60" height="2" fill="#7a4f28" />
          </pattern>
          <radialGradient id="oven-glow">
            <stop offset="0" stopColor="#ff9a2e" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ff9a2e" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cookie-glow">
            <stop offset="0" stopColor="#fff3b0" stopOpacity="0.7" />
            <stop offset="1" stopColor="#fff3b0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#cookie-table)" />

        {phase === 'done' ? (
          <g>
            <circle cx="150" cy="120" r="110" fill="url(#cookie-glow)" className="wreath-glow-pulse" />
            <g transform="translate(130 150) scale(3)">
              <CookiePlate />
            </g>
          </g>
        ) : (
          <g>
            {/* baking tray (in the oven) or rolled-out dough (while cutting) */}
            {phase === 'cut' ? (
              <rect x={DOUGH.x} y={DOUGH.y} width={DOUGH.w} height={DOUGH.h} rx="22" fill="#e8c79a" stroke="#c9a06c" strokeWidth="2" />
            ) : (
              <rect x={DOUGH.x - 6} y={DOUGH.y - 6} width={DOUGH.w + 12} height={DOUGH.h + 12} rx="6" fill="#5f6770" stroke="#3f454c" strokeWidth="3" />
            )}
            {phase === 'cut' &&
              [[60, 52], [118, 150], [205, 48], [248, 150], [170, 100], [92, 104]].map(([x, y]) => (
                <circle key={`${x}${y}`} cx={x} cy={y} r="1.6" fill="#fff8ec" opacity="0.8" />
              ))}
            {cookies.map((c, i) => (
              <CookieShape key={i} kind={c.kind} x={c.x} y={c.y} scale={1.4} color={phase === 'cut' ? '#d9b07c' : color} />
            ))}
            {(phase === 'baking' || phase === 'burnt') && (
              <ellipse cx="150" cy="100" rx="170" ry="120" fill="url(#oven-glow)" className={phase === 'baking' ? 'wreath-glow-pulse' : undefined} />
            )}
            {phase === 'burnt' && (
              <g className="cookie-smoke">
                {[110, 150, 190].map((x, i) => (
                  <circle key={x} cx={x} cy={50} r={12 + i * 2} fill="rgba(80,80,80,0.45)" style={{ animationDelay: `${i * 0.3}s` }} />
                ))}
              </g>
            )}
          </g>
        )}

        {phase === 'baking' && (
          <g>
            <rect x="60" y="190" width="180" height="12" rx="6" fill="#2b2f45" stroke="#f4d58d" strokeWidth="1.5" />
            <rect x={60 + GOLDEN.from * 180} y="190" width={(GOLDEN.to - GOLDEN.from) * 180} height="12" rx="4" fill="#d6a058" />
            <rect x={60 + bake * 180 - 2} y="186" width="4" height="20" rx="2" fill="#fff" />
          </g>
        )}
        <MagicSparks sparks={sparks} onDone={removeSpark} />
      </svg>

      <p className="game-status" aria-live="polite">
        {message ||
          (phase === 'cut' &&
            (cookies.length < COUNT
              ? `Klicka på degen för att stansa ut kakor (${cookies.length}/${COUNT})`
              : 'Sex fina kakor! In i ugnen med dem.')) ||
          (phase === 'baking' && 'Ta ut dem när de är gyllenbruna (när visaren är i det bruna fältet)!') ||
          (phase === 'burnt' && 'Oj, de blev brända! Baka en ny sats.')}
        {phase === 'done' &&
          (hadPlate ? (
            'Tomten får en sats till! Tallriken står redan i fönstret ✨'
          ) : (
            <>
              <Icon icon={ICONS.cookies} size={20} /> Mums! Tallriken med kakor och ett glas mjölk står nu på fönsterkanten till
              tomten.
            </>
          ))}
      </p>

      {phase === 'cut' && cookies.length < COUNT && <button onClick={cutForMe}>Stansa åt mig</button>}
      {phase === 'cut' && cookies.length >= COUNT && <button onClick={intoOven}>In i ugnen 🔥</button>}
      {phase === 'baking' && <button onClick={takeOut}>Ta ut!</button>}
      {(phase === 'burnt' || phase === 'done') && <button onClick={startOver}>Baka en ny sats</button>}
    </div>
  )
}
