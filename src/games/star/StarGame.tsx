import { useEffect, useRef, useState } from 'react'
import { CandyReward } from '../../components/CandyReward'
import { addDecoration, useTree } from '../../lib/tree'
import { addCandy } from '../../lib/wallet'
import { startStarGame } from './engine'

export function StarGame({ calendarId }: { calendarId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tree = useTree(calendarId)
  const [run, setRun] = useState(0)
  const [lit, setLit] = useState<boolean | null>(null) // null = not won yet

  useEffect(
    () =>
      startStarGame(canvasRef.current!, () => {
        addCandy(calendarId, 1)
        setLit(addDecoration(calendarId, 'star').lit)
      }),
    [run, calendarId],
  )

  return (
    <div>
      <canvas ref={canvasRef} className="game-canvas" />
      {lit !== null && (
        <div className="gameover">
          <p>
            {tree.chopped
              ? '⭐ Stjärnan sitter nu högst upp på din gran!'
              : '⭐ Snyggt! Hugg ner en gran i lucka 4 så kan du sätta upp stjärnan.'}
          </p>
          <CandyReward />
          {lit && <p>✨ Nu är granen fullt pyntad – och den lyser!</p>}
          <button
            onClick={() => {
              setLit(null)
              setRun((r) => r + 1)
            }}
          >
            Spela igen
          </button>
        </div>
      )}
    </div>
  )
}
