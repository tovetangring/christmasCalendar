// Santa himself (door 24), standing, origin = between his feet. About 120 tall.
export function SantaFigure({ waving = false }: { waving?: boolean }) {
  return (
    <g>
      <ellipse cx="0" cy="2" rx="30" ry="5" fill="rgba(0,0,0,0.3)" />
      {/* boots and legs */}
      <rect x="-20" y="-12" width="16" height="12" rx="4" fill="#1d1d22" />
      <rect x="4" y="-12" width="16" height="12" rx="4" fill="#1d1d22" />
      <rect x="-17" y="-34" width="13" height="24" fill="#b3262e" />
      <rect x="4" y="-34" width="13" height="24" fill="#b3262e" />
      {/* coat */}
      <path d="M-26 -34 Q-28 -78 0 -82 Q28 -78 26 -34 Z" fill="#c8202e" stroke="#8f1520" strokeWidth="1.5" />
      <rect x="-27" y="-40" width="54" height="8" rx="4" fill="#f7f3ea" />
      <rect x="-3" y="-80" width="6" height="42" fill="#f7f3ea" />
      <rect x="-26" y="-58" width="52" height="7" fill="#1d1d22" />
      <rect x="-6" y="-59" width="12" height="9" rx="1.5" fill="none" stroke="#e6c25a" strokeWidth="2" />
      {/* arms and mittens; one waves */}
      <path d="M-24 -74 Q-36 -60 -32 -44" stroke="#c8202e" strokeWidth="11" strokeLinecap="round" fill="none" />
      <circle cx="-32" cy="-42" r="6" fill="#1d1d22" />
      {waving ? (
        <g className="santa-wave">
          <path d="M24 -74 Q38 -86 38 -100" stroke="#c8202e" strokeWidth="11" strokeLinecap="round" fill="none" />
          <circle cx="38" cy="-103" r="6" fill="#1d1d22" />
        </g>
      ) : (
        <g>
          <path d="M24 -74 Q36 -60 32 -44" stroke="#c8202e" strokeWidth="11" strokeLinecap="round" fill="none" />
          <circle cx="32" cy="-42" r="6" fill="#1d1d22" />
        </g>
      )}
      {/* head, beard and hat */}
      <circle cx="0" cy="-94" r="14" fill="#f5cfa0" />
      <circle cx="-8" cy="-91" r="3.2" fill="#f2a3a0" opacity="0.7" />
      <circle cx="8" cy="-91" r="3.2" fill="#f2a3a0" opacity="0.7" />
      <circle cx="-5" cy="-96" r="1.7" fill="#2b2016" />
      <circle cx="5" cy="-96" r="1.7" fill="#2b2016" />
      <path d="M-16 -92 Q-20 -62 0 -58 Q20 -62 16 -92 Q8 -84 0 -86 Q-8 -84 -16 -92 Z" fill="#fbfbf8" stroke="#ddd8cc" strokeWidth="1" />
      <path d="M-10 -87 Q-4 -91 0 -87 Q4 -91 10 -87 Q4 -82 0 -85 Q-4 -82 -10 -87 Z" fill="#fbfbf8" stroke="#ddd8cc" strokeWidth="0.8" />
      <circle cx="0" cy="-90" r="3" fill="#e89a8a" />
      <path d="M-15 -103 Q-6 -128 14 -122 Q24 -118 26 -104 Z" fill="#c8202e" stroke="#8f1520" strokeWidth="1" />
      <rect x="-17" y="-107" width="34" height="8" rx="4" fill="#f7f3ea" />
      <circle cx="27" cy="-103" r="5" fill="#f7f3ea" />
    </g>
  )
}

// The golden present Santa leaves under the tree. Origin = bottom centre.
export function SantaGift() {
  return (
    <g>
      <ellipse cx="0" cy="1" rx="26" ry="4" fill="rgba(0,0,0,0.28)" />
      <rect x="-22" y="-34" width="44" height="34" fill="#e0a92a" stroke="#a8762a" strokeWidth="1.2" />
      <rect x="-22" y="-34" width="10" height="34" fill="#ffe08a" opacity="0.4" />
      <rect x="-24" y="-40" width="48" height="8" fill="#ecb93a" stroke="#a8762a" strokeWidth="1.2" />
      <rect x="-4" y="-40" width="8" height="40" fill="#c8202e" />
      <rect x="-24" y="-24" width="48" height="7" fill="#c8202e" />
      <path d="M0 -40 C-16 -56 -22 -40 0 -40 Z" fill="#d8332c" stroke="#8f1d17" strokeWidth="1" />
      <path d="M0 -40 C16 -56 22 -40 0 -40 Z" fill="#d8332c" stroke="#8f1d17" strokeWidth="1" />
      <circle cx="0" cy="-40" r="4" fill="#e04437" stroke="#8f1d17" strokeWidth="1" />
      <g transform="translate(14 -14) rotate(14)">
        <rect x="0" y="0" width="16" height="10" rx="2" fill="#fff8e6" stroke="#c9a85c" strokeWidth="0.8" />
        <path d="M3 4 H13 M3 7 H10" stroke="#a8762a" strokeWidth="0.8" />
      </g>
    </g>
  )
}
