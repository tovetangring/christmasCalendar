// The Christmas crossword on door 8. Rows and columns start at 0; clue numbers are worked out from the layout.
// Layout checked with a search script: crossings agree and no unintended extra words appear.
export type Dir = 'across' | 'down'
type RawEntry = { dir: Dir; row: number; col: number; answer: string; clue: string }
export type Entry = RawEntry & { n: number }
export type Cell = { row: number; col: number; letter: string; n?: number }

const RAW: RawEntry[] = [
  { dir: 'across', row: 0, col: 0, answer: 'LJUS', clue: 'Brinner i adventsstaken' },
  { dir: 'down', row: 0, col: 3, answer: 'SLÄDE', clue: 'Tomten åker i den' },
  { dir: 'across', row: 0, col: 6, answer: 'SNÖ', clue: 'Vitt som faller på vintern' },
  { dir: 'down', row: 0, col: 6, answer: 'STRUMPA', clue: 'Hänger på spisen och fylls med godis' },
  { dir: 'across', row: 2, col: 1, answer: 'BJÄLLRA', clue: 'Klingar i renarnas selar' },
  { dir: 'down', row: 3, col: 0, answer: 'ÄPPLE', clue: 'Frukt i julskålen' },
  { dir: 'across', row: 4, col: 0, answer: 'PAKET', clue: 'Inslaget i julpapper' },
  { dir: 'down', row: 4, col: 2, answer: 'KANEL', clue: 'Krydda i glögg och bullar' },
  { dir: 'down', row: 4, col: 8, answer: 'NISSE', clue: 'Liten gårdsvätte som vill ha gröt' },
  { dir: 'across', row: 6, col: 4, answer: 'KRANS', clue: 'Rund dekoration av granris' },
  { dir: 'across', row: 8, col: 4, answer: 'TOMTE', clue: 'Han delar ut julklapparna' },
]

export const key = (row: number, col: number) => `${row},${col}`

// Cells in a word, in order.
export function cellsOf(entry: RawEntry): [number, number][] {
  return [...entry.answer].map((_, i) => (entry.dir === 'across' ? [entry.row, entry.col + i] : [entry.row + i, entry.col]))
}

// Number the words in reading order; an across and a down word starting in the same cell share a number.
function numberEntries(raw: RawEntry[]): Entry[] {
  const starts = [...new Set(raw.map((e) => key(e.row, e.col)))]
    .map((k) => k.split(',').map(Number))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const number = (e: RawEntry) => starts.findIndex(([r, c]) => r === e.row && c === e.col) + 1
  return raw
    .map((e) => ({ ...e, n: number(e) }))
    .sort((a, b) => a.n - b.n || (a.dir === 'across' ? -1 : 1))
}

function buildGrid(entries: Entry[]) {
  const cells = new Map<string, Cell>()
  for (const e of entries) {
    cellsOf(e).forEach(([row, col], i) => {
      const existing = cells.get(key(row, col))
      if (existing && existing.letter !== e.answer[i]) throw new Error(`Crossword conflict at ${row},${col}`)
      if (!existing) cells.set(key(row, col), { row, col, letter: e.answer[i] })
    })
    const start = cells.get(key(e.row, e.col))!
    start.n = e.n
  }
  const all = [...cells.values()]
  return { cells, rows: Math.max(...all.map((c) => c.row)) + 1, cols: Math.max(...all.map((c) => c.col)) + 1 }
}

export const ENTRIES = numberEntries(RAW)
export const GRID = buildGrid(ENTRIES)

export function wordAt(row: number, col: number, dir: Dir): Entry | undefined {
  return ENTRIES.find((e) => e.dir === dir && cellsOf(e).some(([r, c]) => r === row && c === col))
}
