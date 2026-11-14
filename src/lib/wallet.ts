import { createStore } from './store'

// The candy you earn from games and spend on the wheel, one balance per calendar (saved as a plain number).
const store = createStore<number>(
  'candy',
  (raw) => {
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
  },
  String,
)

export const getCandy = store.get
export const useCandy = store.use

export function addCandy(calendarId: string, amount = 1) {
  store.update(calendarId, (have) => have + amount)
}

// Returns false (and spends nothing) if there isn't enough.
export function spendCandy(calendarId: string, amount: number): boolean {
  if (getCandy(calendarId) < amount) return false
  store.update(calendarId, (have) => have - amount)
  return true
}
