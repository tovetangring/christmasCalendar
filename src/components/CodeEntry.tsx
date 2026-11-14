import { useState, type FormEvent } from 'react'
import { findCalendar } from '../calendars'
import { navigate } from '../hooks/useHashRoute'

export function CodeEntry() {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [spin, setSpin] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    const calendar = findCalendar(code)
    if (calendar) navigate(`/c/${calendar.id}`)
    else setError(true)
  }

  return (
    <main className="page center">
      <h1>
        <span className={`tree ${spin ? 'spin' : ''}`} onClick={() => setSpin(true)} onAnimationEnd={() => setSpin(false)}>
          🎄
        </span>{' '}
        Christmas Calendar
      </h1>
      <form onSubmit={submit}>
        <input
          autoFocus
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError(false)
          }}
          placeholder="Enter your code"
          aria-label="Calendar code"
        />
        <button type="submit">Open</button>
      </form>
      {error && <p className="error">Hmm, that code doesn’t open anything. Try again!</p>}
    </main>
  )
}
