import { useSyncExternalStore } from 'react'
import { initializeApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase is used when its settings are in .env.local (see .env.example). Without them the calendar runs locally.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseEnabled = Boolean(config.apiKey && config.projectId && config.appId)

const app = firebaseEnabled ? initializeApp(config) : null
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null

// Admins can open every calendar (by code), for testing. Keep in sync with isAdmin() in firestore.rules.
const ADMIN_EMAILS = ['tove.tangring@netlight.com']
export const isAdmin = (user: User | null) => !!user?.email && !!user.emailVerified && ADMIN_EMAILS.includes(user.email)

// The name shown in the calendar and the highscore lists: the first name from Google, or the start of the email.
export function playerName(user: User): string {
  const name = user.displayName?.trim().split(/\s+/)[0] || user.email?.split('@')[0] || 'Spelare'
  return name.slice(0, 16)
}

// --- who is signed in, as a hook ---
type AuthState = { status: 'loading' | 'signedOut' | 'signedIn'; user: User | null }
let state: AuthState = { status: firebaseEnabled ? 'loading' : 'signedOut', user: null }
const listeners = new Set<() => void>()
if (auth) {
  onAuthStateChanged(auth, (user) => {
    state = { status: user ? 'signedIn' : 'signedOut', user }
    listeners.forEach((l) => l())
  })
}
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
export const useAuth = () => useSyncExternalStore(subscribe, () => state)

export async function signIn() {
  if (!auth) return
  const provider = new GoogleAuthProvider()
  try {
    await signInWithPopup(auth, provider)
  } catch (error) {
    const code = (error as { code?: string }).code
    // Some browsers block pop-ups: go via a redirect instead.
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, provider)
    } else if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
      throw error
    }
  }
}

export async function signOut() {
  if (auth) await firebaseSignOut(auth)
}
