import { useEffect, useState } from 'react'
import { ICONS } from '../../lib/icons'
import { getItems, giveItem } from '../../lib/items'
import type { Door } from '../../types'
import { Icon } from '../Icon'

type MessageDoorData = Extract<Door, { type: 'message' }>

// What to say the first time a note hands over its item.
const GIFTS = {
  scissors: {
    icon: ICONS.scissors,
    line: 'Du fick en sax! Titta på hemsidan – det är något inslaget där…',
  },
  treeStand: {
    icon: ICONS.treeStand,
    line: 'Du fick en julgransfot! Den står nu i julrummet.',
  },
}

// A note from Santa or the neighbour. Reading it for the first time hands over its item.
export function MessageDoor({ door, calendarId }: { door: MessageDoorData; calendarId: string }) {
  const gift = GIFTS[door.gives]
  const [firstTime] = useState(() => !getItems(calendarId)[door.gives])

  useEffect(() => {
    giveItem(calendarId, door.gives)
  }, [door.gives, calendarId])

  return (
    <div className="message-door">
      {door.from === 'santa' ? (
        <>
          <img className="message-santa" src={`${import.meta.env.BASE_URL}santaSleigh-small.png`} alt="" draggable={false} />
          <blockquote className="message-text">{door.text}</blockquote>
        </>
      ) : (
        <div className="note-card">
          <span className="note-tape" aria-hidden />
          <p className="note-text">{door.text}</p>
        </div>
      )}
      {firstTime && (
        <p className="message-gift">
          <Icon icon={gift.icon} size={22} /> {gift.line}
        </p>
      )}
    </div>
  )
}
