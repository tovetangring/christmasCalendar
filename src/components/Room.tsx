import { useEffect, useRef, useState } from 'react'
import { ChristmasTree } from './ChristmasTree'
import { SvgIcon } from './Icon'
import { Armchair, FloorFish, RoomCat } from './RoomPets'
import { Wreath } from './Wreath'
import { CurtainCloth, RoomCurtains } from './Curtains'
import { Garland } from './Garland'
import { CookiePlate } from './Cookies'
import { Snowman } from './Snowman'
import { RoomGramophone } from './Gramophone'
import { GiftBox, PaperPatterns } from './WrappedGift'
import type { GiftStyle } from '../lib/wrappedGift'
import { SantaFigure, SantaGift } from './Santa'
import { LussekattTray } from './Lucia'
import { ICONS } from '../lib/icons'
import { DECORATIONS } from '../games/tree/decorations'
import type { Items } from '../lib/items'
import { isLit, type TreeState } from '../lib/tree'

// The Christmas room: window, fireplace with four Advent candles, front door and a spot for the tree.
// Everything is drawn in one SVG (560 x 520). The empty <g data-slot="..."> groups are reserved places for
// decorations that later mini-games will add: a wreath on the door, curtains by the window, a rug under the tree.
const CANDLE_X = [248, 298, 350, 400]
const FLAKES: [number, number, number][] = [
  [40, 0, 4.5], [62, 1.3, 5.5], [86, 2.1, 4.2], [108, 0.6, 5], [130, 1.8, 4.8], [52, 3.0, 5.2], [98, 2.6, 4.6], [74, 0.9, 5.8],
]

// The wrapping paper around the whole room: two halves (so it can be cut down the middle ribbon) and a bow.
function WrapPaper() {
  return (
    <>
      <rect width="560" height="520" fill="url(#room-paper)" />
      <rect x="252" width="56" height="520" fill="#c0392b" />
      <rect x="252" width="8" height="520" fill="#e8776b" opacity="0.6" />
      <rect y="232" width="560" height="56" fill="#c0392b" />
      <rect y="232" width="560" height="8" fill="#e8776b" opacity="0.6" />
      <rect x="252" y="232" width="56" height="56" fill="#a82f23" />
      <rect x="3" y="3" width="554" height="514" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="6" />
    </>
  )
}

type RoomProps = {
  tree: TreeState
  showProgress: boolean
  items: Items // what is in the room (see src/lib/items.ts); until `unwrapped` it is wrapped like a present
  candles: boolean[] // which of the four Advent candles are lit
  wrappedGift: GiftStyle | null // the present you wrapped in door 22
  onUnwrap: () => void
  // Door 24 (the Christmas Eve finale) only:
  celebrate?: boolean // every light on and the cat purring
  santa?: 'knock' | 'door' | null // knocking on the door, or standing in the open doorway
  cookiesEaten?: boolean // Santa has just eaten the cookies (before his present is there)
}

export function Room({ tree, showProgress, items, candles, wrappedGift, onUnwrap, celebrate = false, santa = null, cookiesEaten = false }: RoomProps) {
  const { rug, treeStand, fish, cat, armchair, wreath, curtains, garland, scissors: hasScissors } = items
  const wrapped = !items.unwrapped
  const [cutting, setCutting] = useState(false) // the cut animation is playing
  const [needScissors, setNeedScissors] = useState(false)
  const timers = useRef<number[]>([])
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((t) => window.clearTimeout(t))
  }, [])

  function clickWrapping() {
    if (cutting) return
    if (!hasScissors) {
      setNeedScissors(true)
      timers.current.push(window.setTimeout(() => setNeedScissors(false), 3000))
      return
    }
    setCutting(true)
    onUnwrap() // saved straight away, so a reload mid-animation shows the room
    timers.current.push(window.setTimeout(() => setCutting(false), 1700))
  }

  const treeLit = isLit(tree)
  // Progress text, shown on the floor of the room once the decoration game has been opened.
  const caption =
    tree.chopped && (showProgress || treeLit)
      ? treeLit
        ? '✨ Fullt pyntad – och granen lyser!'
        : `Din gran: ${tree.decorations.length}/${DECORATIONS.length} pynt`
      : ''

  return (
    <section className="room-panel" aria-label="Julrummet">
      <svg viewBox="0 0 560 520" className="room" role="img" aria-label="Ett julrum med fönster, brasa och ytterdörr">
        <defs>
          <pattern id="room-wall" width="28" height="10" patternUnits="userSpaceOnUse">
            <rect width="28" height="10" fill="#7d2f2f" />
            <rect width="2" height="10" fill="#8f3a3a" />
          </pattern>
          <pattern id="room-floor" width="90" height="26" patternUnits="userSpaceOnUse">
            <rect width="90" height="26" fill="#9c6a3a" />
            <rect y="24" width="90" height="2" fill="#7a4f28" />
            <rect x="44" width="2" height="24" fill="#7a4f28" />
          </pattern>
          <pattern id="room-bricks" width="32" height="16" patternUnits="userSpaceOnUse">
            <rect width="32" height="16" fill="#a39a90" />
            <rect y="14" width="32" height="2" fill="#6e655f" />
            <rect x="15" width="2" height="14" fill="#6e655f" />
          </pattern>
          <linearGradient id="room-night" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#14204a" />
            <stop offset="1" stopColor="#34478f" />
          </linearGradient>
          <radialGradient id="room-fire-glow">
            <stop offset="0" stopColor="#ff9a2e" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ff9a2e" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="room-candle-glow">
            <stop offset="0" stopColor="#ffe9a0" stopOpacity="0.6" />
            <stop offset="1" stopColor="#ffe9a0" stopOpacity="0" />
          </radialGradient>
          <pattern id="room-paper" width="48" height="48" patternUnits="userSpaceOnUse">
            <rect width="48" height="48" fill="#1f6b3d" />
            <path d="M24 10 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#f4d58d" opacity="0.85" />
            <circle cx="6" cy="38" r="2.2" fill="#f4d58d" opacity="0.7" />
            <circle cx="42" cy="38" r="2.2" fill="#f4d58d" opacity="0.7" />
          </pattern>
          <clipPath id="room-wrap-left">
            <rect width="280" height="520" />
          </clipPath>
          <clipPath id="room-wrap-right">
            <rect x="280" width="280" height="520" />
          </clipPath>
          <CurtainCloth id="room-curtain" />
          <PaperPatterns prefix="room-gift" size={9} />
          <clipPath id="room-pane">
            <rect x="32" y="72" width="116" height="136" />
          </clipPath>
        </defs>

        {/* Wall and floor */}
        <rect width="560" height="330" fill="url(#room-wall)" />
        <rect y="330" width="560" height="190" fill="url(#room-floor)" />
        <rect y="322" width="560" height="10" fill="#e9dfc9" />
        <rect y="0" width="560" height="10" fill="#e9dfc9" />
        <g data-slot="garland">{garland && <Garland width={560} top={11} />}</g>

        {/* Window with falling snow */}
        <rect x="22" y="62" width="136" height="156" rx="3" fill="#efe6d2" />
        <rect x="32" y="72" width="116" height="136" fill="url(#room-night)" />
        <g clipPath="url(#room-pane)">
          <circle cx="58" cy="100" r="11" fill="#fff6c8" />
          <circle cx="104" cy="92" r="1.3" fill="#fff" />
          <circle cx="126" cy="112" r="1.1" fill="#fff" />
          <circle cx="76" cy="126" r="1.2" fill="#fff" />
          {FLAKES.map(([x, delay, duration], i) => (
            <circle
              key={i}
              className="room-flake"
              cx={x}
              cy={74}
              r="1.8"
              fill="#fff"
              style={{ animationDelay: `-${delay}s`, animationDuration: `${duration}s` }}
            />
          ))}
          <ellipse cx="90" cy="210" rx="70" ry="9" fill="#f4f8ff" />
          {/* the snowman from door 7, outside in the snow */}
          <g data-slot="snowman">{items.snowman && <Snowman x={112} ground={206} radii={[13, 9.5, 7]} parts={['eyes', 'nose', 'hat', 'scarf', 'buttons']} />}</g>
        </g>
        <rect x="88" y="72" width="4" height="136" fill="#efe6d2" />
        <rect x="32" y="138" width="116" height="4" fill="#efe6d2" />
        <rect x="14" y="216" width="152" height="10" rx="2" fill="#d8cdb5" />
        <g data-slot="curtains">{curtains && <RoomCurtains />}</g>
        {/* the plate of cookies for Santa on the window sill (door 9) */}
        <g data-slot="cookies" transform="translate(84 217)">{items.cookies && <CookiePlate eaten={items.santaGift || cookiesEaten} />}</g>

        {/* Fireplace: mantel, stone, fire and the four Advent candles */}
        <rect x="236" y="166" width="176" height="164" fill="url(#room-bricks)" />
        <path d="M262 330 L262 252 Q262 214 324 214 Q386 214 386 252 L386 330 Z" fill="#140a06" stroke="#6e655f" strokeWidth="3" />
        <ellipse className="fire-glow" cx="324" cy="300" rx="80" ry="58" fill="url(#room-fire-glow)" />
        <rect x="290" y="318" width="68" height="10" rx="5" fill="#5a3416" transform="rotate(-8 324 323)" />
        <rect x="290" y="318" width="68" height="10" rx="5" fill="#6b4021" transform="rotate(8 324 323)" />
        <path className="fire-flame" d="M324 322 C300 312 304 284 324 258 C344 284 348 312 324 322 Z" fill="#e8541c" />
        <path className="fire-flame" style={{ animationDelay: '-0.3s' }} d="M304 322 C294 312 296 298 306 286 C314 300 316 314 304 322 Z" fill="#ff7a1c" />
        <path className="fire-flame" style={{ animationDelay: '-0.5s' }} d="M344 322 C334 314 336 300 342 286 C352 298 354 312 344 322 Z" fill="#ff7a1c" />
        <path className="fire-flame" style={{ animationDelay: '-0.15s' }} d="M324 322 C308 314 311 292 324 272 C337 292 340 314 324 322 Z" fill="#ff9a1f" />
        <path className="fire-flame" style={{ animationDelay: '-0.4s' }} d="M324 320 C315 314 317 300 324 286 C331 300 333 314 324 320 Z" fill="#ffe066" />
        <rect x="222" y="150" width="204" height="16" rx="3" fill="#5a3a1e" />
        <rect x="222" y="150" width="204" height="3" fill="#7d5530" />
        <rect x="226" y="326" width="196" height="10" fill="#7d746c" />
        {CANDLE_X.map((x, i) => (
          <g key={x}>
            <ellipse cx={x} cy="150" rx="9" ry="2.5" fill="#2e1d0e" />
            <rect x={x - 5} y="118" width="10" height="32" rx="2" fill="#d8332c" />
            <rect x={x - 5} y="118" width="3" height="32" rx="1.5" fill="#ff7a70" opacity="0.5" />
            {candles[i] ? (
              <>
                <circle cx={x} cy="108" r="24" fill="url(#room-candle-glow)" />
                <path
                  className="candle-flame"
                  style={{ animationDelay: `-${i * 0.27}s` }}
                  d={`M${x} 98 C${x + 5} 105 ${x + 5} 112 ${x} 117 C${x - 5} 112 ${x - 5} 105 ${x} 98 Z`}
                  fill="#ffc83d"
                />
              </>
            ) : (
              <rect x={x - 0.7} y="113" width="1.4" height="5" fill="#2a1a10" />
            )}
          </g>
        ))}

        {/* the tray of lussekatter from the Lucia procession (door 13), on the floor by the fireplace */}
        <g data-slot="lussekatter" transform="translate(398 346)">{items.lussekatter && <LussekattTray />}</g>

        {/* Front door (it opens for Santa in door 24, showing the snowy night behind it) */}
        <rect x="428" y="70" width="112" height="262" rx="3" fill="#3d2412" />
        <rect x="436" y="78" width="96" height="254" fill="url(#room-night)" />
        <rect x="436" y="314" width="96" height="18" fill="#eef4fb" />
        {santa === 'door' && (
          <g transform="translate(486 330)">
            <SantaFigure waving />
          </g>
        )}
        <g className={`room-door ${santa === 'knock' ? 'knocking' : ''} ${santa === 'door' ? 'open' : ''}`}>
          <rect x="436" y="78" width="96" height="254" fill="#8a5a2b" />
          {[0, 1].map((col) =>
            [0, 1, 2].map((row) => (
              <rect key={`${col}${row}`} x={446 + col * 42} y={92 + row * 76} width="34" height="62" rx="2" fill="#7a4c22" stroke="#5a3516" strokeWidth="2" />
            )),
          )}
          <circle cx="520" cy="206" r="5" fill="#e6c25a" />
          <g data-slot="wreath" transform="translate(484 142) scale(0.6)">{wreath && <Wreath />}</g>
        </g>

        {/* A spot for the tree (and later a rug under it) */}
        <g data-slot="rug">
          {rug && (
            <g>
              <ellipse cx="126" cy="484" rx="132" ry="31" fill="#4a1414" opacity="0.35" />
              <ellipse cx="126" cy="478" rx="130" ry="29" fill="#a8322d" stroke="#e6c25a" strokeWidth="4" />
              <ellipse cx="126" cy="478" rx="108" ry="22" fill="none" stroke="#e6c25a" strokeWidth="2" strokeDasharray="6 5" />
              <ellipse cx="126" cy="478" rx="80" ry="15" fill="#c0463c" />
              <ellipse cx="126" cy="478" rx="52" ry="9" fill="none" stroke="#f4d58d" strokeWidth="1.5" />
            </g>
          )}
        </g>
        {/* The armchair with the solved crossword, in the right-hand corner */}
        {/* the gramophone from door 11, against the wall left of the fireplace */}
        <g data-slot="gramophone" transform="translate(206 338)">{items.gramophone && <RoomGramophone />}</g>
        <g data-slot="armchair" transform="translate(486 484)">{armchair && <Armchair />}</g>
        {/* Floor life: the fish from door 5, or the black cat once it has eaten it (door 16) */}
        <g data-slot="floor-pet" transform="translate(332 474)">{cat ? <RoomCat purring={celebrate} /> : fish ? <FloorFish /> : null}</g>
        {/* The tree stand sits on the rug, behind the tree (the trunk base is at about 126, 470) */}
        <g data-slot="stand">
          {treeStand &&
            (ICONS.treeStand.src ? (
              <SvgIcon icon={ICONS.treeStand} x={126} y={466} size={70} />
            ) : (
              <g>
                <path d="M94 460 L158 460 L148 484 L104 484 Z" fill="#c0392b" stroke="#7a1a14" strokeWidth="2.5" strokeLinejoin="round" />
                <ellipse cx="126" cy="460" rx="32" ry="7" fill="#8f1d17" stroke="#7a1a14" strokeWidth="2" />
                <ellipse cx="126" cy="460" rx="14" ry="3.5" fill="#4a2a14" />
              </g>
            ))}
        </g>
        <g className="tree-pop">
          {tree.chopped && <ChristmasTree tree={tree} garland={items.treeGarland} forceLit={celebrate} x={28} y={212} width={196} height={274} />}
        </g>
        {/* the present you wrapped yourself (door 22), in front of the tree */}
        {/* Santa's golden present (door 24) */}
        <g data-slot="santa-gift" transform="translate(34 500)">{items.santaGift && <SantaGift />}</g>
        <g data-slot="wrapped-gift" transform="translate(222 492)">
          {wrappedGift && <GiftBox prefix="room-gift" paper={wrappedGift.paper} ribbon={wrappedGift.ribbon} w={34} h={27} />}
        </g>
        {caption && (
          <text x="410" y="508" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#f4d58d" stroke="#3a2210" strokeWidth="3" paintOrder="stroke">
            {caption}
          </text>
        )}

        {/* The room is wrapped like a present until you cut it open with the scissors from door 1 */}
        {(wrapped || cutting) && (
          <g
            className="wrapping"
            role="button"
            tabIndex={0}
            aria-label={hasScissors ? 'Klipp upp presenten med saxen' : 'En inslagen present'}
            onClick={clickWrapping}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                clickWrapping()
              }
            }}
          >
            <g clipPath="url(#room-wrap-left)" className={cutting ? 'wrap-half wrap-left cut' : 'wrap-half'}>
              <WrapPaper />
            </g>
            <g clipPath="url(#room-wrap-right)" className={cutting ? 'wrap-half wrap-right cut' : 'wrap-half'}>
              <WrapPaper />
            </g>
            <g className={cutting ? 'wrap-bow cut' : 'wrap-bow'}>
              <ellipse cx="246" cy="238" rx="40" ry="22" transform="rotate(-25 246 238)" fill="#d8332c" stroke="#8f1d17" strokeWidth="3" />
              <ellipse cx="314" cy="238" rx="40" ry="22" transform="rotate(25 314 238)" fill="#d8332c" stroke="#8f1d17" strokeWidth="3" />
              <path d="M272 262 L244 330 L264 320 L272 344 L286 268 Z" fill="#c0392b" stroke="#8f1d17" strokeWidth="2" />
              <path d="M288 262 L316 330 L296 320 L288 344 L274 268 Z" fill="#c0392b" stroke="#8f1d17" strokeWidth="2" />
              <circle cx="280" cy="258" r="17" fill="#e04437" stroke="#8f1d17" strokeWidth="3" />
              <g className="wrap-tag" transform="rotate(12 340 300)">
                <path d="M292 262 Q326 276 340 300" stroke="#f4d58d" strokeWidth="2.5" fill="none" />
                <rect x="318" y="298" width="118" height="38" rx="5" fill="#fff8e6" stroke="#c9a85c" strokeWidth="2" />
                <text x="377" y="323" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#7a1a14">
                  {hasScissors ? '✂️ Klipp upp!' : 'Till dig!'}
                </text>
              </g>
            </g>
            {cutting && (
              <text className="wrap-scissors" x="280" y="30" textAnchor="middle" fontSize="44">
                ✂️
              </text>
            )}
            {needScissors && (
              <g>
                <rect x="70" y="440" width="420" height="46" rx="10" fill="#fff8e6" stroke="#c9a85c" strokeWidth="2" />
                <text x="280" y="469" textAnchor="middle" fontSize="16" fill="#5a1a14">
                  Du behöver något att klippa upp presenten med…
                </text>
              </g>
            )}
          </g>
        )}
      </svg>

    </section>
  )
}
