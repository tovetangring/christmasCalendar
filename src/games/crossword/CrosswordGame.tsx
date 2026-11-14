import { useCallback, useEffect, useState } from 'react'
import { CandyReward } from '../../components/CandyReward'
import { Icon } from '../../components/Icon'
import { ICONS } from '../../lib/icons'
import { giveItem } from '../../lib/items'
import { readJSON, writeString } from '../../lib/storage'
import { addCandy } from '../../lib/wallet'
import { ignoreKey } from '../keys'
import { cellsOf, ENTRIES, GRID, key, wordAt, type Dir } from './puzzle'

type Saved = { letters: Record<string, string>; solved: boolean }
type Selection = { row: number; col: number; dir: Dir }

const isSaved = (v: unknown): v is Saved =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as Saved).solved === 'boolean' &&
  typeof (v as Saved).letters === 'object' &&
  (v as Saved).letters !== null &&
  Object.values((v as Saved).letters).every((l) => typeof l === 'string' && l.length <= 1)

const isComplete = (letters: Record<string, string>) =>
  [...GRID.cells.values()].every((c) => letters[key(c.row, c.col)] === c.letter)

const other = (dir: Dir): Dir => (dir === 'across' ? 'down' : 'across')

export function CrosswordGame({ calendarId }: { calendarId: string }) {
  const storageKey = `crossword:${calendarId}`
  const [saved, setSaved] = useState<Saved>(() => readJSON(storageKey, isSaved, { letters: {}, solved: false }))
  const [sel, setSel] = useState<Selection>({ row: ENTRIES[0].row, col: ENTRIES[0].col, dir: ENTRIES[0].dir })
  const [wrong, setWrong] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [justWon, setJustWon] = useState(false)

  useEffect(() => {
    writeString(storageKey, JSON.stringify(saved))
  }, [storageKey, saved])

  // Solving the crossword puts an armchair with the crossword in the room (also for people who solved it before).
  useEffect(() => {
    if (saved.solved) giveItem(calendarId, 'armchair')
  }, [saved.solved, calendarId])

  const word = wordAt(sel.row, sel.col, sel.dir)
  const wordCells = new Set(word ? cellsOf(word).map(([r, c]) => key(r, c)) : [])

  function select(row: number, col: number) {
    if (saved.solved) return
    if (row === sel.row && col === sel.col) {
      if (wordAt(row, col, other(sel.dir))) setSel({ row, col, dir: other(sel.dir) }) // tap again = switch direction
    } else {
      setSel({ row, col, dir: wordAt(row, col, sel.dir) ? sel.dir : other(sel.dir) })
    }
  }

  function selectEntry(index: number) {
    const e = ENTRIES[index]
    setSel({ row: e.row, col: e.col, dir: e.dir })
  }

  const press = useCallback(
    (k: string) => {
      if (saved.solved) return
      const here = key(sel.row, sel.col)
      setMessage('')
      if (k === 'ENTER') {
        const i = ENTRIES.findIndex((e) => e === word)
        selectEntry((i + 1) % ENTRIES.length) // on to the next word
      } else if (k === 'BACKSPACE') {
        const letters = { ...saved.letters }
        if (letters[here]) {
          delete letters[here]
          setSaved({ ...saved, letters })
          setWrong((w) => w.filter((x) => x !== here))
        } else {
          const pr = sel.dir === 'down' ? sel.row - 1 : sel.row
          const pc = sel.dir === 'across' ? sel.col - 1 : sel.col
          if (GRID.cells.has(key(pr, pc))) {
            delete letters[key(pr, pc)]
            setSaved({ ...saved, letters })
            setSel({ ...sel, row: pr, col: pc })
          }
        }
      } else if (k.startsWith('ARROW')) {
        const dir: Dir = k === 'ARROWLEFT' || k === 'ARROWRIGHT' ? 'across' : 'down'
        const dr = k === 'ARROWUP' ? -1 : k === 'ARROWDOWN' ? 1 : 0
        const dc = k === 'ARROWLEFT' ? -1 : k === 'ARROWRIGHT' ? 1 : 0
        const next = GRID.cells.has(key(sel.row + dr, sel.col + dc)) ? [sel.row + dr, sel.col + dc] : [sel.row, sel.col]
        setSel({ row: next[0], col: next[1], dir: wordAt(next[0], next[1], dir) ? dir : sel.dir })
      } else {
        const letters = { ...saved.letters, [here]: k }
        const solved = isComplete(letters)
        if (solved) {
          addCandy(calendarId, 1) // only reachable once: after solving, the early return above blocks input
          setJustWon(true)
        }
        setSaved({ letters, solved })
        setWrong((w) => w.filter((x) => x !== here))
        const nr = sel.dir === 'down' ? sel.row + 1 : sel.row
        const nc = sel.dir === 'across' ? sel.col + 1 : sel.col
        if (!solved && GRID.cells.has(key(nr, nc))) setSel({ ...sel, row: nr, col: nc })
      }
    },
    [saved, sel, word, calendarId],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (ignoreKey(e) || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Enter') press('ENTER')
      else if (e.key === 'Backspace') press('BACKSPACE')
      else if (e.key.startsWith('Arrow')) press(e.key.toUpperCase())
      else if (/^[a-zåäö]$/i.test(e.key)) press(e.key.toLocaleUpperCase('sv'))
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [press])

  function check() {
    const bad = [...GRID.cells.values()]
      .filter((c) => saved.letters[key(c.row, c.col)] && saved.letters[key(c.row, c.col)] !== c.letter)
      .map((c) => key(c.row, c.col))
    setWrong(bad)
    const filled = [...GRID.cells.values()].filter((c) => saved.letters[key(c.row, c.col)]).length
    if (bad.length) setMessage(bad.length === 1 ? '1 ruta är fel' : `${bad.length} rutor är fel`)
    else setMessage(filled === 0 ? 'Skriv något först!' : 'Allt du skrivit hittills är rätt!')
  }

  const clueList = (dir: Dir) =>
    ENTRIES.map((e, i) => ({ e, i }))
      .filter(({ e }) => e.dir === dir)
      .map(({ e, i }) => (
        <li key={i}>
          <button
            className={`clue ${word === e ? 'active' : ''}`}
            onClick={(ev) => {
              selectEntry(i)
              ev.currentTarget.blur() // so the physical keyboard keeps working
            }}
          >
            <strong>{e.n}.</strong> {e.clue} ({e.answer.length})
          </button>
        </li>
      ))

  return (
    <div className="crossword">
      <div
        className="cx-grid"
        role="grid"
        aria-label="Jul-korsord"
        style={{ '--cols': GRID.cols } as React.CSSProperties}
      >
        {Array.from({ length: GRID.rows }, (_, r) => (
          <div className="cx-row" role="row" key={r}>
            {Array.from({ length: GRID.cols }, (_, c) => {
              const cell = GRID.cells.get(key(r, c))
              if (!cell) return <div className="cx-blank" key={c} />
              const k = key(r, c)
              const active = !saved.solved && sel.row === r && sel.col === c
              return (
                <div
                  key={c}
                  role="gridcell"
                  aria-label={`${cell.n ? `ord ${cell.n}, ` : ''}${saved.letters[k] || 'tom ruta'}`}
                  className={`cx-cell ${active ? 'active' : ''} ${!saved.solved && wordCells.has(k) ? 'in-word' : ''} ${wrong.includes(k) ? 'wrong' : ''} ${saved.solved ? 'solved' : ''}`}
                  onClick={() => select(r, c)}
                >
                  {cell.n && <span className="cx-num">{cell.n}</span>}
                  {saved.letters[k] ?? ''}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <p className="game-status" aria-live="polite">
        {message}
        {saved.solved && (justWon ? '🎉 Klart! Alla ord är rätt.' : 'Du har redan löst korsordet – godiset är hämtat.')}
      </p>
      {justWon && <CandyReward />}
      {saved.solved && (
        <p className="hint">
          <Icon icon={ICONS.armchair} size={18} /> En fåtölj med korsordet står nu i julrummet.
        </p>
      )}
      {!saved.solved && (
        <button
          onClick={(e) => {
            check()
            e.currentTarget.blur()
          }}
        >
          Kontrollera
        </button>
      )}

      <div className="cx-clues">
        <div>
          <h3>Vågrätt</h3>
          <ul>{clueList('across')}</ul>
        </div>
        <div>
          <h3>Lodrätt</h3>
          <ul>{clueList('down')}</ul>
        </div>
      </div>

    </div>
  )
}
