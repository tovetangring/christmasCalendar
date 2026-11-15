import { useCallback } from 'react'
import { createStore, parseJSON } from '../lib/store'

// Which doors have been opened in a calendar (a list of day numbers).
const store = createStore<number[]>('opened', (raw) => {
  const v = parseJSON(raw)
  return Array.isArray(v) ? v.filter((n): n is number => typeof n === 'number') : []
})

export const getOpenedDoors = store.get

export function useOpenedDoors(calendarId: string) {
  const opened = store.use(calendarId)
  const markOpened = useCallback(
    (day: number) => store.update(calendarId, (days) => (days.includes(day) ? days : [...days, day])),
    [calendarId],
  )
  return { opened, markOpened }
}
