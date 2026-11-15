import { useEffect, useState } from 'react'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, firebaseEnabled } from './firebase'
import { onWrite, readString, writeString } from './storage'

// Keeps a calendar's progress in Firestore (calendars/<id>), so it follows you between computers.
// localStorage stays the working copy: on opening, what is in the cloud is copied into it (or, the first time,
// what is already saved locally is uploaded); after that every change is sent up shortly after it is made.
const SYNCED = ['items', 'tree', 'candy', 'opened', 'wrapped', 'wordle', 'crossword', 'name'] as const
const DELAY_MS = 700

export type SyncStatus = 'loading' | 'ready' | 'error'

export function useCloudSync(calendarId: string): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>(firebaseEnabled ? 'loading' : 'ready')

  useEffect(() => {
    if (!db) return
    const ref = doc(db, 'calendars', calendarId)
    let pending: Record<string, string> = {}
    let timer: number | undefined
    let applying = false
    let alive = true

    const flush = () => {
      window.clearTimeout(timer)
      if (!Object.keys(pending).length) return
      const data = pending
      pending = {}
      setDoc(ref, { data, updatedAt: serverTimestamp() }, { merge: true }).catch((e) => console.warn('Kunde inte spara i molnet', e))
    }

    // Send every change to a synced key of this calendar up to the cloud, a moment after it happens.
    const stopListening = onWrite((key, value) => {
      if (applying) return
      const [name, id] = key.split(':')
      if (id !== calendarId || !(SYNCED as readonly string[]).includes(name)) return
      pending[name] = value
      window.clearTimeout(timer)
      timer = window.setTimeout(flush, DELAY_MS)
    })
    const onHide = () => document.visibilityState === 'hidden' && flush()
    document.addEventListener('visibilitychange', onHide)

    getDoc(ref)
      .then((snap) => {
        if (!alive) return
        const saved = (snap.exists() ? snap.get('data') : null) as Record<string, unknown> | null
        if (saved) {
          applying = true
          for (const name of SYNCED) if (typeof saved[name] === 'string') writeString(`${name}:${calendarId}`, saved[name] as string)
          applying = false
          // Every saved value listens for 'storage' events, so this refreshes what is on screen.
          window.dispatchEvent(new StorageEvent('storage'))
        } else {
          // First time in the cloud: upload what this browser already has.
          for (const name of SYNCED) {
            const value = readString(`${name}:${calendarId}`)
            if (value !== null) pending[name] = value
          }
          flush()
        }
        setStatus('ready')
      })
      .catch((e) => {
        console.warn('Kunde inte hämta från molnet', e)
        if (alive) setStatus('error')
      })

    return () => {
      alive = false
      flush()
      stopListening()
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [calendarId])

  return status
}
