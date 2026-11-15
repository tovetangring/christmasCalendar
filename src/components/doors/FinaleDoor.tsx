import { useEffect, useRef, useState } from 'react'
import { findCalendar } from '../../calendars'
import { sounds } from '../../games/sound'
import { getOpenedDoors } from '../../hooks/useOpenedDoors'
import { useMagicSparks } from '../../hooks/useMagicSparks'
import { litCandles } from '../../lib/advent'
import { getItems, giveItem, ITEMS, type ItemId, type Items } from '../../lib/items'
import { BELL_NOTES, MELODY, NOTE_STARTS } from '../../lib/jingle'
import { getTree, type TreeState } from '../../lib/tree'
import { getWrappedGift, type GiftStyle } from '../../lib/wrappedGift'
import { MagicSparks } from '../MagicSparks'
import { Room } from '../Room'

// Door 24, Christmas Eve: a look back at the room as it was on 1 December (empty and cold), then everything you
// got fades in, door by door, until the room is warm and cosy with music, a purring cat and every light twinkling.
// Then there's a knock: Santa comes in, eats the cookies, and leaves a golden present with a greeting for you.
type Snapshot = { items: Items; tree: TreeState; candles: boolean[]; wrapped: GiftStyle | null }
type Step = { text: string; apply: (s: Snapshot) => void }
type Phase = 'intro' | 'building' | 'warm' | 'knock' | 'santa' | 'present' | 'card'

const STEP_MS = 1300

const noItems = () => Object.fromEntries(ITEMS.map((id) => [id, id === 'unwrapped'])) as Items

// The steps of the look back, in door order; only things you actually got are included.
function buildSteps(calendarId: string): { steps: Step[]; final: Snapshot } {
  const items = getItems(calendarId)
  const tree = getTree(calendarId)
  const calendar = findCalendar(calendarId)
  const candles = calendar ? litCandles(calendar.doors, getOpenedDoors(calendarId)) : [true, false, false, false]
  const wrapped = getWrappedGift(calendarId)
  const steps: Step[] = []
  const item = (id: ItemId, text: string) => {
    if (items[id]) steps.push({ text, apply: (s) => (s.items[id] = true) })
  }
  const candle = (i: number, text: string) => {
    if (candles[i]) steps.push({ text, apply: (s) => (s.candles[i] = true) })
  }
  item('rug', 'Lucka 2: en mjuk matta')
  item('treeStand', 'Lucka 3: grannens julgransfot')
  if (tree.chopped) steps.push({ text: 'Lucka 4: granen du högg i skogen', apply: (s) => (s.tree.chopped = true) })
  if (items.fish || items.cat) steps.push({ text: 'Lucka 5: en fisk från pingvinspelet', apply: (s) => (s.items.fish = true) })
  candle(1, 'Lucka 6: andra adventsljuset')
  item('snowman', 'Lucka 7: snögubben utanför fönstret')
  item('armchair', 'Lucka 8: fåtöljen med korsordet')
  item('cookies', 'Lucka 9: kakor till tomten')
  const clawPynt = tree.decorations.filter((d) => d !== 'star')
  if (clawPynt.length) steps.push({ text: 'Lucka 10: pynt till granen', apply: (s) => (s.tree.decorations = [...clawPynt]) })
  item('gramophone', 'Lucka 11: grammofonen')
  item('wreath', 'Lucka 12: kransen på dörren')
  candle(2, 'Lucka 13: tredje adventsljuset')
  item('lussekatter', 'Lucka 13: lussekatter från luciatåget')
  item('treeGarland', 'Lucka 15: glittergirlangen')
  if (items.cat) steps.push({ text: 'Lucka 16: katten som åt fisken – och stannade', apply: (s) => ((s.items.fish = false), (s.items.cat = true)) })
  if (tree.packages) steps.push({ text: 'Lucka 17: paket från lyckohjulet', apply: (s) => (s.tree.packages = tree.packages) })
  item('curtains', 'Lucka 19: julgardinerna')
  candle(3, 'Lucka 20: fjärde adventsljuset')
  item('garland', 'Lucka 21: girlangen i taket')
  if (wrapped) steps.push({ text: 'Lucka 22: julklappen du slog in', apply: (s) => (s.wrapped = wrapped) })
  if (tree.decorations.includes('star')) steps.push({ text: 'Lucka 23: stjärnan i toppen', apply: (s) => (s.tree.decorations = [...s.tree.decorations, 'star']) })
  return { steps, final: { items: { ...items, santaGift: false }, tree, candles, wrapped } }
}

function snapshotAt(steps: Step[], count: number): Snapshot {
  const s: Snapshot = { items: noItems(), tree: { chopped: false, decorations: [], packages: 0 }, candles: [true, false, false, false], wrapped: null }
  steps.slice(0, count).forEach((step) => step.apply(s))
  return s
}

function playMelody() {
  MELODY.forEach((bell, i) => sounds.bell(BELL_NOTES[bell].freq, NOTE_STARTS[i]))
}

export function FinaleDoor({ calendarId, player }: { calendarId: string; player: string }) {
  const [{ steps, final }] = useState(() => buildSteps(calendarId))
  const [alreadyVisited] = useState(() => getItems(calendarId).santaGift)
  const [phase, setPhase] = useState<Phase>('intro')
  const [shown, setShown] = useState(0) // how many steps are shown
  const [caption, setCaption] = useState('Så här såg det ut när december började…')
  const [santaEaten, setSantaEaten] = useState(false)
  const [santaGift, setSantaGift] = useState(false)
  const { sparks, add: addSpark, remove: removeSpark } = useMagicSparks()
  const timers = useRef<number[]>([])
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((t) => window.clearTimeout(t))
  }, [])
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms))
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  // Santa's visit, after the room has had a moment to glow.
  function santaVisit() {
    setPhase('knock')
    setCaption('Knack, knack… vem kan det vara?')
    sounds.knock()
    later(1900, () => {
      setPhase('santa')
      setCaption('Ho ho ho! God jul!')
      sounds.magic()
    })
    later(4300, () => {
      if (final.items.cookies) {
        setSantaEaten(true)
        setCaption('Tomten smakar på kakorna och dricker upp mjölken… mums!')
      } else {
        setCaption('Tomten värmer sig en stund vid brasan.')
      }
    })
    later(7000, () => {
      setSantaGift(true)
      setCaption('Han lägger ett glänsande guldpaket under granen och vinkar hejdå…')
    })
    later(9600, () => {
      setPhase('present')
      setCaption('Tomten har lämnat ett paket till dig!')
    })
  }

  function warm() {
    setPhase('warm')
    setShown(steps.length)
    setCaption('…och så här varmt och fint är det nu. God jul! ✨')
    playMelody()
    later(NOTE_STARTS[NOTE_STARTS.length - 1] * 1000 + 900, playMelody)
    later(700, () => sounds.purr())
    later(7600, santaVisit)
  }

  // Run the look back: wait on the empty room, then add one thing at a time.
  useEffect(() => {
    later(2400, () => setPhase('building'))
  }, [])
  useEffect(() => {
    if (phase !== 'building') return
    if (shown >= steps.length) {
      later(900, warm)
      return
    }
    if (shown > 0) sounds.cut()
    later(STEP_MS, () => setShown((n) => n + 1))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, shown])

  function openPresent() {
    setPhase('card')
    setCaption('')
    giveItem(calendarId, 'santaGift')
    sounds.magic()
    for (let i = 0; i < 50; i++) {
      const a = Math.random() * Math.PI * 2
      addSpark(280 + Math.cos(a) * 80, 260 + Math.sin(a) * 70, Math.cos(a) * 90, Math.sin(a) * 70 - 20)
    }
  }

  function skipToEnd() {
    clearTimers()
    setShown(steps.length)
    setSantaEaten(!!final.items.cookies)
    setSantaGift(true)
    setPhase('present')
    setCaption('Tomten har lämnat ett paket till dig!')
  }

  function replay() {
    clearTimers()
    setShown(0)
    setSantaEaten(false)
    setSantaGift(false)
    setCaption('Så här såg det ut när december började…')
    setPhase('intro')
    later(2400, () => setPhase('building'))
  }

  const lookingBack = phase === 'intro' || phase === 'building'
  const snap = lookingBack ? snapshotAt(steps, shown) : final
  const celebrate = !lookingBack
  const showGift = santaGift || phase === 'present' || phase === 'card'
  const items: Items = { ...snap.items, santaGift: showGift }

  return (
    <div className="finale-door">
      <div className={`finale-room ${lookingBack && shown === 0 ? 'cold' : ''} ${lookingBack ? 'looking-back' : 'warm'}`}>
        <Room
          tree={snap.tree}
          showProgress={false}
          items={items}
          cookiesEaten={santaEaten}
          candles={celebrate ? [true, true, true, true] : snap.candles}
          wrappedGift={snap.wrapped}
          onUnwrap={() => {}}
          celebrate={celebrate}
          santa={phase === 'knock' ? 'knock' : phase === 'santa' ? 'door' : null}
        />
        <div className="finale-chill" style={{ opacity: lookingBack ? Math.max(0, 0.55 - (shown / Math.max(1, steps.length)) * 0.55) : 0 }} />
        <svg className="finale-sparks" viewBox="0 0 560 520" aria-hidden>
          <MagicSparks sparks={sparks} onDone={removeSpark} />
        </svg>
        {phase === 'card' && (
          <div className="santa-card" role="dialog" aria-label="Ett kort från tomten">
            <p className="santa-card-title">God Jul, {player}!</p>
            <p>
              Tack för att du har följt kalendern hela vägen, lucka för lucka. Rummet blev så varmt och fint – det är det
              mysigaste jag sett på hela min resa i natt!
            </p>
            <p>Hoppas du får en riktigt fin jul. Ho ho ho!</p>
            <p className="santa-card-sign">– Tomten</p>
          </div>
        )}
      </div>

      <p className="game-status finale-caption" aria-live="polite">
        {phase === 'building' && shown > 0 ? steps[shown - 1].text : caption}
        {phase === 'card' && (alreadyVisited ? 'Tomtens paket står kvar under granen ✨' : 'Tomtens guldpaket står nu kvar under granen i julrummet ✨')}
      </p>
      {phase === 'present' && <button onClick={openPresent}>🎁 Öppna tomtens paket</button>}
      {phase !== 'present' && phase !== 'card' && <button onClick={skipToEnd}>Hoppa till slutet</button>}
      {phase === 'card' && <button onClick={replay}>Se återblicken igen</button>}
    </div>
  )
}
