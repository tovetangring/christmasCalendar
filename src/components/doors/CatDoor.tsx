import { useEffect, useState } from 'react'
import { getItems, feedCat } from '../../lib/items'
import { BlackCat } from '../RoomPets'

// Door 16: if you have a fish, a cat comes and eats it, and then it stays on the floor of the room.
export function CatDoor({ calendarId }: { calendarId: string }) {
  const [situation] = useState(() => {
    const items = getItems(calendarId)
    return items.cat ? 'staying' : items.fish ? 'arrives' : 'nobody'
  })

  useEffect(() => {
    if (situation === 'arrives') feedCat(calendarId)
  }, [situation, calendarId])

  return (
    <div className="cat-door">
      {situation !== 'nobody' && (
        <svg viewBox="-60 -100 120 112" width="150" height="140" role="img" aria-label="En svart katt">
          <BlackCat />
        </svg>
      )}
      <p className="message-text">
        {situation === 'arrives' && 'Det var en katt som kom och åt upp fisken! Nu sitter den kvar på golvet i julrummet.'}
        {situation === 'staying' && 'Den svarta katten sitter kvar i julrummet och spinner nöjt.'}
        {situation === 'nobody' && 'Det är tyst idag. Kanske kommer någon på besök om det finns något gott att äta…'}
      </p>
    </div>
  )
}
