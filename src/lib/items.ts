import { useMemo, useSyncExternalStore } from 'react'
import { readString, writeString } from './storage'

// Things you get from doors and see/use on the home page. One set per calendar.
// Door 1 gives the scissors (which cut open the wrapping around the Christmas room), door 2 (Wordle) the rug
// and door 3 the tree stand; the rug and stand are drawn in the room.
export type Items = { scissors: boolean; unwrapped: boolean; rug: boolean; treeStand: boolean; fish: boolean; cat: boolean; armchair: boolean; wreath: boolean; curtains: boolean }

const EVENT = 'items-changed'
const keyFor = (calendarId: string) => `items:${calendarId}`
const readRaw = (calendarId: string) => readString(keyFor(calendarId)) ?? ''

function parse(raw: string): Items {
  try {
    const v = JSON.parse(raw)
    return { scissors: !!v?.scissors, unwrapped: !!v?.unwrapped, rug: !!v?.rug, treeStand: !!v?.treeStand, fish: !!v?.fish, cat: !!v?.cat, armchair: !!v?.armchair, wreath: !!v?.wreath, curtains: !!v?.curtains }
  } catch {
    return {
      scissors: false,
      unwrapped: false,
      rug: false,
      treeStand: false,
      fish: false,
      cat: false,
      armchair: false,
      wreath: false,
      curtains: false,
    }
  }
}

function write(calendarId: string, items: Items) {
  writeString(keyFor(calendarId), JSON.stringify(items))
  window.dispatchEvent(new Event(EVENT))
}

export const getItems = (calendarId: string) => parse(readRaw(calendarId))

export function giveScissors(calendarId: string) {
  const items = getItems(calendarId)
  if (!items.scissors) write(calendarId, { ...items, scissors: true })
}

export function giveRug(calendarId: string) {
  const items = getItems(calendarId)
  if (!items.rug) write(calendarId, { ...items, rug: true })
}

export function giveTreeStand(calendarId: string) {
  const items = getItems(calendarId)
  if (!items.treeStand) write(calendarId, { ...items, treeStand: true })
}

// Door 19: the curtains for the window.
export function giveCurtains(calendarId: string) {
  const items = getItems(calendarId)
  if (!items.curtains) write(calendarId, { ...items, curtains: true })
}

// Door 12: the wreath for the front door.
export function giveWreath(calendarId: string) {
  const items = getItems(calendarId)
  if (!items.wreath) write(calendarId, { ...items, wreath: true })
}

// Door 8 (the crossword): the armchair with the crossword on its seat.
export function giveArmchair(calendarId: string) {
  const items = getItems(calendarId)
  if (!items.armchair) write(calendarId, { ...items, armchair: true })
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

export function unwrapRoom(calendarId: string) {
  write(calendarId, { ...getItems(calendarId), unwrapped: true })
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
