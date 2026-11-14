import type { MouseEvent } from 'react'

const KEY_ROWS = ['QWERTYUIOPÅ', 'ASDFGHJKLÖÄ', 'ZXCVBNM']

// The on-screen keyboard shared by Wordle and the crossword. `onKey` gets a letter, 'ENTER' or 'BACKSPACE'.
// `marks` maps a letter to a CSS class (e.g. 'correct') to colour its key.
export function ScreenKeyboard({
  onKey,
  marks = {},
  enterLabel = 'Enter',
}: {
  onKey: (key: string) => void
  marks?: Record<string, string>
  enterLabel?: string
}) {
  // Blur after each tap so the physical keyboard keeps working (key handlers ignore keys typed on buttons).
  const tap = (key: string) => (e: MouseEvent<HTMLButtonElement>) => {
    onKey(key)
    e.currentTarget.blur()
  }
  return (
    <div className="screen-keyboard">
      {KEY_ROWS.map((letters, r) => (
        <div className="screen-keys" key={r}>
          {r === 2 && (
            <button className="wide" onClick={tap('ENTER')}>
              {enterLabel}
            </button>
          )}
          {[...letters].map((letter) => (
            <button key={letter} className={marks[letter] ?? ''} onClick={tap(letter)}>
              {letter}
            </button>
          ))}
          {r === 2 && (
            <button className="wide" aria-label="Radera" onClick={tap('BACKSPACE')}>
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
