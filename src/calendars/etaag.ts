import type { Calendar } from '../types'

const quotes: [string, string?][] = Array.from({ length: 24 }, (_, i) => [`Platshållarcitat för den ${i + 1} december.`, 'Någon'])

export const etaag: Calendar = {
  id: 'etaag',
  player: 'Etaag',
  name: "Etaags julkalender",
  doors: quotes.map(([text, author], i) => ({ day: i + 1, type: 'quote', text, author })),
}
