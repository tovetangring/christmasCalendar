import { useCallback, useEffect, useRef, useState } from 'react'

// Decorative extras shown on every screen: falling snow, Santa flying by, a waving penguin.
// All of them are skipped for people who prefer reduced motion.

function Snow() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    type Flake = { x: number; y: number; r: number; speed: number; sway: number; phase: number }
    let flakes: Flake[] = []
    let w = 0
    let h = 0

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      const dpr = window.devicePixelRatio || 1
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(140, Math.max(40, Math.round(w / 10)))
      flakes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1 + Math.random() * 2.5,
        speed: 20 + Math.random() * 40,
        sway: 10 + Math.random() * 20,
        phase: Math.random() * Math.PI * 2,
      }))
    }
    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    let last = performance.now()
    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#fff'
      for (const f of flakes) {
        f.y += f.speed * dt
        f.phase += dt
        if (f.y > h + 5) {
          f.y = -5
          f.x = Math.random() * w
        }
        ctx.globalAlpha = 0.5 + f.r / 7
        ctx.beginPath()
        ctx.arc(f.x + Math.sin(f.phase) * f.sway, f.y, f.r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="snow" aria-hidden />
}

const SANTA_SRC = `${import.meta.env.BASE_URL}santaSleigh-small.png`

type Pop = { id: number; x: number; y: number; text: string; kind: 'gift' | 'shout' }

function Santa() {
  const [flight, setFlight] = useState<{ id: number; top: number; dir: 1 | -1 } | null>(null)
  const [pops, setPops] = useState<Pop[]>([])
  const nextId = useRef(0)
  const timer = useRef<number | undefined>(undefined)

  const schedule = useCallback((ms: number) => {
    timer.current = window.setTimeout(
      () => setFlight({ id: ++nextId.current, top: 4 + Math.random() * 14, dir: Math.random() < 0.5 ? 1 : -1 }),
      ms,
    )
  }, [])

  useEffect(() => {
    schedule(5000 + Math.random() * 5000)
    return () => window.clearTimeout(timer.current)
  }, [schedule])

  function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    setPops((p) => [
      ...p,
      { id: ++nextId.current, x, y, text: '🎁', kind: 'gift' },
      { id: ++nextId.current, x, y: y - 30, text: 'Ho ho ho!', kind: 'shout' },
    ])
  }

  return (
    <>
      {flight && (
        <button
          key={flight.id}
          className={`santa ${flight.dir === 1 ? 'to-right' : 'to-left'}`}
          style={{ top: `${flight.top}%` }}
          onClick={onClick}
          onAnimationEnd={() => {
            setFlight(null)
            schedule(15000 + Math.random() * 20000)
          }}
          aria-label="Tomten"
        >
          {/* The artwork faces left; flip it when flying right, and tilt the nose down either way. */}
          <img
            src={SANTA_SRC}
            alt=""
            draggable={false}
            style={{ transform: flight.dir === 1 ? 'scaleX(-1) rotate(-8deg)' : 'rotate(-8deg)' }}
          />
        </button>
      )}
      {pops.map((p) => (
        <span
          key={p.id}
          className={`pop ${p.kind}`}
          style={{ left: p.x, top: p.y }}
          onAnimationEnd={() => setPops((all) => all.filter((x) => x.id !== p.id))}
        >
          {p.text}
        </span>
      ))}
    </>
  )
}

const PENGUIN_LINES = ['Brrr, kallt!', 'God jul!', 'Har du sett min fisk?', 'Plopp!', 'Jag är ingen fågel… eller jo.', 'Hej där! 👋']

function WavingPenguin() {
  const [line, setLine] = useState<string | null>(null)
  const [hop, setHop] = useState(0)

  function onClick() {
    setLine(PENGUIN_LINES[Math.floor(Math.random() * PENGUIN_LINES.length)])
    setHop((h) => h + 1)
  }

  return (
    <div className="penguin-corner">
      {line && (
        <span key={hop} className="bubble" onAnimationEnd={() => setLine(null)}>
          {line}
        </span>
      )}
      <button key={`p${hop}`} className={hop ? 'hop' : ''} onClick={onClick} aria-label="Pingvin som vinkar">
        🐧<span className="wave">👋</span>
      </button>
    </div>
  )
}

export function Ambient() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  return (
    <>
      <Snow />
      <Santa />
      <WavingPenguin />
    </>
  )
}
