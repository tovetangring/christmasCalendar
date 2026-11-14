import type { Door } from '../../types'

type QuoteDoorData = Extract<Door, { type: 'quote' }>

export function QuoteDoor({ door }: { door: QuoteDoorData }) {
  return (
    <figure className="quote">
      <blockquote className={door.poem ? 'poem' : undefined}>{door.poem ? door.text : `“${door.text}”`}</blockquote>
      {door.author && <figcaption>— {door.author}</figcaption>}
    </figure>
  )
}
