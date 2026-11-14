import { useMemo, useSyncExternalStore } from 'react'
import { readString, writeString } from './storage'

// A small saved value per calendar (the tree, candy, items, opened doors), kept in localStorage under `name:calendarId`.
// `parse` turns what is saved (or null, if nothing is) into a valid value and must never throw. Every component using
// `use` re-renders when the value changes, in this tab or another one.
export function createStore<T>(name: string, parse: (raw: string | null) => T, serialize: (value: T) => string = JSON.stringify) {
  const keyFor = (calendarId: string) => `${name}:${calendarId}`
  const event = `store-changed:${name}`
  const readRaw = (calendarId: string) => readString(keyFor(calendarId))

  const get = (calendarId: string): T => parse(readRaw(calendarId))

  function set(calendarId: string, value: T) {
    writeString(keyFor(calendarId), serialize(value))
    window.dispatchEvent(new Event(event))
  }

  // Change the value based on what it is now. Returning the same value saves nothing.
  function update(calendarId: string, change: (current: T) => T) {
    const current = get(calendarId)
    const next = change(current)
    if (next !== current) set(calendarId, next)
  }

  function subscribe(callback: () => void) {
    window.addEventListener(event, callback)
    window.addEventListener('storage', callback)
    return () => {
      window.removeEventListener(event, callback)
      window.removeEventListener('storage', callback)
    }
  }

  // The raw saved text is the snapshot, so React only re-renders when it really changed.
  function useValue(calendarId: string): T {
    const raw = useSyncExternalStore(subscribe, () => readRaw(calendarId))
    return useMemo(() => parse(raw), [raw])
  }

  return { get, set, update, use: useValue }
}

// Reads saved JSON, or undefined if there is none or it is broken.
export function parseJSON(raw: string | null): unknown {
  if (raw === null) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}
