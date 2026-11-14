import { useEffect, useRef, useState } from 'react'
import { CandyReward } from '../../components/CandyReward'
import { addDecoration, getTree, isLit, useTree } from '../../lib/tree'
import { addCandy } from '../../lib/wallet'
import { CLAW_DECORATIONS, DECORATIONS, type DecorationId } from '../tree/decorations'
import { startClawGame } from './engine'

type Last = { id: DecorationId; isNew: boolean }

export function ClawGame({ calendarId }: { calendarId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tree = useTree(calendarId)
  const [last, setLast] = useState<Last | null>(null)

  useEffect(
    () =>
      startClawGame(canvasRef.current!, {
        getOwned: () => getTree(calendarId).decorations,
        onPrize: (id) => {
          addCandy(calendarId, 1)
          setLast({ id, isNew: addDecoration(calendarId, id).isNew })
        },
      }),
    [calendarId],
  )

  const label = last ? DECORATIONS.find((d) => d.id === last.id)!.label : ''

  return (
    <div>
      <canvas ref={canvasRef} className="game-canvas" />
      <p className="collected" aria-label="Insamlat pynt">
        {CLAW_DECORATIONS.map((d) => (tree.decorations.includes(d.id) ? d.emoji : '❔')).join(' ')}
      </p>
      <p className="game-status">
        {isLit(tree) ? (
          '✨ Du har allt pynt! Granen lyser nu för alltid.'
        ) : CLAW_DECORATIONS.every((d) => tree.decorations.includes(d.id)) ? (
          'Du har allt pynt härifrån!'
        ) : !last ? (
          'Fånga pynt till din gran!'
        ) : last.isNew ? (
          <>
            Du fick {label}!{' '}
            {tree.chopped ? 'Den hänger nu på din gran.' : 'Hugg ner en gran i lucka 4 så kan du hänga upp den!'}
          </>
        ) : (
          'Det pyntet hade du redan – försök igen!'
        )}
      </p>
      {last && <CandyReward />}
    </div>
  )
}
