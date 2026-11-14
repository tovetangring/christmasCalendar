import { useState, type CSSProperties } from 'react'
import { isScoreGame, type Calendar, type GameId } from '../types'
import { useOpenedDoors } from '../hooks/useOpenedDoors'
import { litCandles } from '../lib/advent'
import { useTree } from '../lib/tree'
import { unwrapRoom, useItems } from '../lib/items'
import { useCandy } from '../lib/wallet'
import { ICONS } from '../lib/icons'
import { Icon } from './Icon'
import { isUnlocked, isDebug } from '../lib/unlock'
import { DoorModal } from './DoorModal'
import { Leaderboard } from './Leaderboard'
import { Room } from './Room'

// A faint emoji and door colour hint at what is behind each game door.
const GAME_HINTS: Record<GameId, { emoji: string; color: string }> = {
  chop: { emoji: '🎄', color: '#2e7d46' },
  penguin: { emoji: '🐧', color: '#2f6fa8' },
  claw: { emoji: '🕹️', color: '#7b4bb0' },
  snowball: { emoji: '⛄', color: '#3f8f9c' },
  star: { emoji: '⭐', color: '#a8801f' },
  wheel: { emoji: '🎡', color: '#b8456f' },
  wordle: { emoji: '🔤', color: '#3f7a46' },
  crossword: { emoji: '🧩', color: '#8a4f2a' },
}
const VIDEO_HINT = { emoji: '🎬', color: '#b3262e' }
const POEM_HINT = { emoji: '🕯️', color: '#8a6a2a' }
const CAT_HINT = { emoji: '🐾', color: '#3a3a44' }
const WREATH_HINT = { emoji: '🌿', color: '#2f7a45' }
const CURTAINS_HINT = { emoji: '🪟', color: '#9c2a35' }
const MESSAGE_HINTS = {
  santa: { emoji: '💌', color: '#a8322d' },
  neighbour: { emoji: '📝', color: '#8a7a3d' },
}

// The home page has fixed zones, so nothing jumps around when the tree or a highscore list appears:
// top row = the Christmas room (with the tree) and the calendar doors in equally tall frames;
// the highscore lists sit below the room.
export function CalendarGrid({ calendar }: { calendar: Calendar }) {
  const { opened, markOpened } = useOpenedDoors(calendar.id)
  const tree = useTree(calendar.id)
  const candy = useCandy(calendar.id)
  const items = useItems(calendar.id)
  const [activeDay, setActiveDay] = useState<number | null>(null)
  // A game's highscore list is a surprise until its door has been opened.
  const openedGames = calendar.doors.flatMap((d) =>
    d.type === 'game' && isScoreGame(d.game) && opened.includes(d.day) ? [d.game] : [],
  )
  // Don't reveal that the tree gets decorated until the decoration game has been opened.
  const decorationsRevealed = calendar.doors.some((d) => d.type === 'game' && d.game === 'claw' && opened.includes(d.day))
  const active = calendar.doors.find((d) => d.day === activeDay)

  return (
    <main className="page wide-page">
      <h1>{calendar.name}</h1>
      {isDebug() && <p className="hint">Debug mode: all doors unlocked</p>}
      <div className="pockets">
      {candy > 0 && (
        <div className="sack" title="Din godissäck" aria-label={`Din godissäck: ${candy} godis`}>
          <Icon icon={ICONS.sack} size={30} />
          <strong>{candy}</strong>
          <Icon icon={ICONS.candy} size={20} />
        </div>
      )}
      {items.scissors && !items.unwrapped && (
        <div className="sack" title="Din sax – använd den på den inslagna presenten" aria-label="Du har en sax">
          <Icon icon={ICONS.scissors} size={26} />
          <span>Sax</span>
        </div>
      )}
      </div>

      <div className="home-layout">
        <Room
          tree={tree}
          showProgress={decorationsRevealed}
          wrapped={!items.unwrapped}
          hasScissors={items.scissors}
          candles={litCandles(opened)}
          rug={items.rug}
          fish={items.fish}
          cat={items.cat}
          armchair={items.armchair}
          wreath={items.wreath}
          curtains={items.curtains}
          treeStand={items.treeStand}
          onUnwrap={() => unwrapRoom(calendar.id)}
        />

        <section className="calendar-panel" aria-label="Kalenderluckor">
          <div className="grid">
            {calendar.doors.map((door) => {
              const unlocked = isUnlocked(door.day)
              const isOpen = opened.includes(door.day)
              const hint = door.type === 'game' ? GAME_HINTS[door.game] : door.type === 'video' ? VIDEO_HINT : door.type === 'message' ? MESSAGE_HINTS[door.from] : door.type === 'quote' && door.poem ? POEM_HINT : door.type === 'cat' ? CAT_HINT : door.type === 'wreath' ? WREATH_HINT : door.type === 'curtains' ? CURTAINS_HINT : undefined
              return (
                <button
                  key={door.day}
                  className={`door ${isOpen ? 'open' : ''}`}
                  style={hint ? ({ '--door-bg': hint.color } as CSSProperties) : undefined}
                  disabled={!unlocked}
                  title={unlocked ? undefined : `Opens December ${door.day}`}
                  onClick={() => {
                    markOpened(door.day)
                    setActiveDay(door.day)
                  }}
                >
                  {hint && <span className="door-hint" aria-hidden>{hint.emoji}</span>}
                  <span className="door-num">{unlocked ? door.day : `🔒 ${door.day}`}</span>
                </button>
              )
            })}
          </div>
        </section>

        {openedGames.length > 0 && (
          <section className="boards-panel" aria-label="Highscore">
            <h2>🏆 Highscore</h2>
            <div className="boards-list">
              {openedGames.map((game) => (
                <Leaderboard key={game} gameId={game} />
              ))}
            </div>
          </section>
        )}
      </div>

      {active && <DoorModal door={active} calendarId={calendar.id} player={calendar.player} onClose={() => setActiveDay(null)} />}
      <a className="back" href="#/">← Enter another code</a>
    </main>
  )
}
