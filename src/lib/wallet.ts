import { useSyncExternalStore } from 'react'
import { readString, writeString } from './storage'

// The candy you earn from games and spend on the wheel, one balance per calendar.
const EVENT = 'wallet-changed'
const keyFor = (calendarId: string) => `candy:${calendarId}`

export function getCandy(calendarId: string): number {
  const n = Number(readString(keyFor(calendarId)))
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

function write(calendarId: string, amount: number) {
  writeString(keyFor(calendarId), String(amount))
  window.dispatchEvent(new Event(EVENT))
}

export function addCandy(calendarId: string, amount = 1) {
  write(calendarId, getCandy(calendarId) + amount)
}

// Returns false (and spends nothing) if there isn't enough.
export function spendCandy(calendarId: string, amount: number): boolean {
  const have = getCandy(calendarId)
  if (have < amount) return false
  write(calendarId, have - amount)
  return true
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

export function useCandy(calendarId: string): number {
  return useSyncExternalStore(subscribe, () => getCandy(calendarId))
}
