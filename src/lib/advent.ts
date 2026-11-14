import type { Door } from '../types'

// The four Advent candles on the mantelpiece in the Christmas room. The first burns from the start;
// the others are lit by opening the door that has `lightsCandle: 2 | 3 | 4` (see src/calendars/index.ts).
export function litCandles(doors: Door[], openedDays: number[]): boolean[] {
  return [1, 2, 3, 4].map((n) => n === 1 || doors.some((d) => d.lightsCandle === n && openedDays.includes(d.day)))
}
