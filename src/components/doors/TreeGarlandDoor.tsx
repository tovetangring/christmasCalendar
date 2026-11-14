import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { sounds } from '../../games/sound'
import { useMagicSparks } from '../../hooks/useMagicSparks'
import { ICONS } from '../../lib/icons'
import { getItems, giveItem } from '../../lib/items'
import { getTree } from '../../lib/tree'
import { SWAGS, swagPoint } from '../../lib/treeShape'
import { Icon } from '../Icon'
import { MagicSparks } from '../MagicSparks'
import { TreeBody, TreeGarland } from '../TreeShape'

// Door 15: wind a gold tinsel garland around the tree, from the bottom up in a zigzag: drag along each swag
// (left to right, then right to left, ...) or press the button, amid Christmas magic.
const N = SWAGS.length
const REACH = 0.3 // how far ahead of the garland's end you can grab it, as a share of a swag
const NEAR = 30 // how close (in tree units) to the swag you have to be

export function TreeGarlandDoor({ calendarId }: { calendarId: string }) {
  const [hadGarland] = useState(() => getItems(calendarId).treeGarland)
  const [hasTree] = useState(() => getTree(calendarId).chopped)
  const [progress, setProgress] = useState(0) // 0..1 of the whole garland
  const [done, setDone] = useState(false)
  const [auto, setAuto] = useState(false)
  const { sparks, add: addSpark, remove: removeSpark } = useMagicSparks()
  const progressRef = useRef(0)
  const doneRef = useRef(false)
  const dragging = useRef(false)
  const sparkAcc = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearInterval(timer.current), [])

  // Where the end of the garland is now: which swag, and how far along it.
  const endOf = (p: number) => {
    const k = Math.min(N - 1, Math.floor(p * N))
    return { k, share: Math.min(1, p * N - k) }
  }

  function complete() {
    doneRef.current = true
    setDone(true)
    giveItem(calendarId, 'treeGarland')
    sounds.magic()
    for (let i = 0; i < 40; i++) {
      const swag = SWAGS[Math.floor(Math.random() * N)]
      const [x, y] = swagPoint(swag, Math.random(), true)
      addSpark(x, y, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40 - 10)
    }
  }

  function setTo(next: number) {
    const before = progressRef.current
    next = Math.min(1, next)
    if (next <= before) return
    progressRef.current = next
    setProgress(next)
    sparkAcc.current += (next - before) * N
    while (sparkAcc.current >= 0.06) {
      sparkAcc.current -= 0.06
      const { k, share } = endOf(next)
      const [x, y] = swagPoint(SWAGS[k], share, k % 2 === 0)
      addSpark(x, y, (Math.random() - 0.5) * 22, -6 - Math.random() * 20)
    }
    if (!doneRef.current && next >= 0.995) {
      progressRef.current = 1
      setProgress(1)
      complete()
    }
  }

  const toTree = (e: PointerEvent<SVGSVGElement>): [number, number] => {
    const box = e.currentTarget.getBoundingClientRect()
    // The picture is 200 x 260 tree units; the tree group is shifted down 10 inside it.
    return [((e.clientX - box.left) * 200) / box.width, ((e.clientY - box.top) * 260) / box.height - 10]
  }

  // Wind the garland towards the pointer, but only along the swag it is on, and only a little ahead of its end.
  function follow(x: number, y: number) {
    const { k, share } = endOf(progressRef.current)
    const swag = SWAGS[progressRef.current >= 1 ? N - 1 : k]
    if (Math.abs(y - swag.y - swag.dip) > NEAR) return
    const forwards = k % 2 === 0
    const along = (forwards ? x - swag.left : swag.right - x) / (swag.right - swag.left)
    const target = Math.max(0, Math.min(1, Math.min(along, share + REACH)))
    // Finishing a swag carries on to the next one (the pointer then has to move up to it).
    setTo((k + target) / N + (target >= 1 ? 0.0001 : 0))
  }

  function onPointerDown(e: PointerEvent<SVGSVGElement>) {
    if (auto || doneRef.current) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* not an active pointer: fine */
    }
    dragging.current = true
    follow(...toTree(e))
  }
  function onPointerMove(e: PointerEvent<SVGSVGElement>) {
    if (dragging.current) follow(...toTree(e))
  }
  const onPointerUp = () => {
    dragging.current = false
  }

  function autoWind() {
    if (auto) return
    setAuto(true)
    timer.current = window.setInterval(() => {
      setTo(progressRef.current + 0.008)
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

  const { k, share } = endOf(progress)
  const [tipX, tipY] = swagPoint(SWAGS[k], share, k % 2 === 0)

  return (
    <div className="tree-garland-door">
      <svg
        viewBox="0 0 200 260"
        className={`tree-garland-stage ${done ? 'done' : ''}`}
        role="img"
        aria-label="En julgran att linda en girlang runt"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <defs>
          <radialGradient id="tree-garland-glow">
            <stop offset="0" stopColor="#fff3b0" stopOpacity="0.6" />
            <stop offset="1" stopColor="#fff3b0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="200" height="260" fill="#7d2f2f" />
        <rect y="236" width="200" height="24" fill="#9c6a3a" />
        <g transform="translate(0 10)">
          {done && <circle cx="100" cy="130" r="120" fill="url(#tree-garland-glow)" className="wreath-glow-pulse" />}
          <TreeBody />
          {/* faint guide for the next swag */}
          {!done && (
            <path
              d={`M${SWAGS[k].left} ${SWAGS[k].y} Q100 ${SWAGS[k].y + 2 * SWAGS[k].dip} ${SWAGS[k].right} ${SWAGS[k].y}`}
              fill="none"
              stroke="rgba(255,243,176,0.45)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}
          <TreeGarland progress={progress} />
          {!done && (
            <g transform={`translate(${tipX} ${tipY})`}>
              <circle r="8" className="garland-tip" fill="rgba(255,243,176,0.3)" stroke="#f4d58d" strokeWidth="1.5" strokeDasharray="3 2" />
            </g>
          )}
          <MagicSparks sparks={sparks} onDone={removeSpark} />
        </g>
      </svg>

      <p className="game-status" aria-live="polite">
        {!done &&
          (progress > 0
            ? `${Math.round(progress * 100)} % lindad…`
            : hadGarland
              ? 'Girlangen sitter redan på granen, men du kan linda den igen för lite magi ✨'
              : 'Linda girlangen runt granen: dra längs den streckade linjen, nerifrån och upp!')}
        {done && !hadGarland && (
          <>
            <Icon icon={ICONS.treeGarland} size={20} /> Du fick en glittergirlang!{' '}
            {hasTree ? 'Den sitter nu på granen i julrummet.' : 'Hugg ner en gran i lucka 4 så hänger den på den.'}
          </>
        )}
        {done && hadGarland && 'Så det glittrar! ✨'}
      </p>
      <button onClick={done ? again : autoWind} disabled={auto}>
        {done ? 'Linda om igen' : 'Linda åt mig'}
      </button>
    </div>
  )
}
