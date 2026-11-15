import { collection, doc, getDoc, limit, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore'
import { SCORE_GAMES, type ScoreGameId } from '../types'
import { db } from './firebase'
import { readString, writeString } from './storage'

// Highscore lists, one per game, with each player's best score. With Firebase they are shared by everyone
// (highscores/<game>/players/<playerId>); without it they live in this browser only.
export type HighScore = { name: string; score: number; date: number }

const LOCAL_EVENT = 'highscores-changed'
const MAX_KEPT = 50
const TOP = 10
const keyFor = (game: ScoreGameId) => `highscores:${game}`
const cleanName = (name: string) => name.trim().slice(0, 16) || 'Anonym'

const isHighScore = (v: unknown): v is HighScore =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as HighScore).name === 'string' &&
  typeof (v as HighScore).score === 'number' &&
  typeof (v as HighScore).date === 'number'

function readLocal(game: ScoreGameId): HighScore[] {
  const raw = readString(keyFor(game))
  if (!raw) return []
  try {
    const value = JSON.parse(raw)
    return Array.isArray(value) ? value.filter(isHighScore) : []
  } catch {
    return []
  }
}
const topLocal = (game: ScoreGameId) => readLocal(game).sort((a, b) => b.score - a.score).slice(0, TOP)

// Calls `onChange` with the top of the list now and whenever it changes. Returns a function that stops listening.
export function subscribeHighScores(game: ScoreGameId, onChange: (scores: HighScore[]) => void): () => void {
  if (db) {
    const q = query(collection(db, 'highscores', game, 'players'), orderBy('score', 'desc'), limit(TOP))
    return onSnapshot(
      q,
      (snap) => onChange(snap.docs.map((d) => d.data()).filter(isHighScore)),
      (e) => console.warn('Kunde inte läsa highscore', e),
    )
  }
  const load = () => onChange(topLocal(game))
  load()
  window.addEventListener(LOCAL_EVENT, load)
  return () => window.removeEventListener(LOCAL_EVENT, load)
}

// The player's own best score (0 if none yet).
export async function getPlayerBest(game: ScoreGameId, playerId: string, name: string): Promise<number> {
  if (db) {
    const snap = await getDoc(doc(db, 'highscores', game, 'players', playerId))
    return snap.exists() ? Number(snap.get('score')) || 0 : 0
  }
  return readLocal(game).find((s) => s.name.toLowerCase() === cleanName(name).toLowerCase())?.score ?? 0
}

// Saves a score, but only if it beats the player's best.
export async function addHighScore(game: ScoreGameId, playerId: string, name: string, score: number): Promise<void> {
  const entry: HighScore = { name: cleanName(name), score: Math.round(score), date: Date.now() }
  if (db) {
    const ref = doc(db, 'highscores', game, 'players', playerId)
    const snap = await getDoc(ref)
    if (snap.exists() && Number(snap.get('score')) >= entry.score) return
    await setDoc(ref, entry)
    return
  }
  const scores = readLocal(game)
  const previous = scores.find((s) => s.name.toLowerCase() === entry.name.toLowerCase())
  if (previous && previous.score >= entry.score) return
  const next = [...scores.filter((s) => s !== previous), entry].sort((a, b) => b.score - a.score).slice(0, MAX_KEPT)
  writeString(keyFor(game), JSON.stringify(next))
  window.dispatchEvent(new Event(LOCAL_EVENT))
}

// The player changed their name: update it on their rows in every list, so old scores show the new name.
export async function renameInHighScores(playerId: string, oldName: string, newName: string): Promise<void> {
  const name = cleanName(newName)
  if (db) {
    const database = db
    await Promise.all(
      SCORE_GAMES.map(async (game) => {
        const ref = doc(database, 'highscores', game, 'players', playerId)
        if ((await getDoc(ref)).exists()) await updateDoc(ref, { name })
      }),
    )
    return
  }
  for (const game of SCORE_GAMES) {
    const old = cleanName(oldName).toLowerCase()
    const scores = readLocal(game).map((s) => (s.name.toLowerCase() === old ? { ...s, name } : s))
    writeString(keyFor(game), JSON.stringify(scores))
  }
  window.dispatchEvent(new Event(LOCAL_EVENT))
}
