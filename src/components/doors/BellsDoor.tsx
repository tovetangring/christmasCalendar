import { useEffect, useRef, useState } from 'react'
import { ignoreKey } from '../../games/keys'
import { sounds } from '../../games/sound'
import { useMagicSparks } from '../../hooks/useMagicSparks'
import { ICONS } from '../../lib/icons'
import { getItems, giveItem } from '../../lib/items'
import { BEATS, BELL_NOTES, BEAT_SECONDS, MELODY, NOTE_STARTS } from '../../lib/jingle'
import { GramophoneArt } from '../Gramophone'
import { Icon } from '../Icon'
import { MagicSparks } from '../MagicSparks'

// Door 11: play "Bjällerklang" on four hand bells. The bells play the start of the tune, then you play it back,
// a little longer each round. Get the whole tune right and you get a gramophone that plays it in the room.
const ROUNDS = [3, 6, MELODY.length]
const BELL_COLORS = [
  { body: '#c8202e', rim: '#8f1520' },
  { body: '#e6b422', rim: '#a8802a' },
  { body: '#2a8c4c', rim: '#1d6338' },
  { body: '#2f6fb5', rim: '#1e4a7a' },
]
const BELL_X = [60, 120, 180, 240]

type Phase = 'start' | 'listen' | 'yourTurn' | 'done'

export function BellsDoor({ calendarId }: { calendarId: string }) {
  const [hadGramophone] = useState(() => getItems(calendarId).gramophone)
  const [phase, setPhase] = useState<Phase>('start')
  const [round, setRound] = useState(0)
  const [played, setPlayed] = useState(0) // how many notes of this round you have played right
  const [ring, setRing] = useState<{ bell: number; id: number } | null>(null)
  const [message, setMessage] = useState('')
  const { sparks, add: addSpark, remove: removeSpark } = useMagicSparks()
  const timers = useRef<number[]>([])
  const nextId = useRef(0)
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((t) => window.clearTimeout(t))
  }, [])
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms))

  function ringBell(bell: number) {
    sounds.bell(BELL_NOTES[bell].freq)
    setRing({ bell, id: nextId.current++ })
  }

  // The bells play the first `count` notes of the tune, then it is your turn (or `then` runs).
  function demo(count: number, then?: () => void) {
    setPhase('listen')
    setPlayed(0)
    for (let i = 0; i < count; i++) later(NOTE_STARTS[i] * 1000 + 300, () => ringBell(MELODY[i]))
    const end = (NOTE_STARTS[count - 1] + BEATS[count - 1] * BEAT_SECONDS) * 1000 + 450
    later(end, then ?? (() => setPhase('yourTurn')))
  }

  function start() {
    setMessage('')
    setRound(0)
    demo(ROUNDS[0])
  }

  function complete() {
    setPhase('done')
    setMessage('')
    giveItem(calendarId, 'gramophone')
    sounds.magic()
    for (let i = 0; i < 36; i++) {
      const x = 30 + Math.random() * 240
      addSpark(x, 60 + Math.random() * 60, (Math.random() - 0.5) * 40, -10 - Math.random() * 40)
    }
  }

  function press(bell: number) {
    if (phase !== 'yourTurn') return
    ringBell(bell)
    if (bell !== MELODY[played]) {
      setMessage('Hoppsan, fel klocka! Lyssna en gång till.')
      sounds.miss()
      later(900, () => {
        setMessage('')
        demo(ROUNDS[round])
      })
      setPhase('listen')
      return
    }
    const next = played + 1
    setPlayed(next)
    if (next < ROUNDS[round]) return
    if (round === ROUNDS.length - 1) {
      later(700, complete)
      setPhase('listen')
      return
    }
    setMessage('Snyggt! Nu blir den lite längre…')
    setPhase('listen')
    later(1100, () => {
      setMessage('')
      setRound(round + 1)
      demo(ROUNDS[round + 1])
    })
  }

  // Keys 1-4 ring the bells too.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (ignoreKey(e)) return
      const n = Number(e.key)
      if (n >= 1 && n <= 4) {
        e.preventDefault()
        press(n - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function playForMe() {
    setMessage('')
    demo(MELODY.length, complete)
  }

  return (
    <div className="bells-door">
      <svg viewBox="0 0 300 200" className="bells-stage" role="group" aria-label="Fyra handklockor">
        <rect width="300" height="200" rx="8" fill="#3a1d24" />
        <path d="M10 26 Q150 50 290 26" stroke="#c8202e" strokeWidth="4" fill="none" />
        {phase === 'done' && (
          <g transform="translate(150 186) scale(1.2)">
            <GramophoneArt spinning />
          </g>
        )}
        {phase !== 'done' &&
          BELL_X.map((x, b) => {
            const ringing = ring?.bell === b
            return (
              <g
                key={b}
                className="hand-bell"
                role="button"
                tabIndex={phase === 'yourTurn' ? 0 : -1}
                aria-label={`Klocka ${b + 1} (${BELL_NOTES[b].name})`}
                onPointerDown={() => press(b)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    press(b)
                  }
                }}
              >
                <path d={`M${x} 34 L${x} 56`} stroke="#c8202e" strokeWidth="2" />
                <g key={ringing ? ring!.id : 'still'} className={ringing ? 'bell-swing' : undefined} style={{ transformOrigin: `${x}px 56px` }}>
                  {ringing && <circle cx={x} cy="96" r="40" fill={BELL_COLORS[b].body} opacity="0.25" className="bell-glow" />}
                  <circle cx={x} cy="58" r="5" fill={BELL_COLORS[b].rim} />
                  <path
                    d={`M${x - 20} 120 Q${x - 22} 64 ${x} 62 Q${x + 22} 64 ${x + 20} 120 L${x + 26} 128 L${x - 26} 128 Z`}
                    fill={BELL_COLORS[b].body}
                    stroke={BELL_COLORS[b].rim}
                    strokeWidth="2"
                  />
                  <path d={`M${x - 12} 112 Q${x - 14} 76 ${x - 4} 70`} stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.35" strokeLinecap="round" />
                  <circle cx={x} cy="132" r="5" fill={BELL_COLORS[b].rim} />
                </g>
                <text x={x} y="160" textAnchor="middle" className="bell-label">
                  {b + 1}
                </text>
              </g>
            )
          })}
        {phase !== 'done' && phase !== 'start' && (
          <g>
            {ROUNDS.map((_, r) => (
              <circle key={r} cx={135 + r * 15} cy="184" r="5" fill={r < round ? '#f4d58d' : r === round ? 'rgba(244,213,141,0.55)' : 'rgba(255,255,255,0.2)'} />
            ))}
          </g>
        )}
        <MagicSparks sparks={sparks} onDone={removeSpark} />
      </svg>

      <p className="game-status" aria-live="polite">
        {message ||
          (phase === 'start' && 'Klockorna spelar början av Bjällerklang – spela sedan samma toner själv!') ||
          (phase === 'listen' && 'Lyssna…') ||
          (phase === 'yourTurn' && `Din tur! Klicka på klockorna (eller tryck 1–4). ${played}/${ROUNDS[round]}`)}
        {phase === 'done' &&
          (hadGramophone ? (
            'Bravo! Grammofonen i julrummet spelar gärna låten igen ✨'
          ) : (
            <>
              <Icon icon={ICONS.gramophone} size={20} /> Bravo! Du fick en grammofon. Den står i julrummet – klicka på den så spelar den
              Bjällerklang.
            </>
          ))}
      </p>
      {phase === 'start' && <button onClick={start}>Starta</button>}
      {phase === 'start' && <button onClick={playForMe}>Spela åt mig</button>}
      {phase === 'done' && <button onClick={() => setPhase('start')}>Spela igen</button>}
    </div>
  )
}
