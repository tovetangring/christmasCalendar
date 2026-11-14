import { useState, type CSSProperties } from 'react'
import { isScoreGame, type Calendar } from '../types'
import { doorHint } from '../doors/registry'
import { useOpenedDoors } from '../hooks/useOpenedDoors'
import { litCandles } from '../lib/advent'
import { useTree } from '../lib/tree'
import { giveItem, useItems } from '../lib/items'
import { useCandy } from '../lib/wallet'
import { ICONS } from '../lib/icons'
import { Icon } from './Icon'
import { isUnlocked, isDebug } from '../lib/unlock'
import { DoorModal } from './DoorModal'
import { Leaderboard } from './Leaderboard'
import { Room } from './Room'

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
  const decorationsRevealed = calendar.doors.some((d) => d.revealsDecorations && opened.includes(d.day))
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
          items={items}
          candles={litCandles(calendar.doors, opened)}
          onUnwrap={() => giveItem(calendar.id, 'unwrapped')}
        />

        <section className="calendar-panel" aria-label="Kalenderluckor">
          <div className="grid">
            {calendar.doors.map((door) => {
              const unlocked = isUnlocked(door.day)
              const isOpen = opened.includes(door.day)
              const hint = doorHint(door)
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
