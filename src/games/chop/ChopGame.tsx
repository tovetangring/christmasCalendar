import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { CandyReward } from '../../components/CandyReward'
import { markChopped, useTree } from '../../lib/tree'
import { addCandy } from '../../lib/wallet'
import { ignoreKey } from '../keys'
import { sounds } from '../sound'

// Door 4: walk into the snowy forest, pick a tree, and chop it down with well-timed axe swings.
// Drawn as SVG in the same style as the Christmas room.
const GROUND = 262
const CUT_Y = GROUND - 12 // where the axe bites; everything above it falls
const HITS = 5 // good swings needed
const BAR = { x: 150, y: 290, w: 180, h: 12 }
const ZONE = 0.24 // the green part of the meter, as a share of the bar
const PERIOD = 1.5 // seconds for the needle to go there and back

type Kind = { x: number; height: number; width: number; colors: [string, string, string]; label: string }
const TREES: Kind[] = [
  { x: 110, height: 140, width: 96, colors: ['#1f6b3d', '#26844a', '#2f9c57'], label: 'Den lilla, yviga granen' },
  { x: 240, height: 180, width: 116, colors: ['#1a5e36', '#217a43', '#2a9150'], label: 'Den stora, ståtliga granen' },
  { x: 370, height: 158, width: 84, colors: ['#245f52', '#2d7866', '#3a9179'], label: 'Den smala blågranen' },
]
const BACKGROUND_TREES = [20, 62, 168, 196, 300, 318, 432, 466]
const FLAKES: [number, number, number][] = [
  [30, 0.2, 6], [88, 2.1, 7], [150, 1.1, 5.5], [212, 3.0, 6.5], [276, 0.7, 7.5], [338, 2.6, 6], [402, 1.6, 5], [455, 3.4, 7],
]

type Phase = 'choose' | 'chop' | 'falling' | 'done'
type Chip = { id: number; dx: number; dy: number; r: number }

// Where the green part of the meter is (it moves after every good hit).
const randomZone = () => 0.2 + Math.random() * 0.56
// A handful of wood chips flying out of the cut.
const makeChips = (firstId: number): Chip[] =>
  Array.from({ length: 6 }, (_, i) => ({ id: firstId + i, dx: -10 - Math.random() * 34, dy: -18 - Math.random() * 26, r: Math.random() * 360 }))

// One tier-built spruce. `top` = how much of it to draw: 'all', 'upper' (above the cut) or 'stump' (below it).
function Spruce({ kind, part }: { kind: Kind; part: 'all' | 'upper' | 'stump' }) {
  const { x, height: h, width: w, colors } = kind
  const top = GROUND - 22 - h
  const trunk = <rect x={x - 8} y={GROUND - 26} width="16" height="26" fill="#6b4423" />
  if (part === 'stump')
    return (
      <g>
        <rect x={x - 8} y={CUT_Y} width="16" height={GROUND - CUT_Y} fill="#6b4423" />
        <ellipse cx={x} cy={CUT_Y} rx="8" ry="2.5" fill="#e2c08a" />
      </g>
    )
  return (
    <g>
      {part === 'all' ? trunk : <rect x={x - 8} y={GROUND - 26} width="16" height={CUT_Y - (GROUND - 26)} fill="#6b4423" />}
      {[0, 1, 2].map((i) => {
        const apex = top + i * h * 0.27
        const base = top + h * (0.42 + i * 0.29)
        const half = (w / 2) * (0.55 + i * 0.22)
        return (
          <g key={i}>
            <polygon points={`${x},${apex} ${x + half},${base} ${x - half},${base}`} fill={colors[2 - i]} />
            {/* snow resting on the branches */}
            <path
              d={`M${x - half * 0.92} ${base - 2} Q${x - half * 0.5} ${base - 7} ${x - half * 0.15} ${base - 3} Q${x + half * 0.3} ${base - 8} ${x + half * 0.92} ${base - 2}`}
              stroke="#f4f8ff"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )
      })}
      <path d={`M${x - 6} ${top + 8} L${x} ${top} L${x + 6} ${top + 8}`} stroke="#f4f8ff" strokeWidth="4" strokeLinecap="round" fill="none" />
    </g>
  )
}

function Axe() {
  return (
    <g>
      <path d="M-40 30 L2 -2" stroke="#7a4c22" strokeWidth="5" strokeLinecap="round" />
      <path d="M-40 30 L2 -2" stroke="#9c6a3a" strokeWidth="2" strokeLinecap="round" />
      <path d="M-6 -8 L8 -12 Q12 0 8 12 L-6 8 Z" fill="#9aa3ad" stroke="#5f6770" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 -12 Q12 0 8 12" stroke="#e6edf3" strokeWidth="2" fill="none" />
    </g>
  )
}

export function ChopGame({ calendarId }: { calendarId: string }) {
  const tree = useTree(calendarId)
  const [hadTree, setHadTree] = useState(tree.chopped) // only celebrate "you got a tree" the first time
  const [phase, setPhase] = useState<Phase>('choose')
  const [chosen, setChosen] = useState(1)
  const [hits, setHits] = useState(0)
  const [needle, setNeedle] = useState(0) // 0..1 along the meter
  const [zoneStart, setZoneStart] = useState(0.4)
  const [swing, setSwing] = useState(0) // bumps on every swing, to restart the animation
  const [popup, setPopup] = useState<{ id: number; text: string; good: boolean } | null>(null)
  const [chips, setChips] = useState<Chip[]>([])
  const needleRef = useRef(0)
  const nextId = useRef(0)
  const timers = useRef<number[]>([])
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((t) => window.clearTimeout(t))
  }, [])

  // Move the needle back and forth while chopping.
  useEffect(() => {
    if (phase !== 'chop') return
    let raf = 0
    const start = performance.now()
    const frame = (now: number) => {
      const t = ((now - start) / 1000 / PERIOD) % 1
      const value = t < 0.5 ? t * 2 : 2 - t * 2
      needleRef.current = value
      setNeedle(value)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  function choose(index: number) {
    setChosen(index)
    setHits(0)
    setZoneStart(randomZone())
    setPhase('chop')
  }

  function chop() {
    if (phase !== 'chop') return
    setSwing((s) => s + 1)
    const good = needleRef.current >= zoneStart && needleRef.current <= zoneStart + ZONE
    const id = nextId.current++
    if (!good) {
      sounds.miss()
      setPopup({ id, text: 'Miss!', good: false })
      return
    }
    sounds.chop()
    const firstChip = nextId.current
    nextId.current += 6
    setChips((all) => [...all.slice(-20), ...makeChips(firstChip)])
    const next = hits + 1
    setHits(next)
    if (next < HITS) {
      setPopup({ id, text: 'Bra hugg!', good: true })
      setZoneStart(randomZone())
      return
    }
    // The last hit: the tree is yours (saved straight away, so closing the door mid-fall keeps it).
    setPopup({ id, text: 'TIMMER!', good: true })
    markChopped(calendarId)
    addCandy(calendarId, 1)
    setPhase('falling')
    timers.current.push(window.setTimeout(() => sounds.timber(), 250))
    timers.current.push(window.setTimeout(() => setPhase('done'), 1500))
  }

  // Space or Enter chops (the "Hugg!" button and clicking the picture do too).
  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (ignoreKey(e) || (e.code !== 'Space' && e.code !== 'Enter')) return
      if (phase !== 'chop') return
      e.preventDefault()
      chop()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  function again() {
    setHadTree(true)
    setPopup(null)
    setChips([])
    setPhase('choose')
  }

  const kind = TREES[chosen]
  const fallDir = kind.x > 300 ? -1 : 1
  const fallen = phase === 'falling' || phase === 'done'

  return (
    <div>
      <svg
        viewBox="0 0 480 320"
        className="chop-forest"
        role="img"
        aria-label="En snöig skog med granar"
        onPointerDown={() => phase === 'chop' && chop()}
      >
        <defs>
          <linearGradient id="forest-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#14204a" />
            <stop offset="1" stopColor="#5d6fae" />
          </linearGradient>
          <linearGradient id="forest-snow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f4f8ff" />
            <stop offset="1" stopColor="#c9d8ee" />
          </linearGradient>
        </defs>
        <rect width="480" height="320" fill="url(#forest-sky)" />
        <circle cx="414" cy="48" r="16" fill="#fff6c8" />
        {[[60, 30], [130, 58], [210, 24], [292, 46], [350, 20], [452, 92]].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="1.3" fill="#fff" />
        ))}
        {/* far-away trees */}
        {BACKGROUND_TREES.map((x, i) => (
          <polygon key={x} points={`${x},${150 + (i % 3) * 14} ${x + 26},${GROUND - 6} ${x - 26},${GROUND - 6}`} fill="#1b3a44" opacity="0.8" />
        ))}
        <path d={`M0 ${GROUND - 6} Q120 ${GROUND - 18} 240 ${GROUND - 8} T480 ${GROUND - 10} L480 320 L0 320 Z`} fill="url(#forest-snow)" />

        {TREES.map((t, i) => {
          if (i === chosen && phase !== 'choose') return null
          const choosable = phase === 'choose'
          return (
            <g
              key={i}
              className={`forest-tree ${choosable ? 'choosable' : 'faded'}`}
              role={choosable ? 'button' : undefined}
              tabIndex={choosable ? 0 : undefined}
              aria-label={choosable ? `Välj ${t.label.toLowerCase()}` : undefined}
              onClick={choosable ? () => choose(i) : undefined}
              onKeyDown={
                choosable
                  ? (e: KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        choose(i)
                      }
                    }
                  : undefined
              }
            >
              <Spruce kind={t} part="all" />
            </g>
          )
        })}

        {phase !== 'choose' && (
          <g>
            <Spruce kind={kind} part="stump" />
            <g key={`shake${hits}`} className={hits > 0 && !fallen ? 'tree-shake' : undefined} style={{ transformOrigin: `${kind.x}px ${GROUND}px` }}>
              <g
                className={fallen ? 'tree-falling' : undefined}
                style={{ transformOrigin: `${kind.x}px ${CUT_Y}px`, transform: fallen ? `rotate(${fallDir * 82}deg)` : undefined }}
              >
                <Spruce kind={kind} part="upper" />
              </g>
            </g>
            {!fallen && hits > 0 && (
              <polygon
                points={`${kind.x - 8},${CUT_Y - 5} ${kind.x - 8 + (hits / HITS) * 14},${CUT_Y} ${kind.x - 8},${CUT_Y + 5}`}
                fill="#e2c08a"
              />
            )}
            {chips.map((c) => (
              <rect
                key={c.id}
                className="wood-chip"
                x={kind.x - 10}
                y={CUT_Y - 2}
                width="5"
                height="3"
                fill="#d8b27a"
                style={{ '--dx': `${c.dx}px`, '--dy': `${c.dy}px`, '--r': `${c.r}deg` } as CSSProperties}
                onAnimationEnd={() => setChips((all) => all.filter((x) => x.id !== c.id))}
              />
            ))}
            {phase === 'chop' && (
              <g transform={`translate(${kind.x - 14} ${CUT_Y})`}>
                <g key={swing} className={swing ? 'axe swing' : 'axe'}>
                  <Axe />
                </g>
              </g>
            )}
          </g>
        )}

        {FLAKES.map(([x, delay, duration], i) => (
          <circle
            key={i}
            className="room-flake forest-flake"
            cx={x}
            cy={-6}
            r="1.8"
            fill="#fff"
            style={{ animationDelay: `-${delay}s`, animationDuration: `${duration}s` }}
          />
        ))}

        {/* Text and the timing meter */}
        {phase === 'choose' && (
          <text x="240" y="300" textAnchor="middle" className="forest-text">
            Välj en gran att hugga ner!
          </text>
        )}
        {phase === 'chop' && (
          <g>
            <text x="240" y="282" textAnchor="middle" className="forest-text small">
              Hugg när visaren är i det gröna!
            </text>
            <rect x={BAR.x} y={BAR.y} width={BAR.w} height={BAR.h} rx="6" fill="#2b2f45" stroke="#f4d58d" strokeWidth="1.5" />
            <rect x={BAR.x + zoneStart * BAR.w} y={BAR.y} width={ZONE * BAR.w} height={BAR.h} rx="4" fill="#4caf6a" />
            <rect x={BAR.x + needle * BAR.w - 2} y={BAR.y - 4} width="4" height={BAR.h + 8} rx="2" fill="#fff" />
            {Array.from({ length: HITS }, (_, i) => (
              <circle key={i} cx={210 + i * 15} cy="22" r="5" fill={i < hits ? '#f4d58d' : 'rgba(255,255,255,0.25)'} />
            ))}
          </g>
        )}
        {popup && (
          <text
            key={popup.id}
            x={kind.x}
            y={CUT_Y - 70}
            textAnchor="middle"
            className={`forest-text chop-popup ${popup.good ? 'good' : 'bad'}`}
          >
            {popup.text}
          </text>
        )}
      </svg>

      {phase === 'chop' && (
        <div className="game-controls">
          <button
            onClick={(e) => {
              chop()
              e.currentTarget.blur()
            }}
          >
            🪓 Hugg!
          </button>
        </div>
      )}
      {phase === 'done' && (
        <div className="gameover">
          <p>
            {hadTree
              ? 'Timmer! Du hade redan en gran, men det är kul att hugga fler.'
              : '🎄 Timmer! Du högg ner en julgran och bar hem den. Den står nu i julrummet!'}
          </p>
          <CandyReward />
          <button onClick={again}>Hugg en till</button>
        </div>
      )}
    </div>
  )
}
