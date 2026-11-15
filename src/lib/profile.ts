import { createStore } from './store'

// The name a player has chosen for themselves (shown in the calendar title and the highscore lists).
// Empty until they change it; then it overrides the default name (the first name from Google).
export const MAX_NAME = 16
export const cleanName = (name: string) => name.trim().replace(/\s+/g, ' ').slice(0, MAX_NAME)

const store = createStore<string | null>(
  'name',
  (raw) => (raw && cleanName(raw) ? cleanName(raw) : null),
  (value) => value ?? '',
)

export const useChosenName = store.use
export const saveChosenName = (calendarId: string, name: string) => store.set(calendarId, cleanName(name))
