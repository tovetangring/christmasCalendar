import { CodeEntry } from './components/CodeEntry'
import { CalendarGrid } from './components/CalendarGrid'
import { findCalendar } from './calendars'
import { Ambient } from './components/Ambient'
import { IconFilters } from './components/Icon'
import { useHashRoute } from './hooks/useHashRoute'

function safeDecode(value: string): string | undefined {
  try {
    return decodeURIComponent(value)
  } catch {
    return undefined // malformed % escape in the URL
  }
}

export default function App() {
  const route = useHashRoute()
  const match = route.match(/^\/c\/([^/]+)$/)
  const code = match ? safeDecode(match[1]) : undefined
  const calendar = code ? findCalendar(code) : undefined
  return (
    <>
      <IconFilters />
      <Ambient />
      {calendar ? <CalendarGrid key={calendar.id} calendar={calendar} /> : <CodeEntry />}
    </>
  )
}
