import { useMemo, useSyncExternalStore } from 'react'
import { readString, writeString } from './storage'

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
] as const

export type ItemId = (typeof ITEMS)[number]
export type Items = Record<ItemId, boolean>

const EVENT = 'items-changed'
const keyFor = (calendarId: string) => `items:${calendarId}`
const readRaw = (calendarId: string) => readString(keyFor(calendarId)) ?? ''

// Missing or broken flags count as false, so older saves keep working when new items are added.
function parse(raw: string): Items {
  let saved: Record<string, unknown> = {}
  try {
    const value = JSON.parse(raw)
    if (value && typeof value === 'object') saved = value
  } catch {
    /* nothing saved yet, or junk: start empty */
  }
  return Object.fromEntries(ITEMS.map((id) => [id, saved[id] === true])) as Items
}

function write(calendarId: string, items: Items) {
  writeString(keyFor(calendarId), JSON.stringify(items))
  window.dispatchEvent(new Event(EVENT))
}

export const getItems = (calendarId: string) => parse(readRaw(calendarId))

// Gives an item (does nothing if you already have it).
export function giveItem(calendarId: string, id: ItemId) {
  const items = getItems(calendarId)
  if (!items[id]) write(calendarId, { ...items, [id]: true })
}

// Door 5 leaves a fish on the floor, once. Returns true if it was just given (not given again once the cat has come).
export function giveFish(calendarId: string): boolean {
  const items = getItems(calendarId)
  if (items.fish || items.cat) return false
  write(calendarId, { ...items, fish: true })
  return true
}

// Door 16: a cat eats the fish (if there is one) and then stays.
export function feedCat(calendarId: string) {
  const items = getItems(calendarId)
  if (items.fish) write(calendarId, { ...items, fish: false, cat: true })
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

export function useItems(calendarId: string): Items {
  const raw = useSyncExternalStore(subscribe, () => readRaw(calendarId))
  return useMemo(() => parse(raw), [raw])
}
