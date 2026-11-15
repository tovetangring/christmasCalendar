import { useEffect, useRef, useState } from 'react'
import { GameOver } from '../GameOver'
import { Icon } from '../../components/Icon'
import { giveFish } from '../../lib/items'
import { ICONS } from '../../lib/icons'
import { addCandy } from '../../lib/wallet'
import { getPlayerBest } from '../../lib/highscores'
import { isMuted, setMuted } from '../sound'
import { startPenguinGame, type PenguinController } from './engine'

export function PenguinGame({ player, calendarId }: { player: string; calendarId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<PenguinController | null>(null)
  const bestRef = useRef(0)
  const [run, setRun] = useState(0)
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [foundFish, setFoundFish] = useState(false) // a fish was left on the floor of the room this run
  const [best, setBest] = useState(0) // the player's best score before this run
  const [paused, setPaused] = useState(false)
  const [muted, setMutedState] = useState(isMuted)

  useEffect(() => {
    bestRef.current = best
  }, [best])

  useEffect(() => {
    let alive = true
    getPlayerBest('penguin', calendarId, player)
      .then((score) => alive && setBest(score))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [player, calendarId, run])

  useEffect(() => {
    const game = startPenguinGame(canvasRef.current!, {
      onGameOver: (score) => {
        addCandy(calendarId, 1)
        setFoundFish(giveFish(calendarId))
        setFinalScore(score)
      },
      getBest: () => bestRef.current,
      onPauseChange: setPaused,
    })
    gameRef.current = game
    return () => {
      game.destroy()
      gameRef.current = null
    }
  }, [run, calendarId])

  return (
    <div>
      <canvas ref={canvasRef} className="game-canvas" />
      {finalScore === null && (
        <div className="game-controls">
          <button
            onClick={(e) => {
              gameRef.current?.togglePause()
              e.currentTarget.blur() // so Space jumps again instead of pressing this button
            }}
          >
            {paused ? '▶ Fortsätt' : '⏸ Paus'}
          </button>
          <button
            onClick={(e) => {
              setMuted(!muted)
              setMutedState(!muted)
              e.currentTarget.blur()
            }}
          >
            {muted ? '🔇 Ljud av' : '🔊 Ljud på'}
          </button>
        </div>
      )}
      {finalScore !== null && (
        <GameOver
          key={run}
          gameId="penguin"
          calendarId={calendarId}
          player={player}
          score={finalScore}
          message={
            finalScore > best ? (
              <>
                🏆 Nytt rekord! <strong>{finalScore}</strong> poäng!
              </>
            ) : (
              <>
                Aj, isblock! Du fick <strong>{finalScore}</strong> poäng.
              </>
            )
          }
          extra={
            foundFish && (
              <p className="hint">
                <Icon icon={ICONS.fish} size={16} /> En fisk hoppade upp ur vattnet och ligger nu på golvet i julrummet!
              </p>
            )
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
