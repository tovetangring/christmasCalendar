import { useEffect, useRef, useState } from 'react'
import { GameOver } from '../GameOver'
import { addCandy } from '../../lib/wallet'
import { startSnowballGame } from './engine'

export function SnowballGame({ player, calendarId }: { player: string; calendarId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [run, setRun] = useState(0)
  const [finalScore, setFinalScore] = useState<number | null>(null)

  useEffect(
    () =>
      startSnowballGame(canvasRef.current!, (score) => {
        addCandy(calendarId, 1)
        setFinalScore(score)
      }),
    [run, calendarId],
  )

  return (
    <div>
      <canvas ref={canvasRef} className="game-canvas" />
      {finalScore !== null && (
        <GameOver
          key={run}
          gameId="snowball"
          calendarId={calendarId}
          player={player}
          score={finalScore}
          message={
            <>
              Tiden är slut! Du fick <strong>{finalScore}</strong> poäng.
            </>
          }
          onAgain={() => {
            setFinalScore(null)
            setRun((r) => r + 1)
          }}
        />
      )}
    </div>
  )
}
