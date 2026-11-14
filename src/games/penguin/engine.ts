import { ignoreKey } from '../keys'
import { sounds } from '../sound'

// Side-view penguin game drawn on a canvas. Steer with mouse/finger/W-S/arrow keys, tap or Space to jump
// (tap again in the air to double jump, S/down to dive), P to pause.
const W = 480
const H = 320
const WATER_Y = 100
const MIN_Y = WATER_Y + 24
const MAX_Y = H - 20
const PX = 90
const GRAVITY = 1400
const JUMP_PEAK = 75 // how far above the surface a jump reaches, regardless of depth
const AIR_JUMP_PEAK = 60 // the second jump, measured from where you are
const DIVE_GRAVITY = 2.6 // gravity multiplier while holding S/down in the air
const SURFACE_Y = WATER_Y + 4 // where the penguin re-enters the water
const SWIM_MAX = 420 // top vertical speed
const KEY_ACCEL = 1500 // how fast W/S speed the penguin up
const ICE_FRICTION = 1.6 // per second; lower = slides further after letting go
const FOLLOW_STIFFNESS = 60 // mouse/finger: how hard the penguin is pulled toward the pointer
const FOLLOW_DAMPING = 11 // ...and how much that is slowed down (lower = more wobble)
const BASE_SPEED = 170 // world speed at the start...
const MAX_SPEED = 550 // ...which creeps up towards this the longer you survive
const SPEED_RAMP = 55 // seconds; bigger = slower ramp
const SLOW_FACTOR = 0.55 // world speed while the snowflake power-up is active
const POWER_TIME = { slow: 5, magnet: 8 } // seconds
const MAGNET_RANGE = 150
const GOLDEN_CHANCE = 0.12
const MILESTONES: [number, string][] = [
  [30, 'Snabbt!'],
  [60, 'Rasande fart!'],
  [90, 'Legendariskt!'],
]

type Fish = { x: number; y: number; golden: boolean }
type Gull = { x: number; y: number }
type Ice = { x: number; y: number; w: number; h: number; wall?: boolean; bob?: { base: number; amp: number; phase: number } }
type PowerKind = 'slow' | 'magnet' | 'shield'
type Item = { x: number; y: number; kind: PowerKind }
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number }
type Popup = { x: number; y: number; text: string; age: number }
type Dot = { x: number; y: number; r: number }
type Streak = { x: number; y: number; len: number }

const POWER_EMOJI: Record<PowerKind, string> = { slow: '❄️', magnet: '🧲', shield: '🛡️' }
const POWER_LABEL: Record<PowerKind, string> = { slow: 'Tidsbroms!', magnet: 'Magnet!', shield: 'Skydd!' }

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
const rgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const mix = (from: string, to: string, t: number) => {
  const [r1, g1, b1] = rgb(from)
  const [r2, g2, b2] = rgb(to)
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`
}

export type PenguinOptions = {
  onGameOver: (score: number) => void
  getBest: () => number // the player's best score so far (0 if none)
  onPauseChange: (paused: boolean) => void
}
export type PenguinController = { destroy: () => void; togglePause: () => void }

export function startPenguinGame(canvas: HTMLCanvasElement, { onGameOver, getBest, onPauseChange }: PenguinOptions): PenguinController {
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.aspectRatio = `${W} / ${H}`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  let phase: 'ready' | 'playing' | 'dying' | 'over' = 'ready'
  let paused = false
  let y = (MIN_Y + MAX_Y) / 2
  let targetY = y
  let swimV = 0 // vertical swimming speed (momentum)
  let mode: 'pointer' | 'keys' = 'pointer'
  let vy = 0
  let airborne = false
  let airJumps = 0
  let score = 0
  let time = 0
  let speed = BASE_SPEED
  let wave = 0
  let surviveAcc = 0
  let combo = 0
  let slowT = 0
  let magnetT = 0
  let shield = false
  let shake = 0
  let dyingT = 0
  let recordShown = false
  let banner: { text: string; age: number } | null = null
  const milestonesDone = new Set<number>()
  let fish: Fish[] = []
  let gulls: Gull[] = []
  let ice: Ice[] = []
  let items: Item[] = []
  let particles: Particle[] = []
  let popups: Popup[] = []
  let bubbles: Dot[] = []
  let streaks: Streak[] = []
  let fishTimer = 0.5
  let iceTimer = 2
  let gullTimer = 3
  let itemTimer = 10
  let bubbleAcc = 0
  let streakAcc = 0
  const keys = { up: false, down: false }

  const multiplier = () => Math.min(4, 1 + Math.floor(combo / 4))

  function setPaused(value: boolean) {
    paused = value
    onPauseChange(value)
  }

  function showBanner(text: string) {
    banner = { text, age: 0 }
  }

  function addScore(n: number) {
    score += n
    const best = getBest()
    if (!recordShown && best > 0 && score > best) {
      recordShown = true
      showBanner('Nytt rekord! 🏆')
      sounds.milestone()
    }
  }

  function burst(x: number, yy: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const v = rand(60, 220)
      const life = rand(0.4, 0.9)
      particles.push({ x, y: yy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life, color, size: rand(2, 4) })
    }
  }

  function jump() {
    if (phase === 'ready') {
      phase = 'playing'
      return
    }
    if (phase !== 'playing' || paused) return
    if (!airborne) {
      airborne = true
      airJumps = 1
      vy = -Math.sqrt(2 * GRAVITY * (y - WATER_Y + JUMP_PEAK))
      sounds.jump()
    } else if (airJumps > 0) {
      airJumps--
      vy = -Math.sqrt(2 * GRAVITY * AIR_JUMP_PEAK)
      burst(PX, y, '#ffffff', 8)
      sounds.jump()
    }
  }

  function spawnFishRow() {
    if (Math.random() < GOLDEN_CHANCE) {
      fish.push({ x: W + 20, y: rand(MIN_Y, MAX_Y), golden: true })
      return
    }
    const count = Math.floor(rand(1, 5))
    const fy = rand(MIN_Y, MAX_Y)
    for (let i = 0; i < count; i++) fish.push({ x: W + 20 + i * 34, y: fy, golden: false })
  }

  // A wall of ice with a gap to swim through; a trail of fish marks the gap.
  function spawnWall() {
    const gap = Math.max(82, 112 - time * 0.3)
    const top = WATER_Y + 8
    const centre = rand(top + 25 + gap / 2, H - 25 - gap / 2)
    const topH = centre - gap / 2 - top
    const bottomH = H - (centre + gap / 2)
    ice.push({ x: W + 30, y: top + topH / 2, w: 38, h: topH, wall: true })
    ice.push({ x: W + 30, y: H - bottomH / 2, w: 38, h: bottomH, wall: true })
    for (let i = 0; i < 3; i++) fish.push({ x: W + 10 + i * 30, y: centre, golden: false })
  }

  // Returns true if it spawned a wall (which needs more breathing room afterwards).
  function spawnIce(): boolean {
    if (time > 20 && Math.random() < 0.25) {
      spawnWall()
      return true
    }
    const size = rand(36, 54)
    if (time > 10 && Math.random() < 0.3) {
      const amp = 28
      const base = rand(WATER_Y + 12 + size / 2 + amp, H - size / 2 - amp)
      ice.push({ x: W + size, y: base, w: size, h: size, bob: { base, amp, phase: rand(0, Math.PI * 2) } })
    } else {
      ice.push({ x: W + size, y: rand(WATER_Y + 12 + size / 2, H - size / 2), w: size, h: size })
    }
    return false
  }

  function spawnItem() {
    const kind = (['slow', 'magnet', 'shield'] as const)[Math.floor(Math.random() * 3)]
    items.push({ x: W + 20, y: rand(MIN_Y, MAX_Y), kind })
  }

  function updateEffects(dt: number) {
    shake = Math.max(0, shake - dt)
    for (const p of particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 300 * dt
    }
    particles = particles.filter((p) => (p.life -= dt) > 0)
    popups = popups.filter((p) => (p.age += dt) < 0.7)
    if (banner && (banner.age += dt) > 2) banner = null
  }

  function die() {
    phase = 'dying'
    dyingT = 0
    shake = 0.5
    burst(PX, y, '#ffffff', 36)
    burst(PX, y, '#9ee7ff', 20)
    sounds.hit()
  }

  function updateDying(dt: number) {
    dyingT += dt
    updateEffects(dt)
    if (dyingT > 0.8) phase = 'over'
  }

  function update(dt: number) {
    time += dt
    speed = BASE_SPEED + (MAX_SPEED - BASE_SPEED) * (1 - Math.exp(-time / SPEED_RAMP))
    slowT = Math.max(0, slowT - dt)
    magnetT = Math.max(0, magnetT - dt)
    const ws = speed * (slowT > 0 ? SLOW_FACTOR : 1)
    wave += ws * 0.6 * dt
    const speedFactor = (speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED)

    // One point for every second you survive.
    surviveAcc += dt
    while (surviveAcc >= 1) {
      surviveAcc -= 1
      addScore(1)
    }
    for (const [at, text] of MILESTONES) {
      if (time >= at && !milestonesDone.has(at)) {
        milestonesDone.add(at)
        showBanner(text)
        sounds.milestone()
      }
    }

    // Swimming has momentum, like sliding on ice: W/S accelerate and then glide to a stop,
    // and the mouse/finger pulls the penguin along like a slightly wobbly spring.
    const dir = (keys.down ? 1 : 0) - (keys.up ? 1 : 0)
    if (dir !== 0) {
      mode = 'keys'
      swimV += dir * KEY_ACCEL * dt
    } else if (mode === 'keys') {
      swimV *= Math.exp(-ICE_FRICTION * dt)
    } else {
      swimV += (FOLLOW_STIFFNESS * (targetY - y) - FOLLOW_DAMPING * swimV) * dt
    }
    swimV = clamp(swimV, -SWIM_MAX, SWIM_MAX)

    if (airborne) {
      vy += GRAVITY * (keys.down ? DIVE_GRAVITY : 1) * dt
      y += vy * dt
      if (vy > 0 && y >= SURFACE_Y) {
        airborne = false
        y = SURFACE_Y
        swimV = 0
        if (keys.down) burst(PX, SURFACE_Y, '#ffffff', 10) // splash after a dive
      }
    } else {
      y += swimV * dt
      // Soft bounce off the surface and the sea floor.
      if (y < SURFACE_Y) {
        y = SURFACE_Y
        swimV = Math.abs(swimV) * 0.3
      } else if (y > MAX_Y) {
        y = MAX_Y
        swimV = -Math.abs(swimV) * 0.3
      }
    }

    fishTimer -= dt
    if (fishTimer <= 0) {
      spawnFishRow()
      fishTimer = rand(0.7, 1.2)
    }
    iceTimer -= dt
    if (iceTimer <= 0) {
      const wall = spawnIce()
      iceTimer = wall ? rand(1.3, 1.8) : Math.max(0.85, 2.2 - time * 0.02) + rand(0, 0.6)
    }
    gullTimer -= dt
    if (gullTimer <= 0) {
      gulls.push({ x: W + 30, y: rand(WATER_Y - 65, WATER_Y - 30) })
      gullTimer = rand(4, 7)
    }
    itemTimer -= dt
    if (itemTimer <= 0) {
      spawnItem()
      itemTimer = rand(12, 18)
    }

    for (const t of fish) {
      t.x -= ws * dt
      if (magnetT > 0) {
        const d = Math.hypot(PX - t.x, y - t.y)
        if (d < MAGNET_RANGE && d > 1) {
          t.x += ((PX - t.x) / d) * 380 * dt
          t.y += ((y - t.y) / d) * 380 * dt
        }
      }
    }
    for (const b of ice) {
      b.x -= ws * dt
      if (b.bob) b.y = b.bob.base + Math.sin(time * 2.2 + b.bob.phase) * b.bob.amp
    }
    for (const t of gulls) t.x -= ws * 1.3 * dt
    for (const t of items) t.x -= ws * dt

    const fishBefore = fish.length
    fish = fish.filter((t) => t.x > -40)
    if (fish.length < fishBefore) combo = 0 // a fish got away
    ice = ice.filter((b) => b.x > -80)
    gulls = gulls.filter((t) => t.x > -40)
    items = items.filter((t) => t.x > -40)

    fish = fish.filter((t) => {
      if (Math.hypot(t.x - PX, t.y - y) > 24) return true
      const pts = (t.golden ? 5 : 1) * multiplier()
      combo++
      addScore(pts)
      popups.push({ x: t.x, y: t.y, text: `+${pts}`, age: 0 })
      burst(t.x, t.y, t.golden ? '#ffd54a' : '#bfe9ff', t.golden ? 12 : 4)
      if (t.golden) sounds.golden()
      else sounds.eat()
      return false
    })
    gulls = gulls.filter((t) => {
      if (Math.hypot(t.x - PX, t.y - y) > 28) return true
      addScore(5)
      popups.push({ x: t.x, y: t.y, text: '+5', age: 0 })
      burst(t.x, t.y, '#ffffff', 10)
      sounds.gull()
      return false
    })
    items = items.filter((t) => {
      if (Math.hypot(t.x - PX, t.y - y) > 28) return true
      if (t.kind === 'slow') slowT = POWER_TIME.slow
      else if (t.kind === 'magnet') magnetT = POWER_TIME.magnet
      else shield = true
      popups.push({ x: t.x, y: t.y, text: POWER_LABEL[t.kind], age: 0 })
      burst(t.x, t.y, '#ffe27a', 14)
      sounds.power()
      return false
    })
    updateEffects(dt)

    // Ambient motion that makes the speed visible.
    bubbleAcc += dt * (6 + speedFactor * 10)
    while (bubbleAcc >= 1) {
      bubbleAcc -= 1
      bubbles.push({ x: W + 5, y: rand(WATER_Y + 10, H), r: rand(1.5, 4) })
    }
    for (const b of bubbles) {
      b.x -= ws * 0.5 * dt
      b.y -= 18 * dt
    }
    bubbles = bubbles.filter((b) => b.x > -10 && b.y > WATER_Y)
    streakAcc += dt * (2 + speedFactor * 14)
    while (streakAcc >= 1) {
      streakAcc -= 1
      streaks.push({ x: W + 5, y: rand(WATER_Y + 8, H - 4), len: 20 + speedFactor * 40 })
    }
    for (const s of streaks) s.x -= ws * 1.6 * dt
    streaks = streaks.filter((s) => s.x + s.len > 0)

    for (const b of ice) {
      const nearX = clamp(PX, b.x - b.w / 2, b.x + b.w / 2)
      const nearY = clamp(y, b.y - b.h / 2, b.y + b.h / 2)
      if (Math.hypot(PX - nearX, y - nearY) < 11) {
        if (shield) {
          shield = false
          ice = ice.filter((i) => i !== b)
          burst(PX, y, '#9ee7ff', 24)
          shake = 0.25
          popups.push({ x: PX + 20, y: y - 20, text: 'Räddad!', age: 0 })
          sounds.shield()
        } else {
          die()
        }
        return
      }
    }
  }

  function emoji(char: string, x: number, yy: number, size: number, flip = false, angle = 0) {
    ctx.save()
    ctx.translate(x, yy)
    ctx.rotate(angle)
    if (flip) ctx.scale(-1, 1)
    ctx.font = `${size}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(char, 0, 0)
    ctx.restore()
  }

  // Outlined text so it stays readable on both the day and night sky.
  function hudText(text: string, x: number, yy: number, size = 18, align: CanvasTextAlign = 'left', color = '#fff') {
    ctx.font = `bold ${size}px Georgia, serif`
    ctx.textAlign = align
    ctx.textBaseline = 'alphabetic'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 4
    ctx.strokeStyle = 'rgba(11,43,80,0.85)'
    ctx.strokeText(text, x, yy)
    ctx.fillStyle = color
    ctx.fillText(text, x, yy)
  }

  function glow(x: number, yy: number, r: number, color: string) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, yy, r, 0, Math.PI * 2)
    ctx.fill()
  }

  function draw() {
    ctx.save()
    if (shake > 0) ctx.translate(rand(-1, 1) * shake * 14, rand(-1, 1) * shake * 14)

    // Day turns to dusk and then night the longer you last.
    const night = clamp((time - 30) / 50, 0, 1)
    const sky = ctx.createLinearGradient(0, 0, 0, WATER_Y)
    sky.addColorStop(0, mix('#9fd3f0', '#2a2f6b', night))
    sky.addColorStop(1, mix('#e6f4fb', '#c97fa0', night))
    ctx.fillStyle = sky
    ctx.fillRect(-20, -20, W + 40, WATER_Y + 20)
    if (night > 0.6) {
      ctx.lineWidth = 12
      for (let k = 0; k < 3; k++) {
        ctx.strokeStyle = `rgba(120,255,180,${0.14 * (night - 0.6) * 2.5})`
        ctx.beginPath()
        for (let x = 0; x <= W; x += 10) {
          const ay = 24 + k * 16 + Math.sin(x / 60 + time * 0.8 + k) * 8
          if (x === 0) ctx.moveTo(x, ay)
          else ctx.lineTo(x, ay)
        }
        ctx.stroke()
      }
    }
    const sea = ctx.createLinearGradient(0, WATER_Y, 0, H)
    sea.addColorStop(0, mix('#3a9bd6', '#24629c', night))
    sea.addColorStop(1, mix('#0b3d6b', '#051a33', night))
    ctx.fillStyle = sea
    ctx.fillRect(-20, WATER_Y, W + 40, H - WATER_Y + 20)

    ctx.strokeStyle = 'rgba(255,255,255,0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let x = 0; x <= W; x += 8) {
      const wy = WATER_Y + Math.sin((x + wave) / 14) * 2
      if (x === 0) ctx.moveTo(x, wy)
      else ctx.lineTo(x, wy)
    }
    ctx.stroke()

    const speedFactor = clamp((speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED), 0, 1)
    ctx.strokeStyle = `rgba(255,255,255,${0.12 + speedFactor * 0.3})`
    ctx.lineWidth = 1.5
    for (const s of streaks) {
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(s.x + s.len, s.y)
      ctx.stroke()
    }
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    for (const b of bubbles) {
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fill()
    }

    for (const b of ice) {
      if (b.wall) {
        const g = ctx.createLinearGradient(b.x - b.w / 2, 0, b.x + b.w / 2, 0)
        g.addColorStop(0, '#d6f1ff')
        g.addColorStop(1, '#7cc4ee')
        ctx.fillStyle = g
        ctx.strokeStyle = '#effaff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 8)
        ctx.fill()
        ctx.stroke()
      } else {
        emoji('🧊', b.x, b.y, b.w * 1.25)
      }
    }
    for (const t of items) {
      glow(t.x, t.y, 18 + Math.sin(time * 6) * 2, 'rgba(255,255,255,0.25)')
      emoji(POWER_EMOJI[t.kind], t.x, t.y, 26)
    }
    for (const t of fish) {
      if (t.golden) {
        glow(t.x, t.y, 17, 'rgba(255,213,74,0.35)')
        emoji('🐠', t.x, t.y, 26)
      } else {
        emoji('🐟', t.x, t.y, 22)
      }
    }
    for (const t of gulls) emoji('🐦', t.x, t.y, 30)

    // Penguin, with its shield and magnet aura
    if (magnetT > 0) {
      ctx.strokeStyle = 'rgba(255,120,120,0.35)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(PX, y, MAGNET_RANGE * (0.6 + 0.1 * Math.sin(time * 8)), 0, Math.PI * 2)
      ctx.stroke()
    }
    const angle =
      phase === 'dying' || phase === 'over' ? dyingT * 14 : airborne ? clamp(vy / 900, -0.7, 0.7) : 0
    emoji('🐧', PX, y, 34, true, angle)
    if (shield && phase === 'playing') {
      ctx.fillStyle = 'rgba(150,230,255,0.2)'
      ctx.strokeStyle = 'rgba(190,240,255,0.9)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(PX, y, 25, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    for (const p of particles) {
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1)
      ctx.fillStyle = p.color
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
    }
    ctx.globalAlpha = 1
    for (const p of popups) {
      ctx.globalAlpha = 1 - p.age / 0.7
      hudText(p.text, p.x, p.y - p.age * 40, 16, 'center')
    }
    ctx.globalAlpha = 1

    if (slowT > 0) {
      ctx.fillStyle = 'rgba(180,220,255,0.12)'
      ctx.fillRect(-20, -20, W + 40, H + 40)
    }

    // HUD
    hudText(`Poäng: ${score}`, 12, 26, 20)
    if (multiplier() > 1) hudText(`Kombo x${multiplier()}`, 12, 48, 15, 'left', '#ffd54a')
    const best = getBest()
    if (best > 0) hudText(`Rekord: ${best}`, W - 12, 26, 15, 'right')
    const active: { kind: PowerKind; left: number }[] = []
    if (slowT > 0) active.push({ kind: 'slow', left: slowT / POWER_TIME.slow })
    if (magnetT > 0) active.push({ kind: 'magnet', left: magnetT / POWER_TIME.magnet })
    if (shield) active.push({ kind: 'shield', left: 1 })
    active.forEach((a, i) => {
      const px = W - 22 - i * 34
      emoji(POWER_EMOJI[a.kind], px, 52, 22)
      ctx.fillStyle = 'rgba(0,0,0,0.4)'
      ctx.fillRect(px - 12, 66, 24, 4)
      ctx.fillStyle = '#ffe27a'
      ctx.fillRect(px - 12, 66, 24 * a.left, 4)
    })
    if (banner) {
      const a = banner.age < 0.2 ? banner.age / 0.2 : banner.age > 1.8 ? (2 - banner.age) / 0.2 : 1
      ctx.globalAlpha = clamp(a, 0, 1)
      hudText(banner.text, W / 2, 78, 28, 'center', '#ffe27a')
      ctx.globalAlpha = 1
    }

    if (phase === 'ready') {
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(-20, -20, W + 40, H + 40)
      hudText('Tryck för att starta', W / 2, 105, 26, 'center')
      const lines = [
        'Styr med musen, fingret eller W/S – du glider på isen',
        'Tryck/mellanslag = hoppa, igen i luften = dubbelhopp, S = dyk',
        'Ät fiskar (🐠 ger 5), fånga fiskmåsar, undvik isblock',
        'Ta ❄️ 🧲 🛡️ för krafter • 1 poäng per sekund du överlever',
        'P = paus',
      ]
      lines.forEach((line, i) => hudText(line, W / 2, 145 + i * 24, 14, 'center'))
    } else if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(-20, -20, W + 40, H + 40)
      hudText('Pausad', W / 2, 150, 30, 'center')
      hudText('Tryck P eller Fortsätt', W / 2, 180, 15, 'center')
    }
    ctx.restore()
  }

  let raf = 0
  let last = performance.now()
  function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    if (phase === 'playing' && !paused) update(dt)
    else if (phase === 'dying') updateDying(dt)
    draw()
    if (phase === 'over') {
      destroy()
      onGameOver(score)
      return
    }
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  function togglePause() {
    if (phase === 'playing') setPaused(!paused)
  }

  // --- input ---
  const toGameY = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    return ((e.clientY - rect.top) * H) / rect.height
  }
  let down: { t: number; x: number; y: number } | null = null
  const onMove = (e: PointerEvent) => {
    mode = 'pointer'
    targetY = clamp(toGameY(e), MIN_Y, MAX_Y)
  }
  const onDown = (e: PointerEvent) => {
    down = { t: performance.now(), x: e.clientX, y: e.clientY }
  }
  const onUp = (e: PointerEvent) => {
    // A quick tap that barely moved counts as a jump; dragging just steers.
    if (down && performance.now() - down.t < 300 && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 12) jump()
    down = null
  }
  const onKeyDown = (e: KeyboardEvent) => {
    if (ignoreKey(e)) return
    if (e.code === 'Space') jump()
    else if (e.code === 'KeyP') {
      if (!e.repeat) togglePause()
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.up = true
    else if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = true
    else return
    e.preventDefault()
  }
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.up = false
    else if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = false
  }
  // Losing focus pauses the game and lets go of any held keys.
  const onBlur = () => {
    keys.up = false
    keys.down = false
    if (phase === 'playing' && !paused) setPaused(true)
  }
  const onVisibility = () => {
    if (document.hidden && phase === 'playing' && !paused) setPaused(true)
  }
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointerup', onUp)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onBlur)
  document.addEventListener('visibilitychange', onVisibility)

  const destroy = () => {
    cancelAnimationFrame(raf)
    canvas.removeEventListener('pointermove', onMove)
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointerup', onUp)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onBlur)
    document.removeEventListener('visibilitychange', onVisibility)
  }
  return { destroy, togglePause }
}
