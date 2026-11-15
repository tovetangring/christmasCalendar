import { createStore, parseJSON } from './store'

// Things you get from doors and see/use on the home page, one set per calendar, saved as true/false flags.
// To add one: add its id to ITEMS, hand it out with giveItem(calendarId, 'id'), and draw it in the room.
export const ITEMS = [
  'scissors', // door 1: cuts open the wrapping around the room
  'unwrapped', // the room has been cut open
  'rug', // door 2 (Wordle)
  'treeStand', // door 3
  'fish', // door 5, until the cat eats it
  'cat', // door 16
  'armchair', // door 8 (the crossword)
  'wreath', // door 12
  'curtains', // door 19
  'garland', // door 21
  'treeGarland', // door 15: the tinsel on the tree
  'cookies', // door 9: a plate of cookies in the window for Santa
  'snowman', // door 7: stands outside the window
  'gramophone', // door 11: plays Bjällerklang in the room
  'santaGift', // door 24: Santa came by, ate the cookies and left a golden present
] as const

export type ItemId = (typeof ITEMS)[number]
export type Items = Record<ItemId, boolean>

// Missing or broken flags count as false, so older saves keep working when new items are added.
const store = createStore<Items>('items', (raw) => {
  const v = parseJSON(raw)
  const saved = v && typeof v === 'object' ? (v as Record<string, unknown>) : {}
  return Object.fromEntries(ITEMS.map((id) => [id, saved[id] === true])) as Items
})

export const getItems = store.get
export const useItems = store.use

// Gives an item (does nothing if you already have it).
export function giveItem(calendarId: string, id: ItemId) {
  store.update(calendarId, (items) => (items[id] ? items : { ...items, [id]: true }))
}

// Door 5 leaves a fish on the floor, once. Returns true if it was just given (not given again once the cat has come).
export function giveFish(calendarId: string): boolean {
  const items = getItems(calendarId)
  if (items.fish || items.cat) return false
  store.set(calendarId, { ...items, fish: true })
  return true
}

// Door 16: a cat eats the fish (if there is one) and then stays.
export function feedCat(calendarId: string) {
  store.update(calendarId, (items) => (items.fish ? { ...items, fish: false, cat: true } : items))
}
