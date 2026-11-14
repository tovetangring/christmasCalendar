import type { Calendar } from '../types'

const quotes: [string, string?][] = [
  ['Placeholder quote for December 1st.', 'Someone'],
  ['Placeholder quote for December 2nd.', 'Someone'],
  ['Placeholder quote for December 3rd.', 'Someone'],
  ['Placeholder quote for December 4th.', 'Someone'],
  ['Placeholder quote for December 5th.', 'Someone'],
  ['Placeholder quote for December 6th.', 'Someone'],
  ['Placeholder quote for December 7th.', 'Someone'],
  ['Placeholder quote for December 8th.', 'Someone'],
  ['Placeholder quote for December 9th.', 'Someone'],
  ['Placeholder quote for December 10th.', 'Someone'],
  ['Placeholder quote for December 11th.', 'Someone'],
  ['Placeholder quote for December 12th.', 'Someone'],
  ['Placeholder quote for December 13th.', 'Someone'],
  ['Placeholder quote for December 14th.', 'Someone'],
  ['Placeholder quote for December 15th.', 'Someone'],
  ['Placeholder quote for December 16th.', 'Someone'],
  ['Placeholder quote for December 17th.', 'Someone'],
  ['Placeholder quote for December 18th.', 'Someone'],
  ['Placeholder quote for December 19th.', 'Someone'],
  ['Placeholder quote for December 20th.', 'Someone'],
  ['Placeholder quote for December 21st.', 'Someone'],
  ['Placeholder quote for December 22nd.', 'Someone'],
  ['Placeholder quote for December 23rd.', 'Someone'],
  ['Placeholder quote for December 24th.', 'Someone'],
]

export const ivar: Calendar = {
  id: 'ivar',
  player: 'Ivar',
  name: "Ivar's Christmas Calendar",
  doors: quotes.map(([text, author], i) => ({ day: i + 1, type: 'quote', text, author })),
}
