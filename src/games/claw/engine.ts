// Claw machine: move the claw, press DROP, and bring a decoration to the chute.
import { ignoreKey } from '../keys'
import { CLAW_DECORATIONS, DECORATIONS, type DecorationId } from '../tree/decorations'

const W = 480
const H = 320
const RAIL_Y = 40
const REST_Y = 70
const PANEL_Y = 284
const CHUTE_X = 48
const CHUTE_BOTTOM = 268
const GRAB_RADIUS = 26
const MIN_X = 34
const MAX_X = W - 34
const BUTTON = { x: W - 132, y: 288, w: 118, h: 26 }

type Prize = { id: DecorationId; x: number; y: number }
type State = 'idle' | 'dropping' | 'closing' | 'rising' | 'carrying' | 'releasing'

export type ClawOptions = {
  getOwned: () => readonly string[]
  onPrize: (id: DecorationId) => void
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export function startClawGame(canvas: HTMLCanvasElement, { getOwned, onPrize }: ClawOptions) {
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.aspectRatio = `${W} / ${H}`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // Decorations you don't have yet are stocked twice, so you rarely get stuck with doubles.
  function makeStock(): Prize[] {
    const owned = getOwned()
    const ids: DecorationId[] = CLAW_DECORATIONS.flatMap((d) => (owned.includes(d.id) ? [d.id] : [d.id, d.id]))
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[ids[i], ids[j]] = [ids[j], ids[i]]
    }
    const left = 110
    const span = W - 40 - left
    return ids.map((id, i) => ({ id, x: left + ((i + 0.5) * span) / ids.length + rand(-4, 4), y: 236 + rand(0, 12) }))
  }

  let prizes = makeStock()
  let state: State = 'idle'
  let clawX = W / 2
  let clawY = REST_Y
  let targetX = clawX
  let dropY = 0
  let closed = 0 // 0 = prongs open, 1 = closed
  let target: Prize | null = null
  let carried: Prize | null = null
  let fall: { y: number; vy: number } | null = null
  let popup: { text: string; age: number } | null = null
  const keys = { left: false, right: false }

  function drop() {
    if (state !== 'idle') return
    let best: Prize | null = null
    for (const p of prizes) {
      if (Math.abs(p.x - clawX) < GRAB_RADIUS && (!best || Math.abs(p.x - clawX) < Math.abs(best.x - clawX))) best = p
    }
    target = best
    dropY = best ? best.y - 16 : 245
    state = 'dropping'
  }

  function update(dt: number) {
    if (popup && (popup.age += dt) > 1.4) popup = null

    if (state === 'idle') {
      if (keys.left) targetX -= 260 * dt
      if (keys.right) targetX += 260 * dt
      targetX = clamp(targetX, MIN_X, MAX_X)
      const step = 260 * dt
      clawX += clamp(targetX - clawX, -step, step)
    } else if (state === 'dropping') {
      clawY += 220 * dt
      if (clawY >= dropY) {
        clawY = dropY
        state = 'closing'
      }
    } else if (state === 'closing') {
      closed = Math.min(1, closed + dt / 0.35)
      if (closed >= 1) {
        if (target) {
          carried = target
          prizes = prizes.filter((p) => p !== target)
        } else {
          popup = { text: 'Bom!', age: 0 }
        }
        state = 'rising'
      }
    } else if (state === 'rising') {
      clawY -= 200 * dt
      if (!carried) closed = Math.max(0, closed - dt / 0.35)
      if (clawY <= REST_Y) {
        clawY = REST_Y
        if (carried) state = 'carrying'
        else {
          closed = 0
          targetX = clawX
          state = 'idle'
        }
      }
    } else if (state === 'carrying') {
      clawX = Math.max(CHUTE_X, clawX - 180 * dt)
      if (clawX <= CHUTE_X) {
        fall = { y: clawY + 20, vy: 0 }
        state = 'releasing'
      }
    } else if (state === 'releasing') {
      closed = Math.max(0, closed - dt / 0.2)
      fall!.vy += 900 * dt
      fall!.y += fall!.vy * dt
      if (fall!.y >= CHUTE_BOTTOM) {
        const won = carried!
        const label = DECORATIONS.find((d) => d.id === won.id)!
        popup = { text: `${label.emoji} ${label.label}!`, age: 0 }
        onPrize(won.id)
        carried = null
        fall = null
        targetX = clawX
        state = 'idle'
        if (prizes.length < 4) prizes = makeStock()
      }
    }
  }

  function emoji(char: string, x: number, y: number, size: number) {
    ctx.font = `${size}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fff'
    ctx.fillText(char, x, y)
  }
  const emojiFor = (id: DecorationId) => DECORATIONS.find((d) => d.id === id)!.emoji

  function draw() {
    // Machine interior
    const bg = ctx.createLinearGradient(0, 0, 0, PANEL_Y)
    bg.addColorStop(0, '#2b2f55')
    bg.addColorStop(1, '#43306b')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#1b1d38'
    ctx.fillRect(0, 262, W, PANEL_Y - 262)

    // Chute
    ctx.fillStyle = '#0d0e1f'
    ctx.fillRect(14, 232, 68, 40)
    ctx.strokeStyle = '#f4d58d'
    ctx.lineWidth = 2
    ctx.strokeRect(14, 232, 68, 40)
    ctx.fillStyle = '#f4d58d'
    ctx.font = 'bold 11px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('LUCKA', 48, 226)

    // Rail
    ctx.strokeStyle = '#8a8fb0'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(10, RAIL_Y)
    ctx.lineTo(W - 10, RAIL_Y)
    ctx.stroke()

    // Prizes
    for (const p of [...prizes].sort((a, b) => a.y - b.y)) emoji(emojiFor(p.id), p.x, p.y, 30)

    // Rope + claw
    ctx.strokeStyle = '#c9cde6'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(clawX, RAIL_Y)
    ctx.lineTo(clawX, clawY)
    ctx.stroke()
    ctx.fillStyle = '#c9cde6'
    ctx.fillRect(clawX - 14, RAIL_Y - 8, 28, 16)
    const angle = 0.7 - closed * 0.55
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    for (const d of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(clawX, clawY)
      ctx.lineTo(clawX + d * Math.sin(angle) * 28, clawY + Math.cos(angle) * 28)
      ctx.stroke()
    }
    if (carried) emoji(emojiFor(carried.id), clawX, clawY + 22, 30)
    if (fall) emoji(emojiFor(carried!.id), CHUTE_X, fall.y, 30)

    // Glass frame on top of everything inside the machine
    ctx.strokeStyle = 'rgba(180,220,255,0.7)'
    ctx.lineWidth = 6
    ctx.strokeRect(3, 3, W - 6, PANEL_Y - 3)

    if (popup) {
      ctx.globalAlpha = Math.min(1, 2 - popup.age * 1.4)
      ctx.font = 'bold 26px Georgia, serif'
      ctx.fillStyle = '#f4d58d'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(popup.text, W / 2, 150 - popup.age * 20)
      ctx.globalAlpha = 1
    }

    // Control panel
    ctx.fillStyle = '#12132a'
    ctx.fillRect(0, PANEL_Y, W, H - PANEL_Y)
    ctx.fillStyle = '#aab'
    ctx.font = '13px Georgia, serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('Dra eller ← → för att flytta klon', 14, BUTTON.y + BUTTON.h / 2)
    ctx.fillStyle = state === 'idle' ? '#c0392b' : '#6b3a36'
    ctx.beginPath()
    ctx.roundRect(BUTTON.x, BUTTON.y, BUTTON.w, BUTTON.h, 8)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('SLÄPP ▼', BUTTON.x + BUTTON.w / 2, BUTTON.y + BUTTON.h / 2)
  }

  let raf = 0
  let last = performance.now()
  function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    update(dt)
    draw()
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  const toGame = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    return { x: ((e.clientX - rect.left) * W) / rect.width, y: ((e.clientY - rect.top) * H) / rect.height }
  }
  const onDown = (e: PointerEvent) => {
    const { x, y } = toGame(e)
    if (x >= BUTTON.x && x <= BUTTON.x + BUTTON.w && y >= BUTTON.y && y <= BUTTON.y + BUTTON.h) drop()
    else if (y < PANEL_Y) targetX = clamp(x, MIN_X, MAX_X)
  }
  const onMove = (e: PointerEvent) => {
    const { x, y } = toGame(e)
    if (y < PANEL_Y) targetX = clamp(x, MIN_X, MAX_X)
  }
  const onKeyDown = (e: KeyboardEvent) => {
    if (ignoreKey(e)) return
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true
    else if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowDown') drop()
    else return
    e.preventDefault()
  }
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false
  }
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  return () => {
    cancelAnimationFrame(raf)
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointermove', onMove)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
  }
}
