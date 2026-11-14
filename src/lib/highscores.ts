import type { ScoreGameId } from '../types'
import { readString, writeString } from './storage'

// Async on purpose: swap the localStorage body for a Firebase/Supabase call to make the lists shared.
export type HighScore = { name: string; score: number; date: number }

export const HIGHSCORES_CHANGED = 'highscores-changed'
const MAX_KEPT = 50
const keyFor = (game: ScoreGameId) => `highscores:${game}`

const isHighScore = (v: unknown): v is HighScore =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as HighScore).name === 'string' &&
  typeof (v as HighScore).score === 'number' &&
  typeof (v as HighScore).date === 'number'

function read(game: ScoreGameId): HighScore[] {
  const raw = readString(keyFor(game))
  if (!raw) return []
  try {
    const value = JSON.parse(raw)
    return Array.isArray(value) ? value.filter(isHighScore) : []
  } catch {
    return []
  }
}

export async function getHighScores(game: ScoreGameId, limit = 10): Promise<HighScore[]> {
  return read(game).sort((a, b) => b.score - a.score).slice(0, limit)
}

// Each player keeps only their best score per game.
export async function addHighScore(game: ScoreGameId, name: string, score: number): Promise<void> {
  const cleanName = name.trim().slice(0, 16) || 'Anonym'
  const scores = read(game)
  const previous = scores.find((s) => s.name.toLowerCase() === cleanName.toLowerCase())
  if (previous && previous.score >= score) return
  const next = [...scores.filter((s) => s !== previous), { name: cleanName, score, date: Date.now() }]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_KEPT)
  writeString(keyFor(game), JSON.stringify(next))
  window.dispatchEvent(new Event(HIGHSCORES_CHANGED))
}
