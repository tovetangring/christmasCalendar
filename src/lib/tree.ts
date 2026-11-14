import { useMemo, useSyncExternalStore } from 'react'
import { DECORATIONS, type DecorationId } from '../games/tree/decorations'
import { readString, writeString } from './storage'

// The player's Christmas tree, one per calendar: chopped down on door 4, decorated from door 10.
export type TreeState = { chopped: boolean; decorations: DecorationId[]; packages: number }

const EVENT = 'tree-changed'
const keyFor = (calendarId: string) => `tree:${calendarId}`
const readRaw = (calendarId: string) => readString(keyFor(calendarId)) ?? ''

function parse(raw: string): TreeState {
  try {
    const v = JSON.parse(raw)
    const known = (d: unknown): d is DecorationId => DECORATIONS.some((x) => x.id === d)
    const packages = Number.isFinite(v?.packages) ? Math.max(0, Math.floor(v.packages)) : 0
    return { chopped: !!v?.chopped, decorations: Array.isArray(v?.decorations) ? v.decorations.filter(known) : [], packages }
  } catch {
    return { chopped: false, decorations: [], packages: 0 }
  }
}

function write(calendarId: string, tree: TreeState) {
  writeString(keyFor(calendarId), JSON.stringify(tree))
  window.dispatchEvent(new Event(EVENT))
}

export const getTree = (calendarId: string) => parse(readRaw(calendarId))
export const isLit = (tree: TreeState) => DECORATIONS.every((d) => tree.decorations.includes(d.id))

export function markChopped(calendarId: string) {
  write(calendarId, { ...getTree(calendarId), chopped: true })
}

// Packages won on the wheel; they pile up under the tree with a counter.
export function addPackage(calendarId: string) {
  const tree = getTree(calendarId)
  write(calendarId, { ...tree, packages: tree.packages + 1 })
}

export function addDecoration(calendarId: string, id: DecorationId) {
  const tree = getTree(calendarId)
  const isNew = !tree.decorations.includes(id)
  if (isNew) write(calendarId, { ...tree, decorations: [...tree.decorations, id] })
  return { isNew, lit: isLit(getTree(calendarId)) }
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

export function useTree(calendarId: string): TreeState {
  const raw = useSyncExternalStore(subscribe, () => readRaw(calendarId))
  return useMemo(() => parse(raw), [raw])
}
