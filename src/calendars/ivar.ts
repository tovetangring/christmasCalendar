import type { Calendar } from '../types'

const quotes: [string, string?][] = [
  ['Platshållarcitat för den 1 december.', 'Någon'],
  ['Platshållarcitat för den 2 december.', 'Någon'],
  ['Platshållarcitat för den 3 december.', 'Någon'],
  ['Platshållarcitat för den 4 december.', 'Någon'],
  ['Platshållarcitat för den 5 december.', 'Någon'],
  ['Platshållarcitat för den 6 december.', 'Någon'],
  ['Platshållarcitat för den 7 december.', 'Någon'],
  ['Platshållarcitat för den 8 december.', 'Någon'],
  ['Platshållarcitat för den 9 december.', 'Någon'],
  ['Platshållarcitat för den 10 december.', 'Någon'],
  ['Platshållarcitat för den 11 december.', 'Någon'],
  ['Platshållarcitat för den 12 december.', 'Någon'],
  ['Platshållarcitat för den 13 december.', 'Någon'],
  ['Platshållarcitat för den 14 december.', 'Någon'],
  ['Platshållarcitat för den 15 december.', 'Någon'],
  ['Platshållarcitat för den 16 december.', 'Någon'],
  ['Platshållarcitat för den 17 december.', 'Någon'],
  ['Platshållarcitat för den 18 december.', 'Någon'],
  ['Platshållarcitat för den 19 december.', 'Någon'],
  ['Platshållarcitat för den 20 december.', 'Någon'],
  ['Platshållarcitat för den 21 december.', 'Någon'],
  ['Platshållarcitat för den 22 december.', 'Någon'],
  ['Platshållarcitat för den 23 december.', 'Någon'],
  ['Platshållarcitat för den 24 december.', 'Någon'],
]

export const ivar: Calendar = {
  id: 'ivar',
  player: 'Ivar',
  name: "Ivars julkalender",
  doors: quotes.map(([text, author], i) => ({ day: i + 1, type: 'quote', text, author })),
}
