import { auth, firebaseEnabled, isAdmin } from './firebase'

// Add ?debug to the URL (e.g. /?debug#/c/ivar) to unlock every door while testing.
// With Firebase only the admin account can use it; without Firebase (local development) anyone can.
export function isDebug(): boolean {
  if (!new URLSearchParams(window.location.search).has('debug')) return false
  return !firebaseEnabled || isAdmin(auth?.currentUser ?? null)
}

export function isUnlocked(day: number, now = new Date()): boolean {
  if (isDebug()) return true
  // Month 11 is December; doors open on or after their date.
  return now.getMonth() === 11 ? now.getDate() >= day : false
}
