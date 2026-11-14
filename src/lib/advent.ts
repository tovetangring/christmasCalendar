// The four Advent candles on the mantelpiece in the Christmas room.
// Each one is lit by something: 'start' = burning from the beginning, a number = that door has been opened,
// undefined = not hooked up yet (stays unlit until a door is assigned to it).
export const CANDLE_LIT_BY: (number | 'start' | undefined)[] = ['start', 6, 13, 20]

export function litCandles(openedDays: number[]): boolean[] {
  return CANDLE_LIT_BY.map((by) => by === 'start' || (by !== undefined && openedDays.includes(by)))
}
