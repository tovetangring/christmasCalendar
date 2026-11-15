import type { ReactNode } from 'react'
import { useCloudSync } from '../lib/cloudSync'
import type { Calendar } from '../types'
import { CalendarGrid } from './CalendarGrid'

// A calendar whose progress is saved in the cloud: waits for it to load first.
export function CloudCalendar({ calendar, footer }: { calendar: Calendar; footer: ReactNode }) {
  const status = useCloudSync(calendar.id)
  if (status === 'loading') {
    return (
      <main className="page center">
        <p>Hämtar din kalender… 🎄</p>
      </main>
    )
  }
  return (
    <>
      {status === 'error' && <p className="hint sync-warning">Kunde inte nå molnet just nu – det du gör sparas på den här datorn.</p>}
      <CalendarGrid calendar={calendar} footer={footer} />
    </>
  )
}
