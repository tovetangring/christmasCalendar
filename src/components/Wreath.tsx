import { SvgIcon } from './Icon'
import { ICONS } from '../lib/icons'

// A Christmas wreath, centred on (0, 0) with an outer radius of about 56 (used on the door in the room and in door 12).
// Set ICONS.wreath.src to draw an image instead.
const NEEDLES = Array.from({ length: 40 }, (_, i) => i * 9)
const BERRIES = [12, 58, 103, 150, 196, 241, 285, 330]

export function Wreath() {
  if (ICONS.wreath.src) return <SvgIcon icon={ICONS.wreath} x={0} y={0} size={116} />
  return (
    <g>
      <circle cx="0" cy="0" r="40" fill="none" stroke="#17562f" strokeWidth="28" />
      <circle cx="0" cy="0" r="40" fill="none" stroke="#1f7a3d" strokeWidth="22" />
      {NEEDLES.map((a, i) => (
        <path
          key={a}
          transform={`rotate(${a})`}
          d={i % 2 ? 'M0 -40 L-5 -55 M0 -40 L5 -55' : 'M0 -40 L-4 -28 M0 -40 L4 -28'}
          stroke={i % 3 === 0 ? '#3aa862' : '#2a8c4c'}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {BERRIES.map((a, i) => (
        <g key={a} transform={`rotate(${a}) translate(0 -40)`}>
          <circle r={i % 2 ? 4.2 : 5} fill="#d8332c" stroke="#8f1d17" strokeWidth="1" />
          <circle cx="-1.4" cy="-1.6" r="1.3" fill="#ffb3a8" />
        </g>
      ))}
      {[35, 125, 215, 305].map((a) => (
        <circle key={a} transform={`rotate(${a}) translate(0 -40)`} r="3.6" fill="#f4d58d" stroke="#b8923c" strokeWidth="1" />
      ))}
      {/* the bow at the bottom */}
      <g transform="translate(0 42)">
        <path d="M-3 4 L-14 24 L-8 22 L-4 28 Z" fill="#c0392b" stroke="#8f1d17" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M3 4 L14 24 L8 22 L4 28 Z" fill="#c0392b" stroke="#8f1d17" strokeWidth="1.5" strokeLinejoin="round" />
        <ellipse cx="-12" cy="-2" rx="13" ry="8" transform="rotate(-20 -12 -2)" fill="#d8332c" stroke="#8f1d17" strokeWidth="1.5" />
        <ellipse cx="12" cy="-2" rx="13" ry="8" transform="rotate(20 12 -2)" fill="#d8332c" stroke="#8f1d17" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="6" fill="#e04437" stroke="#8f1d17" strokeWidth="1.5" />
      </g>
    </g>
  )
}
