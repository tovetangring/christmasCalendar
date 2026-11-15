import { useState } from 'react'
import { signIn } from '../lib/firebase'

// The first page with Firebase: sign in with Google to get (or get back to) your own calendar.
export function SignIn() {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onClick() {
    setError('')
    setBusy(true)
    try {
      await signIn()
    } catch {
      setError('Inloggningen gick inte. Försök igen!')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page center">
      <h1>🎄 Julkalender</h1>
      <p>Logga in för att öppna din egen julkalender. Allt du samlar sparas och följer med dig.</p>
      <div>
        <button onClick={onClick} disabled={busy}>
          {busy ? 'Loggar in…' : 'Logga in med Google'}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </main>
  )
}
