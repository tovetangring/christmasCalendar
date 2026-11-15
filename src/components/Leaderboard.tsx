import { useEffect, useState } from 'react'
import { subscribeHighScores, type HighScore } from '../lib/highscores'
import type { ScoreGameId } from '../types'

const TITLES: Record<ScoreGameId, string> = {
  penguin: '🐧 Pingvinspelet',
  snowball: '⛄ Snöbollskastet',
}

export function Leaderboard({ gameId }: { gameId: ScoreGameId }) {
  const [scores, setScores] = useState<HighScore[]>([])

  useEffect(() => subscribeHighScores(gameId, setScores), [gameId])

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
