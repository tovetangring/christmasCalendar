import { useState, type FormEvent } from 'react'
import { renameInHighScores } from '../lib/highscores'
import { cleanName, MAX_NAME, saveChosenName } from '../lib/profile'

// "Spelarnamn: Tove ✏️" under the calendar title; the pencil lets you pick another name, any time.
export function PlayerName({ calendarId, name }: { calendarId: string; name: string }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  function save(e: FormEvent) {
    e.preventDefault()
    const next = cleanName(draft)
    if (!next) return
    setEditing(false)
    if (next === name) return
    saveChosenName(calendarId, next)
    renameInHighScores(calendarId, name, next).catch((err) => console.warn('Kunde inte byta namn i highscore', err))
  }

  if (!editing) {
    return (
      <p className="player-name">
        Spelarnamn: <strong>{name}</strong>{' '}
        <button
          className="link-button"
          aria-label="Byt spelarnamn"
          onClick={() => {
            setDraft(name)
            setEditing(true)
          }}
        >
          ✏️ Byt
        </button>
      </p>
    )
  }
  return (
    <form className="player-name-form" onSubmit={save}>
      <input
        autoFocus
        value={draft}
        maxLength={MAX_NAME}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}
        aria-label="Nytt spelarnamn"
      />
      <button type="submit" disabled={!cleanName(draft)}>
        Spara
      </button>
      <button type="button" className="link-button" onClick={() => setEditing(false)}>
        Avbryt
      </button>
    </form>
  )
}
