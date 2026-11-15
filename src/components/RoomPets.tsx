// Things that end up on the floor of the Christmas room, drawn as SVG (origin = where it touches the floor).
import { useEffect, useRef, useState } from 'react'
import { SvgIcon } from './Icon'
import { sounds } from '../games/sound'
import { ICONS } from '../lib/icons'

// The fish you get for playing door 5. Set ICONS.fish.src to draw an image instead of this little fish.
export function FloorFish() {
  if (ICONS.fish.src) return <SvgIcon icon={ICONS.fish} x={0} y={-12} size={56} />
  return (
    <g>
      <ellipse cx="2" cy="4" rx="28" ry="5" fill="rgba(0,0,0,0.25)" />
      <g transform="translate(0 -10) rotate(-6)">
        <path d="M20 0 L38 -11 L34 0 L38 11 Z" fill="#6aa0cc" stroke="#3d6d94" strokeWidth="1.5" strokeLinejoin="round" />
        <ellipse cx="0" cy="0" rx="23" ry="10" fill="#8fbde0" stroke="#3d6d94" strokeWidth="1.5" />
        <ellipse cx="2" cy="4" rx="17" ry="4.5" fill="#d3e8f5" />
        <path d="M-5 -9 L2 -18 L9 -8 Z" fill="#6aa0cc" stroke="#3d6d94" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M-14 -4 Q-11 0 -14 4" stroke="#4d7ea6" strokeWidth="1.5" fill="none" />
        <circle cx="-15" cy="-2" r="2.4" fill="#13263a" />
      </g>
    </g>
  )
}

// The black cat that comes for the fish (door 16) and then stays. Sitting, seen from the front.
export function BlackCat() {
  return (
    <g>
      <ellipse cx="0" cy="3" rx="30" ry="5.5" fill="rgba(0,0,0,0.3)" />
      <path d="M17 -6 C50 -2 58 -34 40 -52" fill="none" stroke="#15151a" strokeWidth="9" strokeLinecap="round" />
      <path d="M-22 0 C-28 -22 -19 -48 0 -50 C19 -48 28 -22 22 0 Z" fill="#15151a" />
      <path d="M-10 -40 C-6 -30 -6 -14 -8 0" stroke="#2c2c34" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="-10" y="-22" width="8" height="22" rx="4" fill="#1d1d23" />
      <rect x="2" y="-22" width="8" height="22" rx="4" fill="#1d1d23" />
      <path d="M-15 -66 L-13 -86 L-2 -72 Z" fill="#15151a" />
      <path d="M15 -66 L13 -86 L2 -72 Z" fill="#15151a" />
      <path d="M-12 -70 L-11.5 -80 L-5 -72 Z" fill="#4a343b" />
      <path d="M12 -70 L11.5 -80 L5 -72 Z" fill="#4a343b" />
      <circle cx="0" cy="-58" r="17" fill="#15151a" />
      <g className="cat-eyes">
        <ellipse cx="-6.5" cy="-60" rx="3.6" ry="4.2" fill="#f2c94c" />
        <ellipse cx="6.5" cy="-60" rx="3.6" ry="4.2" fill="#f2c94c" />
        <ellipse cx="-6.5" cy="-60" rx="1.1" ry="3.6" fill="#0c0c0f" />
        <ellipse cx="6.5" cy="-60" rx="1.1" ry="3.6" fill="#0c0c0f" />
      </g>
      <path d="M-2 -54 L2 -54 L0 -51.5 Z" fill="#c98a96" />
      <path d="M-12 -53 L-24 -56 M-12 -51 L-24 -50 M12 -53 L24 -56 M12 -51 L24 -50" stroke="#a5a5b0" strokeWidth="0.9" opacity="0.7" />
    </g>
  )
}

// The cat in the room: click it and it blinks, purrs (a soft sound and a little shiver) and a red heart floats up.
// `purring`: it purrs by itself every couple of seconds (the celebration in door 24).
export function RoomCat({ purring = false }: { purring?: boolean }) {
  const [petting, setPetting] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  useEffect(() => {
    if (!purring) return
    const show = () => {
      setPetting(true)
      timer.current = window.setTimeout(() => setPetting(false), 1700)
    }
    show()
    const every = window.setInterval(show, 2600)
    return () => window.clearInterval(every)
  }, [purring])

  function pet() {
    if (petting) return
    setPetting(true)
    sounds.purr()
    timer.current = window.setTimeout(() => setPetting(false), 1700)
  }

  return (
    <g
      className={petting ? 'room-cat petting' : 'room-cat'}
      role="button"
      tabIndex={0}
      aria-label="Klappa katten"
      onClick={pet}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          pet()
        }
      }}
    >
      <g className="cat-body">
        <BlackCat />
      </g>
      {petting && (
        <g transform="translate(0 -110) scale(1.5)">
          <path className="cat-heart" d="M0 9 C-19 -5 -11 -23 0 -13 C11 -23 19 -5 0 9 Z" fill="#e0263a" stroke="#9c1423" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      )}
    </g>
  )
}

// The armchair (door 8) with the solved crossword leaning against the back, seen from the front.
// Origin = floor, centred. Set ICONS.armchair.src to draw an image instead.
export function Armchair() {
  if (ICONS.armchair.src) return <SvgIcon icon={ICONS.armchair} x={0} y={-50} size={110} />
  // A little crossword: 1 = black square.
  const grid = ['100010', '011101', '000110', '101000', '010111']
  return (
    <g>
      <ellipse cx="0" cy="3" rx="58" ry="6" fill="rgba(0,0,0,0.28)" />
      <rect x="-44" y="-8" width="9" height="10" rx="2" fill="#4a2c14" />
      <rect x="35" y="-8" width="9" height="10" rx="2" fill="#4a2c14" />
      {/* back, arms, seat */}
      <rect x="-42" y="-96" width="84" height="76" rx="14" fill="#2e7d52" stroke="#1d5236" strokeWidth="2.5" />
      <rect x="-56" y="-62" width="22" height="56" rx="10" fill="#2a704a" stroke="#1d5236" strokeWidth="2.5" />
      <rect x="34" y="-62" width="22" height="56" rx="10" fill="#2a704a" stroke="#1d5236" strokeWidth="2.5" />
      <rect x="-36" y="-34" width="72" height="26" rx="9" fill="#3a9363" stroke="#1d5236" strokeWidth="2.5" />
      <path d="M-30 -86 Q0 -92 30 -86" stroke="#4fae7c" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* the crossword: a sheet standing on the seat against the back */}
      <g transform="rotate(-4 0 -52)">
        <rect x="-23" y="-80" width="46" height="48" rx="2" fill="#fdfaf0" stroke="#bfb79c" strokeWidth="1.5" />
        <rect x="-18" y="-76" width="36" height="5" fill="#cfc7ad" />
        {grid.flatMap((row, r) =>
          [...row].map((cell, c) => (
            <rect
              key={`${r}${c}`}
              x={-18 + c * 6}
              y={-68 + r * 6}
              width="6"
              height="6"
              fill={cell === '1' ? '#222' : '#fff'}
              stroke="#8a8470"
              strokeWidth="0.6"
            />
          )),
        )}
        <path d="M-18 -37 L18 -37 M-18 -34 L10 -34" stroke="#b5ae94" strokeWidth="1.2" />
      </g>
      {/* a pencil on the seat */}
      <g transform="rotate(-8 18 -22)">
        <rect x="6" y="-24" width="26" height="4" rx="1" fill="#e6b422" />
        <path d="M32 -24 L38 -22 L32 -20 Z" fill="#f1d9a8" />
        <rect x="6" y="-24" width="4" height="4" fill="#d4687a" />
      </g>
    </g>
  )
}
