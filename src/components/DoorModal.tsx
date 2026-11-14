import { useEffect, useRef } from 'react'
import type { Door } from '../types'
import { isWideDoor, renderDoor } from '../doors/registry'

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
        className={`modal ${isWideDoor(door) ? 'wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="door-title"
        tabIndex={-1}
      >
        <h2 id="door-title">December {door.day}</h2>
        {renderDoor(door, { calendarId, player })}
        <button onClick={onClose}>Stäng</button>
      </div>
    </div>
  )
}
