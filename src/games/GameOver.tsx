import { useEffect, useRef, type ReactNode } from 'react'
import { addHighScore } from '../lib/highscores'
import type { ScoreGameId } from '../types'
import { CandyReward } from '../components/CandyReward'

// The score is saved automatically under the calendar's player name; nobody types a name.
export function GameOver({
  gameId,
  calendarId,
  player,
  score,
  message,
  extra,
  onAgain,
}: {
  gameId: ScoreGameId
  calendarId: string // whose row in the highscore list
  player: string
  score: number
  message: ReactNode
  extra?: ReactNode // optional extra line, e.g. a find
  onAgain: () => void
}) {
  const saved = useRef(false)

  useEffect(() => {
    if (saved.current) return
    saved.current = true
    addHighScore(gameId, calendarId, player, score).catch((e) => console.warn('Kunde inte spara poängen', e))
  }, [gameId, calendarId, player, score])

  return (
    <div className="gameover">
      <p>{message}</p>
      <p className="hint">Din poäng räknas i highscorelistan som {player}.</p>
      <CandyReward />
      {extra}
      <button onClick={onAgain}>Spela igen</button>
    </div>
  )
}
