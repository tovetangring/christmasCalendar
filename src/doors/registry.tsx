import type { ReactNode } from 'react'
import type { Door, GameId } from '../types'
import { CatDoor } from '../components/doors/CatDoor'
import { CurtainsDoor } from '../components/doors/CurtainsDoor'
import { GarlandDoor } from '../components/doors/GarlandDoor'
import { TreeGarlandDoor } from '../components/doors/TreeGarlandDoor'
import { CookieDoor } from '../components/doors/CookieDoor'
import { SnowmanDoor } from '../components/doors/SnowmanDoor'
import { BellsDoor } from '../components/doors/BellsDoor'
import { GiftWrapDoor } from '../components/doors/GiftWrapDoor'
import { MessageDoor } from '../components/doors/MessageDoor'
import { QuoteDoor } from '../components/doors/QuoteDoor'
import { VideoDoor } from '../components/doors/VideoDoor'
import { WreathDoor } from '../components/doors/WreathDoor'
import { ChopGame } from '../games/chop/ChopGame'
import { ClawGame } from '../games/claw/ClawGame'
import { CrosswordGame } from '../games/crossword/CrosswordGame'
import { PenguinGame } from '../games/penguin/PenguinGame'
import { SnowballGame } from '../games/snowball/SnowballGame'
import { StarGame } from '../games/star/StarGame'
import { WheelGame } from '../games/wheel/WheelGame'
import { WordleGame } from '../games/wordle/WordleGame'

// Everything about how each kind of door looks and what it shows, in one place.
// Adding a door type: add it to `Door` in src/types.ts, add an entry here, and put the door in a calendar.
// Adding a game: add its id to `GameId` in src/types.ts and an entry to GAMES below.

export type Hint = { emoji: string; color: string } // a faint emoji and door colour hinting at what is behind it
export type DoorContext = { calendarId: string; player: string }

type DoorDef<D> = {
  hint?: (door: D) => Hint | undefined
  wide?: boolean // use the wide dialog
  render: (door: D, ctx: DoorContext) => ReactNode
}
type ByType = { [T in Door['type']]: DoorDef<Extract<Door, { type: T }>> }

const GAMES: Record<GameId, { hint: Hint; render: (ctx: DoorContext) => ReactNode }> = {
  chop: { hint: { emoji: '🎄', color: '#2e7d46' }, render: ({ calendarId }) => <ChopGame calendarId={calendarId} /> },
  penguin: {
    hint: { emoji: '🐧', color: '#2f6fa8' },
    render: ({ calendarId, player }) => <PenguinGame player={player} calendarId={calendarId} />,
  },
  claw: { hint: { emoji: '🕹️', color: '#7b4bb0' }, render: ({ calendarId }) => <ClawGame calendarId={calendarId} /> },
  snowball: {
    hint: { emoji: '⛄', color: '#3f8f9c' },
    render: ({ calendarId, player }) => <SnowballGame player={player} calendarId={calendarId} />,
  },
  star: { hint: { emoji: '⭐', color: '#a8801f' }, render: ({ calendarId }) => <StarGame calendarId={calendarId} /> },
  wheel: { hint: { emoji: '🎡', color: '#b8456f' }, render: ({ calendarId }) => <WheelGame calendarId={calendarId} /> },
  wordle: { hint: { emoji: '🔤', color: '#3f7a46' }, render: ({ calendarId }) => <WordleGame calendarId={calendarId} /> },
  crossword: { hint: { emoji: '🧩', color: '#8a4f2a' }, render: ({ calendarId }) => <CrosswordGame calendarId={calendarId} /> },
}

const MESSAGE_HINTS = {
  santa: { emoji: '💌', color: '#a8322d' },
  neighbour: { emoji: '📝', color: '#8a7a3d' },
}

const DOOR_TYPES: ByType = {
  quote: {
    hint: (door) => (door.poem ? { emoji: '🕯️', color: '#8a6a2a' } : undefined), // plain quotes stay plain red
    render: (door) => <QuoteDoor door={door} />,
  },
  game: {
    hint: (door) => GAMES[door.game].hint,
    wide: true,
    render: (door, ctx) => GAMES[door.game].render(ctx),
  },
  message: {
    hint: (door) => MESSAGE_HINTS[door.from],
    render: (door, { calendarId }) => <MessageDoor door={door} calendarId={calendarId} />,
  },
  wreath: { hint: () => ({ emoji: '🌿', color: '#2f7a45' }), render: (_, { calendarId }) => <WreathDoor calendarId={calendarId} /> },
  curtains: {
    hint: () => ({ emoji: '🪟', color: '#9c2a35' }),
    render: (_, { calendarId }) => <CurtainsDoor calendarId={calendarId} />,
  },
  garland: {
    hint: () => ({ emoji: '✨', color: '#3c6b3a' }),
    wide: true,
    render: (_, { calendarId }) => <GarlandDoor calendarId={calendarId} />,
  },
  treeGarland: {
    hint: () => ({ emoji: '🎊', color: '#a8801f' }),
    render: (_, { calendarId }) => <TreeGarlandDoor calendarId={calendarId} />,
  },
  cookies: { hint: () => ({ emoji: '🍪', color: '#9a5a2a' }), render: (_, { calendarId }) => <CookieDoor calendarId={calendarId} /> },
  snowman: { hint: () => ({ emoji: '☃️', color: '#4a6fa0' }), render: (_, { calendarId }) => <SnowmanDoor calendarId={calendarId} /> },
  bells: { hint: () => ({ emoji: '🎶', color: '#6a4fa0' }), render: (_, { calendarId }) => <BellsDoor calendarId={calendarId} /> },
  giftWrap: { hint: () => ({ emoji: '🎀', color: '#b3263f' }), render: (_, { calendarId }) => <GiftWrapDoor calendarId={calendarId} /> },
  cat: { hint: () => ({ emoji: '🐾', color: '#3a3a44' }), render: (_, { calendarId }) => <CatDoor calendarId={calendarId} /> },
  video: { hint: () => ({ emoji: '🎬', color: '#b3262e' }), wide: true, render: (door) => <VideoDoor door={door} /> },
}

// TypeScript can't link a door to its own entry by itself, so look it up once here.
const defFor = (door: Door) => DOOR_TYPES[door.type] as DoorDef<Door>

export const doorHint = (door: Door) => defFor(door).hint?.(door)
export const isWideDoor = (door: Door) => !!defFor(door).wide
export const renderDoor = (door: Door, ctx: DoorContext) => defFor(door).render(door, ctx)
