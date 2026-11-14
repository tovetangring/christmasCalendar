import { ignoreKey } from '../keys'

// Release the swinging star so it lands exactly on the tip of the tree.
const W = 480
const H = 320
const CX = W / 2
const TIP_Y = 150
const GROUND_Y = 300
const STAR_Y = 62
const AMPLITUDE = 160
const OMEGA = 2.2
const TOLERANCE = 24

type Sparkle = { x: number; y: number; vx: number; vy: number; age: number }

export function startStarGame(canvas: HTMLCanvasElement, onWin: () => void) {
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.aspectRatio = `${W} / ${H}`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  let phase: 'swing' | 'falling' | 'missed' | 'landed' = 'swing'
  let t = 0
  let x = CX
  let y = STAR_Y
  let vx = 0
  let vy = 0
  let missTimer = 0
  let sparkles: Sparkle[] = []
  let clock = 0

  function release() {
    if (phase !== 'swing') return
    phase = 'falling'
    vx = 0
    vy = 0
  }

  function update(dt: number) {
    clock += dt
    sparkles = sparkles.filter((s) => (s.age += dt) < 1.2)
    for (const s of sparkles) {
      s.x += s.vx * dt
      s.y += s.vy * dt
      s.vy += 200 * dt
    }

    if (phase === 'swing') {
      t += dt
      x = CX + AMPLITUDE * Math.sin(OMEGA * t)
      y = STAR_Y
    } else if (phase === 'falling') {
      vy += 900 * dt
      y += vy * dt
      x += vx * dt
      if (vx === 0 && y >= TIP_Y - 14) {
        if (Math.abs(x - CX) <= TOLERANCE) {
          phase = 'landed'
          x = CX
          y = TIP_Y - 14
          for (let i = 0; i < 30; i++) {
            const a = Math.random() * Math.PI * 2
            const v = 60 + Math.random() * 160
            sparkles.push({ x: CX, y: TIP_Y - 14, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, age: 0 })
          }
          onWin()
        } else {
          // Hit the side of the tree: bounce off outwards.
          vx = (x >= CX ? 1 : -1) * 170
        }
      }
      if (phase === 'falling' && y >= GROUND_Y - 12) {
        phase = 'missed'
        missTimer = 0.8
      }
    } else if (phase === 'missed') {
      missTimer -= dt
      if (missTimer <= 0) {
        phase = 'swing'
        y = STAR_Y
      }
    }
  }

  function tier(apexY: number, baseY: number, half: number, color: string) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(CX, apexY)
    ctx.lineTo(CX + half, baseY)
    ctx.lineTo(CX - half, baseY)
    ctx.closePath()
    ctx.fill()
  }

  function draw() {
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
    sky.addColorStop(0, '#14204a')
    sky.addColorStop(1, '#6b7fb8')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#eef4fb'
    ctx.fillRect(0, GROUND_Y - 6, W, H - GROUND_Y + 6)

    ctx.fillStyle = '#6b4423'
    ctx.fillRect(CX - 14, 266, 28, GROUND_Y - 266)
    tier(205, 276, 100, '#1f7a3d')
    tier(178, 246, 76, '#26924a')
    tier(TIP_Y - 4, 216, 52, '#2fa859')

    // Crane rail and hook
    ctx.strokeStyle = '#8a8fb0'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(10, 14)
    ctx.lineTo(W - 10, 14)
    ctx.stroke()
    if (phase === 'swing') {
      ctx.strokeStyle = '#c9cde6'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, 14)
      ctx.lineTo(x, y - 18)
      ctx.stroke()
      // Dotted guide down to the treetop
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      for (let gy = y + 30; gy < TIP_Y - 20; gy += 14) ctx.fillRect(CX - 1, gy, 2, 6)
    }

    if (phase === 'landed') {
      ctx.globalAlpha = 0.5 + 0.2 * Math.sin(clock * 4)
      const glow = ctx.createRadialGradient(CX, TIP_Y - 14, 4, CX, TIP_Y - 14, 70)
      glow.addColorStop(0, '#fff3b0')
      glow.addColorStop(1, 'rgba(255,243,176,0)')
      ctx.fillStyle = glow
      ctx.fillRect(CX - 80, TIP_Y - 94, 160, 160)
      ctx.globalAlpha = 1
    }

    ctx.font = '36px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fff'
    ctx.fillText('⭐', x, y)

    for (const s of sparkles) {
      ctx.globalAlpha = 1 - s.age / 1.2
      ctx.fillStyle = '#fff3b0'
      ctx.fillRect(s.x - 2, s.y - 2, 4, 4)
    }
    ctx.globalAlpha = 1

    ctx.textBaseline = 'alphabetic'
    ctx.font = 'bold 16px Georgia, serif'
    ctx.fillStyle = '#fff'
    if (phase === 'swing') ctx.fillText('Tryck när stjärnan är rakt över toppen!', CX, H - 10)
    else if (phase === 'missed') {
      ctx.font = 'bold 28px Georgia, serif'
      ctx.fillStyle = '#f4d58d'
      ctx.fillText('Bom!', CX, 110)
    } else if (phase === 'landed') {
      ctx.font = 'bold 28px Georgia, serif'
      ctx.fillStyle = '#f4d58d'
      ctx.fillText('Perfekt! ⭐', CX, 110)
    }
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

  const onDown = () => release()
  const onKeyDown = (e: KeyboardEvent) => {
    if (ignoreKey(e)) return
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowDown') {
      release()
      e.preventDefault()
    }
  }
  canvas.addEventListener('pointerdown', onDown)
  window.addEventListener('keydown', onKeyDown)

  return () => {
    cancelAnimationFrame(raf)
    canvas.removeEventListener('pointerdown', onDown)
    window.removeEventListener('keydown', onKeyDown)
  }
}
