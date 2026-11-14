import { useEffect, useState } from 'react'
import { ICONS } from '../../lib/icons'
import { getItems, giveScissors, giveTreeStand, type Items } from '../../lib/items'
import type { Door } from '../../types'
import { Icon } from '../Icon'

type MessageDoorData = Extract<Door, { type: 'message' }>

// What each note hands over: which item it is, how to give it, and what to say the first time.
const GIFTS = {
  scissors: {
    has: (items: Items) => items.scissors,
    give: giveScissors,
    icon: ICONS.scissors,
    line: 'Du fick en sax! Titta på hemsidan – det är något inslaget där…',
  },
  treeStand: {
    has: (items: Items) => items.treeStand,
    give: giveTreeStand,
    icon: ICONS.treeStand,
    line: 'Du fick en julgransfot! Den står nu i julrummet.',
  },
}

// A note from Santa or the neighbour. Reading it for the first time hands over its item.
export function MessageDoor({ door, calendarId }: { door: MessageDoorData; calendarId: string }) {
  const gift = GIFTS[door.gives]
  const [firstTime] = useState(() => !gift.has(getItems(calendarId)))

  useEffect(() => {
    gift.give(calendarId)
  }, [gift, calendarId])

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
