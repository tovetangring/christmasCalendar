import { useCallback, useEffect, useState } from 'react'
import { Icon } from '../../components/Icon'
import { ICONS } from '../../lib/icons'
import { giveRug } from '../../lib/items'
import { readJSON, writeString } from '../../lib/storage'
import { ignoreKey } from '../keys'
import { ScreenKeyboard } from '../ScreenKeyboard'

const ANSWER = 'GLÖGG'
const LENGTH = ANSWER.length
const TRIES = 6

type Mark = 'correct' | 'present' | 'absent'
type Saved = { guesses: string[]; solved: boolean }

const isSaved = (v: unknown): v is Saved =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as Saved).solved === 'boolean' &&
  Array.isArray((v as Saved).guesses) &&
  (v as Saved).guesses.every((g) => typeof g === 'string' && g.length === LENGTH)

// Standard Wordle scoring, which also handles repeated letters (GLÖGG has three Gs).
function score(guess: string): Mark[] {
  const marks: Mark[] = Array(LENGTH).fill('absent')
  const left: Record<string, number> = {}
  for (let i = 0; i < LENGTH; i++) {
    if (guess[i] === ANSWER[i]) marks[i] = 'correct'
    else left[ANSWER[i]] = (left[ANSWER[i]] ?? 0) + 1
  }
  for (let i = 0; i < LENGTH; i++) {
    if (marks[i] !== 'correct' && left[guess[i]] > 0) {
      marks[i] = 'present'
      left[guess[i]]--
    }
  }
  return marks
}

const MARK_LABEL: Record<Mark, string> = { correct: 'rätt plats', present: 'finns i ordet', absent: 'finns inte i ordet' }
const RANK: Record<Mark, number> = { absent: 0, present: 1, correct: 2 }

export function WordleGame({ calendarId }: { calendarId: string }) {
  const storageKey = `wordle:${calendarId}`
  const [saved, setSaved] = useState<Saved>(() => readJSON(storageKey, isSaved, { guesses: [], solved: false }))
  const [current, setCurrent] = useState('')
  const [message, setMessage] = useState('')
  const [revealRow, setRevealRow] = useState(-1)
  const [justWon, setJustWon] = useState(false)

  useEffect(() => {
    writeString(storageKey, JSON.stringify(saved))
  }, [storageKey, saved])

  // Solving the Wordle gives the rug for the Christmas room. Done in an effect so that people who solved it
  // earlier (before it gave a rug) get it too when they open the door.
  useEffect(() => {
    if (saved.solved) giveRug(calendarId)
  }, [saved.solved, calendarId])

  const lost = !saved.solved && saved.guesses.length >= TRIES
  const finished = saved.solved || lost

  const press = useCallback(
    (key: string) => {
      if (finished) return
      setMessage('')
      if (key === 'ENTER') {
        if (current.length < LENGTH) {
          setMessage('För få bokstäver')
          return
        }
        const guesses = [...saved.guesses, current]
        const solved = current === ANSWER
        if (solved) setJustWon(true)
        setSaved({ guesses, solved })
        setRevealRow(guesses.length - 1)
        setCurrent('')
      } else if (key === 'BACKSPACE') {
        setCurrent((c) => c.slice(0, -1))
      } else if (current.length < LENGTH) {
        setCurrent((c) => c + key)
      }
    },
    [finished, current, saved.guesses],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (ignoreKey(e) || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Enter') press('ENTER')
      else if (e.key === 'Backspace') press('BACKSPACE')
      else if (/^[a-zåäö]$/i.test(e.key)) press(e.key.toLocaleUpperCase('sv'))
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [press])

  // The best mark seen so far for each letter, to colour the on-screen keyboard.
  const letterMarks: Record<string, Mark> = {}
  for (const guess of saved.guesses) {
    score(guess).forEach((mark, i) => {
      const letter = guess[i]
      if (!letterMarks[letter] || RANK[mark] > RANK[letterMarks[letter]]) letterMarks[letter] = mark
    })
  }

  function retry() {
    setSaved({ guesses: [], solved: false })
    setCurrent('')
    setMessage('')
    setRevealRow(-1)
  }

  return (
    <div className="wordle">
      <div className="wordle-grid" role="grid" aria-label="Gissa ordet">
        {Array.from({ length: TRIES }, (_, row) => {
          const guess = saved.guesses[row]
          const marks = guess ? score(guess) : null
          const typing = row === saved.guesses.length && !finished
          return (
            <div className="wordle-row" role="row" key={row}>
              {Array.from({ length: LENGTH }, (_, i) => {
                const letter = guess ? guess[i] : typing ? (current[i] ?? '') : ''
                const mark = marks?.[i]
                return (
                  <div
                    key={i}
                    role="gridcell"
                    aria-label={letter ? `${letter}, ${mark ? MARK_LABEL[mark] : 'inte skickad än'}` : 'tom'}
                    className={`wordle-tile ${mark ?? ''} ${letter && !mark ? 'filled' : ''} ${row === revealRow ? 'reveal' : ''}`}
                    style={{ '--i': i } as React.CSSProperties}
                  >
                    {letter}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      <p className="game-status" aria-live="polite">
        {message}
        {saved.solved && (justWon ? <>🎉 Rätt! Ordet var {ANSWER}.</> : <>Du har redan löst den här.</>)}
        {lost && 'Tyvärr, det gick inte den här gången.'}
      </p>
      {saved.solved && (
        <p className="hint">
          <Icon icon={ICONS.rug} size={18} /> Du vann en matta! Den ligger under granen i julrummet.
        </p>
      )}
      {lost && <button onClick={retry}>Försök igen</button>}

      {!finished && <ScreenKeyboard onKey={press} marks={letterMarks} />}
    </div>
  )
}
