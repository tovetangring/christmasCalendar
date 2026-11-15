import { CodeEntry } from './components/CodeEntry'
import { CalendarGrid } from './components/CalendarGrid'
import { CloudCalendar } from './components/CloudCalendar'
import { SignIn } from './components/SignIn'
import { findCalendar, playerCalendar } from './calendars'
import { Ambient } from './components/Ambient'
import { IconFilters } from './components/Icon'
import { useHashRoute } from './hooks/useHashRoute'
import { firebaseEnabled, isAdmin, playerName, signOut, useAuth } from './lib/firebase'

function safeDecode(value: string): string | undefined {
  try {
    return decodeURIComponent(value)
  } catch {
    return undefined // malformed % escape in the URL
  }
}

// Without Firebase: pick a calendar with its code (#/c/<code>), everything saved locally.
// With Firebase: sign in with Google and your own calendar opens; the admin can also open the code calendars.
function Pages() {
  const route = useHashRoute()
  const auth = useAuth()
  const match = route.match(/^\/c\/([^/]+)$/)
  const code = match ? safeDecode(match[1]) : undefined
  const codeCalendar = code ? findCalendar(code) : undefined

  if (!firebaseEnabled) return codeCalendar ? <CalendarGrid key={codeCalendar.id} calendar={codeCalendar} /> : <CodeEntry />

  if (auth.status === 'loading') {
    return (
      <main className="page center">
        <p>Laddar… 🎄</p>
      </main>
    )
  }
  if (!auth.user) return <SignIn />

  const admin = isAdmin(auth.user)
  const footer = (
    <p className="account-links">
      {admin && (
        <a className="back" href={codeCalendar ? '#/' : '#/admin'}>
          {codeCalendar ? '← Min kalender' : 'Admin: öppna en annan kalender'}
        </a>
      )}
      <button className="link-button" onClick={() => signOut()}>
        Logga ut
      </button>
    </p>
  )

  if (admin && route === '/admin') return <CodeEntry />
  if (admin && codeCalendar) return <CloudCalendar key={codeCalendar.id} calendar={codeCalendar} footer={footer} />
  const own = playerCalendar(auth.user.uid, playerName(auth.user))
  return <CloudCalendar key={own.id} calendar={own} footer={footer} />
}

export default function App() {
  return (
    <>
      <IconFilters />
      <Ambient />
      <Pages />
    </>
  )
}
