import { useEffect, useRef, useState } from 'react'
import { sounds } from '../../games/sound'
import { useMagicSparks } from '../../hooks/useMagicSparks'
import { getItems, giveItem } from '../../lib/items'
import type { Door } from '../../types'
import { LuciaFigure, LussekattTray, StarBoyFigure, TarnaFigure } from '../Lucia'
import { MagicSparks } from '../MagicSparks'

// Door 13, Lucia (and the third Sunday of Advent): the room is dark. Light the seven candles in Lucia's crown one by
// one, and it gets lighter. Then the Lucia procession walks by to a quiet tune, and leaves a tray of saffron buns.
type LuciaDoorData = Extract<Door, { type: 'lucia' }>
const CANDLES = 7
const WALK_SECONDS = 11

// A quiet, slow tune on the bells while the procession walks (frequency, start in seconds).
const TUNE: [number, number][] = [
  [392, 0], [392, 0.6], [523.25, 1.2], [523.25, 1.8], [493.88, 2.4], [493.88, 3.0], [440, 3.6],
  [440, 4.8], [587.33, 5.4], [587.33, 6.0], [523.25, 6.6], [523.25, 7.2], [493.88, 7.8], [523.25, 9.0],
]

type Phase = 'light' | 'procession' | 'done'

export function LuciaDoor({ door, calendarId }: { door: LuciaDoorData; calendarId: string }) {
  const [hadBuns] = useState(() => getItems(calendarId).lussekatter)
  const [lit, setLit] = useState<boolean[]>(() => Array(CANDLES).fill(false))
  const [phase, setPhase] = useState<Phase>('light')
  const { sparks, add: addSpark, remove: removeSpark } = useMagicSparks()
  const timers = useRef<number[]>([])
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((t) => window.clearTimeout(t))
  }, [])

  const litCount = lit.filter(Boolean).length

  function startProcession() {
    setPhase('procession')
    TUNE.forEach(([freq, at]) => sounds.bell(freq, 0.6 + at))
    timers.current.push(window.setTimeout(finish, WALK_SECONDS * 1000))
  }

  function finish() {
    setPhase('done')
    giveItem(calendarId, 'lussekatter')
    sounds.magic()
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2
      addSpark(150 + Math.cos(a) * 40, 150 + Math.sin(a) * 30, Math.cos(a) * 50, Math.sin(a) * 40 - 15)
    }
  }

  function light(i: number) {
    if (phase !== 'light' || lit[i]) return
    const next = lit.map((v, j) => v || j === i)
    setLit(next)
    sounds.bell(784 + i * 40)
    for (let k = 0; k < 4; k++) addSpark(150 + (i - 3) * 9.4, 40, (Math.random() - 0.5) * 20, -10 - Math.random() * 16)
    if (next.every(Boolean)) timers.current.push(window.setTimeout(startProcession, 1100))
  }

  function doItForMe() {
    timers.current.forEach((t) => window.clearTimeout(t))
    setLit(Array(CANDLES).fill(true))
    finish()
  }

  // The room gets lighter with every candle.
  const darkness = phase === 'light' ? 0.72 * (1 - litCount / CANDLES) + 0.08 : 0

  return (
    <div className="lucia-door">
      <svg viewBox="0 0 300 220" className={`lucia-stage phase-${phase}`} role="img" aria-label="Ett mörkt rum där Lucia kommer">
        <defs>
          <radialGradient id="lucia-glow">
            <stop offset="0" stopColor="#ffe9a0" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffe9a0" stopOpacity="0" />
          </radialGradient>
          <pattern id="lucia-wall" width="28" height="10" patternUnits="userSpaceOnUse">
            <rect width="28" height="10" fill="#7d2f2f" />
            <rect width="2" height="10" fill="#8f3a3a" />
          </pattern>
        </defs>
        <rect width="300" height="170" fill="url(#lucia-wall)" />
        <rect y="166" width="300" height="6" fill="#e9dfc9" />
        <rect y="172" width="300" height="48" fill="#9c6a3a" />
        <circle cx="150" cy="80" r={40 + litCount * 12} fill="url(#lucia-glow)" />

        {phase === 'light' && (
          <g transform="translate(150 212) scale(1.62)">
            <LuciaFigure lit={lit} onCandle={light} />
          </g>
        )}
        {phase !== 'light' && (
          <g className={phase === 'procession' ? 'lucia-procession' : 'lucia-arrived'} style={{ animationDuration: `${WALK_SECONDS}s` }}>
            <g transform="translate(0 205)">
              <LuciaFigure lit={lit} />
            </g>
            <g transform="translate(-60 205)">
              <TarnaFigure />
            </g>
            <g transform="translate(-112 205)">
              <TarnaFigure />
            </g>
            <g transform="translate(-164 205)">
              <StarBoyFigure />
            </g>
          </g>
        )}
        {phase === 'done' && (
          <g transform="translate(150 200) scale(1.8)">
            <LussekattTray />
          </g>
        )}
        <rect width="300" height="220" fill="#060814" opacity={darkness} pointerEvents="none" className="lucia-dark" />
        <MagicSparks sparks={sparks} onDone={removeSpark} />
      </svg>

      <blockquote className="lucia-poem">{door.text}</blockquote>
      <p className="game-status" aria-live="polite">
        {phase === 'light' && `Det är mörkt… Tänd ljusen i Lucias krona – klicka på dem (${litCount}/${CANDLES})`}
        {phase === 'procession' && 'Här kommer luciatåget! 🕯️'}
        {phase === 'done' &&
          (hadBuns ? (
            'Luciatåget har gått förbi – lussekatterna står redan framme ✨'
          ) : (
            '✨ Luciatåget lämnade ett fat med lussekatter i julrummet!'
          ))}
      </p>
      {phase === 'light' && <button onClick={doItForMe}>Gör det åt mig</button>}
      {phase === 'done' && (
        <button
          onClick={() => {
            setLit(Array(CANDLES).fill(false))
            setPhase('light')
          }}
        >
          Se luciatåget igen
        </button>
      )}
    </div>
  )
}
