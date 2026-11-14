import { useEffect, useRef, useState } from 'react'
import { sounds } from '../games/sound'
import { BELL_NOTES, MELODY, NOTE_STARTS } from '../lib/jingle'

// The gramophone from door 11. Origin = where it stands on the floor.
function GramophoneArt({ spinning }: { spinning: boolean }) {
  return (
    <g>
      <ellipse cx="0" cy="2" rx="26" ry="4" fill="rgba(0,0,0,0.25)" />
      {/* the wooden box */}
      <rect x="-22" y="-24" width="44" height="24" rx="3" fill="#7a4c22" stroke="#4a2c14" strokeWidth="1.5" />
      <rect x="-18" y="-20" width="36" height="16" rx="2" fill="#8f5c2c" stroke="#5a3516" strokeWidth="1" />
      <circle cx="16" cy="-12" r="2.4" fill="#e6c25a" />
      {/* the record */}
      <ellipse cx="-2" cy="-25" rx="18" ry="4" fill="#1a1a20" />
      <ellipse cx="-2" cy="-25" rx="5" ry="1.3" fill="#c8202e" />
      {spinning && <ellipse className="record-shine" cx="-2" cy="-25" rx="13" ry="2.6" fill="none" stroke="#5a5a66" strokeWidth="1" strokeDasharray="6 10" />}
      {/* the arm and the golden horn */}
      <path d="M12 -26 L14 -40 L4 -50" stroke="#b8862a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M4 -50 C-4 -56 -10 -70 -4 -88 C14 -84 30 -74 32 -62 C20 -60 10 -56 4 -50 Z" fill="#e6b422" stroke="#a8802a" strokeWidth="1.5" />
      <path d="M-4 -88 C14 -84 30 -74 32 -62" stroke="#fff3b0" strokeWidth="1.6" fill="none" opacity="0.7" />
      <path d="M2 -60 C8 -66 16 -70 24 -68" stroke="#a8802a" strokeWidth="1" fill="none" />
    </g>
  )
}

// A music note, centred near (0, 0).
const NOTE = 'M2 -10 L2 4 A3.4 2.6 -20 1 1 -0.8 1.8 L-0.8 -8 L7 -11 L7 -6 L2 -4.2'

// In the room: click it and it plays "Bjällerklang" while little notes float out of the horn.
export function RoomGramophone() {
  const [playing, setPlaying] = useState(false)
  const [notes, setNotes] = useState<{ id: number; dx: number }[]>([])
  const timers = useRef<number[]>([])
  const nextId = useRef(0)
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((t) => window.clearTimeout(t))
  }, [])

  function play() {
    if (playing) return
    setPlaying(true)
    MELODY.forEach((bell, i) => {
      sounds.bell(BELL_NOTES[bell].freq, NOTE_STARTS[i])
      timers.current.push(
        window.setTimeout(() => setNotes((all) => [...all.slice(-12), { id: nextId.current++, dx: (i % 3) * 6 - 6 }]), NOTE_STARTS[i] * 1000),
      )
    })
    const end = (NOTE_STARTS[NOTE_STARTS.length - 1] + 1) * 1000
    timers.current.push(window.setTimeout(() => setPlaying(false), end))
  }

  return (
    <g
      className={`room-gramophone ${playing ? 'playing' : ''}`}
      role="button"
      tabIndex={0}
      aria-label="Spela på grammofonen"
      onClick={play}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          play()
        }
      }}
    >
      <GramophoneArt spinning={playing} />
      {notes.map((n) => (
        <path
          key={n.id}
          className="music-note"
          d={NOTE}
          transform={`translate(${14 + n.dx} -78)`}
          fill="#f4d58d"
          stroke="#7a5530"
          strokeWidth="0.6"
          onAnimationEnd={() => setNotes((all) => all.filter((x) => x.id !== n.id))}
        />
      ))}
    </g>
  )
}

export { GramophoneArt }
