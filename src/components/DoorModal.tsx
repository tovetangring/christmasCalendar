import { useEffect, useRef } from 'react'
import type { Door } from '../types'
import { QuoteDoor } from './doors/QuoteDoor'
import { VideoDoor } from './doors/VideoDoor'
import { MessageDoor } from './doors/MessageDoor'
import { CatDoor } from './doors/CatDoor'
import { WreathDoor } from './doors/WreathDoor'
import { CurtainsDoor } from './doors/CurtainsDoor'
import { PenguinGame } from '../games/penguin/PenguinGame'
import { SnowballGame } from '../games/snowball/SnowballGame'
import { ChopGame } from '../games/chop/ChopGame'
import { ClawGame } from '../games/claw/ClawGame'
import { StarGame } from '../games/star/StarGame'
import { WheelGame } from '../games/wheel/WheelGame'
import { WordleGame } from '../games/wordle/WordleGame'
import { CrosswordGame } from '../games/crossword/CrosswordGame'

type Props = { door: Door; calendarId: string; player: string; onClose: () => void }

export function DoorModal({ door, calendarId, player, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })

  // Move focus into the dialog, close on Escape, and give focus back to the door afterwards.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    modalRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [])

  return (
    // Only a press that starts on the backdrop itself closes the dialog, so dragging out of a game doesn't.
    <div className="backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={modalRef}
        className={`modal ${door.type === 'game' || door.type === 'video' ? 'wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="door-title"
        tabIndex={-1}
      >
        <h2 id="door-title">December {door.day}</h2>
        {door.type === 'quote' && <QuoteDoor door={door} />}
        {door.type === 'video' && <VideoDoor door={door} />}
        {door.type === 'message' && <MessageDoor door={door} calendarId={calendarId} />}
        {door.type === 'cat' && <CatDoor calendarId={calendarId} />}
        {door.type === 'wreath' && <WreathDoor calendarId={calendarId} />}
        {door.type === 'curtains' && <CurtainsDoor calendarId={calendarId} />}
        {door.type === 'game' && door.game === 'penguin' && <PenguinGame player={player} calendarId={calendarId} />}
        {door.type === 'game' && door.game === 'snowball' && <SnowballGame player={player} calendarId={calendarId} />}
        {door.type === 'game' && door.game === 'chop' && <ChopGame calendarId={calendarId} />}
        {door.type === 'game' && door.game === 'claw' && <ClawGame calendarId={calendarId} />}
        {door.type === 'game' && door.game === 'star' && <StarGame calendarId={calendarId} />}
        {door.type === 'game' && door.game === 'wheel' && <WheelGame calendarId={calendarId} />}
        {door.type === 'game' && door.game === 'wordle' && <WordleGame calendarId={calendarId} />}
        {door.type === 'game' && door.game === 'crossword' && <CrosswordGame calendarId={calendarId} />}
        <button onClick={onClose}>Stäng</button>
      </div>
    </div>
  )
}
