import { useEffect, useState } from 'react'
import { getHighScores, HIGHSCORES_CHANGED, type HighScore } from '../lib/highscores'
import type { ScoreGameId } from '../types'

const TITLES: Record<ScoreGameId, string> = {
  penguin: '🐧 Pingvinspelet',
  snowball: '⛄ Snöbollskastet',
}

export function Leaderboard({ gameId }: { gameId: ScoreGameId }) {
  const [scores, setScores] = useState<HighScore[]>([])

  useEffect(() => {
    const load = () => getHighScores(gameId).then(setScores)
    load()
    window.addEventListener(HIGHSCORES_CHANGED, load)
    return () => window.removeEventListener(HIGHSCORES_CHANGED, load)
  }, [gameId])

  return (
    <div className="leaderboard">
      <h3>{TITLES[gameId]}</h3>
      {scores.length === 0 ? (
        <p className="hint">Ingen har spelat än.</p>
      ) : (
        <ol>
          {scores.map((s, i) => (
            <li key={`${s.date}-${i}`}>
              <span>{s.name}</span>
              <strong>{s.score}</strong>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
