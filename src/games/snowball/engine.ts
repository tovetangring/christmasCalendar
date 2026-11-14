// Slingshot game (side view): drag back and release to throw snowballs at elves and Santa. Hitting kids costs points.
const W = 480
const H = 320
const GROUND_Y = 255 // where the targets' feet are
const ANCHOR = { x: 75, y: 200 } // slingshot fork, on the left; balls fly to the right
const MAX_PULL = 60
const POWER = 11
const GRAVITY = 650
const DURATION = 30
const RELOAD = 0.4

type Kind = 'elf' | 'kid' | 'santa'
type Target = { kind: Kind; x: number; y: number; vx: number; rx: number; ry: number; seed: number }
type Ball = { x: number; y: number; vx: number; vy: number; trail: { x: number; y: number }[] }
type Popup = { x: number; y: number; text: string; color: string; age: number }

const POINTS: Record<Kind, number> = { elf: 10, kid: -15, santa: 30 }
const rand = (min: number, max: number) => min + Math.random() * (max - min)

export function startSnowballGame(canvas: HTMLCanvasElement, onGameOver: (score: number) => void) {
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.aspectRatio = `${W} / ${H}`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  let phase: 'ready' | 'playing' | 'over' = 'ready'
  let time = 0
  let score = 0
  let reload = 0
  let targets: Target[] = []
  let balls: Ball[] = []
  let popups: Popup[] = []
  let spawnTimer = 0.4
  let santaTimer = 4
  // While dragging: where the pointer started and where it is now (game coordinates).
  let drag: { sx: number; sy: number; cx: number; cy: number } | null = null

  const santaImg = new Image()
  santaImg.src = `${import.meta.env.BASE_URL}santaSleigh-small.png`

  const snow = Array.from({ length: 40 }, () => ({ x: rand(0, W), y: rand(0, H), s: rand(10, 30) }))

  function pull() {
    if (!drag) return null
    let dx = drag.sx - drag.cx
    let dy = drag.sy - drag.cy
    const len = Math.hypot(dx, dy)
    if (len > MAX_PULL) {
      dx = (dx / len) * MAX_PULL
      dy = (dy / len) * MAX_PULL
    }
    return { dx, dy, len: Math.min(len, MAX_PULL) }
  }

  function spawn() {
    const fromLeft = Math.random() < 0.5
    const roll = Math.random()
    const kind: Kind = roll < 0.65 ? 'elf' : 'kid'
    const speed = kind === 'elf' ? rand(90, 160) : rand(55, 90)
    targets.push({
      kind,
      x: fromLeft ? -30 : W + 30,
      y: GROUND_Y - 20,
      vx: fromLeft ? speed : -speed,
      rx: kind === 'elf' ? 18 : 20,
      ry: kind === 'elf' ? 18 : 20,
      seed: rand(0, 10),
    })
  }

  function spawnSanta() {
    const fromLeft = Math.random() < 0.5
    const speed = rand(110, 150)
    targets.push({
      kind: 'santa',
      x: fromLeft ? -40 : W + 40,
      y: rand(45, 95),
      vx: fromLeft ? speed : -speed,
      rx: 50,
      ry: 26,
      seed: 0,
    })
  }

  function update(dt: number) {
    time += dt
    reload = Math.max(0, reload - dt)

    spawnTimer -= dt
    if (spawnTimer <= 0) {
      spawn()
      spawnTimer = rand(0.6, 1.2)
    }
    santaTimer -= dt
    if (santaTimer <= 0) {
      spawnSanta()
      santaTimer = rand(7, 10)
    }

    for (const t of targets) t.x += t.vx * dt
    targets = targets.filter((t) => t.x > -60 && t.x < W + 60)

    for (const b of balls) {
      b.trail.push({ x: b.x, y: b.y })
      if (b.trail.length > 14) b.trail.shift()
      b.vy += GRAVITY * dt
      b.x += b.vx * dt
      b.y += b.vy * dt
    }
    // Balls that reach the ground or leave the screen are gone.
    balls = balls.filter((b) => !(b.y > GROUND_Y + 8 && b.vy > 0) && b.y > -200 && b.x > -20 && b.x < W + 20)

    balls = balls.filter((b) => {
      const hit = targets.find((t) => ((b.x - t.x) / (t.rx + 6)) ** 2 + ((b.y - t.y) / (t.ry + 6)) ** 2 < 1)
      if (!hit) return true
      const pts = POINTS[hit.kind]
      score += pts
      popups.push({ x: hit.x, y: hit.y - 20, text: pts > 0 ? `+${pts}` : `${pts}`, color: pts > 0 ? '#fff' : '#ff6b5e', age: 0 })
      targets = targets.filter((t) => t !== hit)
      return false
    })
    popups = popups.filter((p) => (p.age += dt) < 0.8)

    if (time >= DURATION) phase = 'over'
  }

  function drawElf(t: Target) {
    const dir = Math.sign(t.vx)
    const step = Math.sin(time * 14 + t.seed)
    const bob = Math.abs(step) * 2
    const foot = GROUND_Y - bob
    ctx.fillStyle = '#4a3b30'
    ctx.fillRect(t.x - 5 + step * 3, foot - 8, 4, 8)
    ctx.fillRect(t.x + 1 - step * 3, foot - 8, 4, 8)
    ctx.fillStyle = '#7a7f8a'
    ctx.fillRect(t.x - 8, foot - 22, 16, 15)
    ctx.fillStyle = '#f5cfa0'
    ctx.beginPath()
    ctx.arc(t.x, foot - 28, 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(t.x, foot - 27, 7, 0, Math.PI)
    ctx.fill()
    ctx.fillStyle = '#d02b2b'
    ctx.beginPath()
    ctx.moveTo(t.x - 9, foot - 32)
    ctx.lineTo(t.x + 9, foot - 32)
    ctx.lineTo(t.x - dir * 7, foot - 52)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(t.x - dir * 7, foot - 52, 3.5, 0, Math.PI * 2)
    ctx.fill()
  }

  function drawSanta(t: Target) {
    if (!santaImg.complete || santaImg.naturalWidth === 0) return
    const w = 110
    const h = (w * santaImg.naturalHeight) / santaImg.naturalWidth
    ctx.save()
    ctx.translate(t.x, t.y)
    if (t.vx > 0) ctx.scale(-1, 1) // the artwork faces left
    ctx.rotate(-0.14) // nose tilted down in both directions
    ctx.drawImage(santaImg, -w / 2, -h / 2, w, h)
    ctx.restore()
  }

  function emoji(char: string, x: number, y: number, size: number) {
    ctx.font = `${size}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(char, x, y)
  }

  function drawSlingshot(p: ReturnType<typeof pull>) {
    const left = { x: ANCHOR.x - 14, y: ANCHOR.y - 4 }
    const right = { x: ANCHOR.x + 14, y: ANCHOR.y - 4 }
    const pouch = p ? { x: ANCHOR.x - p.dx, y: ANCHOR.y - p.dy } : { x: ANCHOR.x, y: ANCHOR.y }
    ctx.strokeStyle = '#3b2616'
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(ANCHOR.x, GROUND_Y + 20)
    ctx.lineTo(ANCHOR.x, ANCHOR.y + 14)
    ctx.moveTo(ANCHOR.x, ANCHOR.y + 14)
    ctx.lineTo(left.x, left.y)
    ctx.moveTo(ANCHOR.x, ANCHOR.y + 14)
    ctx.lineTo(right.x, right.y)
    ctx.stroke()
    ctx.strokeStyle = '#7a4a2a'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(left.x, left.y)
    ctx.lineTo(pouch.x, pouch.y)
    ctx.lineTo(right.x, right.y)
    ctx.stroke()
    if (reload === 0 || p) {
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(pouch.x, pouch.y, 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  function centeredText(text: string, y: number, size: number) {
    ctx.font = `bold ${size}px Georgia, serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#fff'
    ctx.fillText(text, W / 2, y)
  }

  function draw() {
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
    sky.addColorStop(0, '#14204a')
    sky.addColorStop(1, '#6b7fb8')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, GROUND_Y)
    ctx.fillStyle = '#eef4fb'
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y)

    ctx.fillStyle = '#fff'
    emoji('🌙', W - 50, 40, 36)
    for (const x of [170, 260, 350, 440]) emoji('🎄', x, GROUND_Y - 18, 54)
    for (const f of snow) {
      f.y = (f.y + f.s * 0.016) % H
      ctx.globalAlpha = 0.7
      ctx.fillRect(f.x, f.y, 2, 2)
    }
    ctx.globalAlpha = 1

    for (const t of targets) {
      if (t.kind === 'elf') drawElf(t)
      else if (t.kind === 'kid') emoji('🧒', t.x, t.y, 36)
      else {
        drawSanta(t)
      }
    }

    const p = pull()
    if (p && p.len > 8) {
      // Dotted preview of where the snowball will go.
      let x = ANCHOR.x - p.dx
      let y = ANCHOR.y - p.dy
      const vx = p.dx * POWER
      let vy = p.dy * POWER
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      for (let i = 0; i < 25; i++) {
        vy += GRAVITY * 0.04
        x += vx * 0.04
        y += vy * 0.04
        ctx.beginPath()
        ctx.arc(x, y, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    drawSlingshot(p)

    for (const b of balls) {
      b.trail.forEach((t, i) => {
        ctx.globalAlpha = (i / b.trail.length) * 0.5
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(t.x, t.y, 3 + (i / b.trail.length) * 3, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1
      ctx.fillStyle = '#fff'
      ctx.strokeStyle = '#7a8fb8'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(b.x, b.y, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    for (const pop of popups) {
      ctx.globalAlpha = 1 - pop.age / 0.8
      ctx.fillStyle = pop.color
      ctx.font = 'bold 20px Georgia, serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(pop.text, pop.x, pop.y - pop.age * 40)
    }
    ctx.globalAlpha = 1

    ctx.font = 'bold 20px Georgia, serif'
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#fff'
    ctx.fillText(`Poäng: ${score}`, 12, 28)
    ctx.textAlign = 'right'
    ctx.fillStyle = DURATION - time < 5 ? '#ff6b5e' : '#fff'
    ctx.fillText(`${Math.max(0, Math.ceil(DURATION - time))} s`, W - 12, 28)

    if (phase === 'ready') {
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(0, 0, W, H)
      centeredText('Tryck för att starta', 120, 26)
      centeredText('Dra bakåt (vänster/ner) och släpp för att kasta', 160, 15)
      centeredText('Träffa tomtenissar (+10) och tomten (+30)', 184, 15)
      centeredText('Skjut inte på barnen (−15)! 30 sekunder.', 208, 15)
    }
  }

  let raf = 0
  let last = performance.now()
  function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    if (phase === 'playing') update(dt)
    draw()
    if (phase === 'over') {
      destroy()
      onGameOver(score)
      return
    }
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  // --- input ---
  const toGame = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    return { x: ((e.clientX - rect.left) * W) / rect.width, y: ((e.clientY - rect.top) * H) / rect.height }
  }
  const onDown = (e: PointerEvent) => {
    if (phase === 'ready') {
      phase = 'playing'
      return
    }
    if (phase !== 'playing' || reload > 0) return
    const { x, y } = toGame(e)
    drag = { sx: x, sy: y, cx: x, cy: y }
    canvas.setPointerCapture(e.pointerId)
  }
  const onMove = (e: PointerEvent) => {
    if (!drag) return
    const { x, y } = toGame(e)
    drag.cx = x
    drag.cy = y
  }
  const onUp = () => {
    const p = pull()
    drag = null
    if (phase !== 'playing' || !p || p.len < 8) return
    balls.push({ x: ANCHOR.x - p.dx, y: ANCHOR.y - p.dy, vx: p.dx * POWER, vy: p.dy * POWER, trail: [] })
    reload = RELOAD
  }
  const onCancel = () => {
    drag = null
  }
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onCancel)

  const destroy = () => {
    cancelAnimationFrame(raf)
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointermove', onMove)
    canvas.removeEventListener('pointerup', onUp)
    canvas.removeEventListener('pointercancel', onCancel)
  }
  return destroy
}
