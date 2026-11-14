import { DECORATIONS, type DecorationId } from '../games/tree/decorations'
import { createStore, parseJSON } from './store'

// The player's Christmas tree, one per calendar: chopped down on door 4, decorated from door 10 and 23,
// with packages from the wheel (door 17) underneath.
export type TreeState = { chopped: boolean; decorations: DecorationId[]; packages: number }

const known = (d: unknown): d is DecorationId => DECORATIONS.some((x) => x.id === d)

const store = createStore<TreeState>('tree', (raw) => {
  const v = parseJSON(raw) as Partial<Record<keyof TreeState, unknown>> | undefined
  const packages = Number(v?.packages)
  return {
    chopped: v?.chopped === true,
    decorations: Array.isArray(v?.decorations) ? v.decorations.filter(known) : [],
    packages: Number.isFinite(packages) ? Math.max(0, Math.floor(packages)) : 0,
  }
})

export const getTree = store.get
export const useTree = store.use
export const isLit = (tree: TreeState) => DECORATIONS.every((d) => tree.decorations.includes(d.id))

export function markChopped(calendarId: string) {
  store.update(calendarId, (tree) => (tree.chopped ? tree : { ...tree, chopped: true }))
}

// Packages won on the wheel; they pile up under the tree with a counter.
export function addPackage(calendarId: string) {
  store.update(calendarId, (tree) => ({ ...tree, packages: tree.packages + 1 }))
}

export function addDecoration(calendarId: string, id: DecorationId) {
  const isNew = !getTree(calendarId).decorations.includes(id)
  if (isNew) store.update(calendarId, (tree) => ({ ...tree, decorations: [...tree.decorations, id] }))
  return { isNew, lit: isLit(getTree(calendarId)) }
}
