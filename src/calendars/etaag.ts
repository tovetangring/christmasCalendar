import type { Calendar } from '../types'

const quotes: [string, string?][] = Array.from({ length: 24 }, (_, i) => [`Placeholder quote for December ${i + 1}.`, 'Someone'])

export const etaag: Calendar = {
  id: 'etaag',
  player: 'Etaag',
  name: "Etaag's Christmas Calendar",
  doors: quotes.map(([text, author], i) => ({ day: i + 1, type: 'quote', text, author })),
}
