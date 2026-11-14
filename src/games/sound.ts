import { readString, writeString } from '../lib/storage'

// Tiny synthesised sound effects (Web Audio), so no audio files are needed. The mute choice is remembered.
let ctx: AudioContext | null = null
let muted = readString('muted') === '1'

export const isMuted = () => muted

export function setMuted(value: boolean) {
  muted = value
  writeString('muted', value ? '1' : '0')
}

function audio(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new AudioContext()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

type ToneOptions = { type?: OscillatorType; volume?: number; slideTo?: number; delay?: number }

function tone(freq: number, duration: number, { type = 'sine', volume = 0.12, slideTo, delay = 0 }: ToneOptions = {}) {
  if (muted) return
  const ac = audio()
  if (!ac) return
  const start = ac.currentTime + delay
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration)
  gain.gain.setValueAtTime(volume, start)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

export const sounds = {
  eat: () => tone(660, 0.08, { type: 'triangle', slideTo: 990 }),
  golden: () => {
    tone(880, 0.1, { type: 'triangle' })
    tone(1175, 0.1, { type: 'triangle', delay: 0.08 })
    tone(1568, 0.16, { type: 'triangle', delay: 0.16 })
  },
  jump: () => tone(300, 0.15, { slideTo: 700 }),
  gull: () => {
    tone(1200, 0.07, { type: 'square', volume: 0.06 })
    tone(900, 0.1, { type: 'square', volume: 0.06, delay: 0.06 })
  },
  power: () => {
    tone(500, 0.1)
    tone(750, 0.1, { delay: 0.09 })
    tone(1000, 0.15, { delay: 0.18 })
  },
  shield: () => tone(400, 0.25, { type: 'sawtooth', volume: 0.08, slideTo: 120 }),
  hit: () => {
    tone(220, 0.5, { type: 'sawtooth', volume: 0.18, slideTo: 40 })
    tone(90, 0.4, { type: 'square', volume: 0.12, slideTo: 30 })
  },
  // A little rising shimmer for Christmas magic.
  magic: () => {
    ;[784, 988, 1175, 1568, 1976, 2349].forEach((f, i) => tone(f, 0.35, { type: 'triangle', volume: 0.07, delay: i * 0.09 }))
  },
  // A soft low purr: a low buzzing tone whose volume pulses about 24 times a second.
  purr: () => {
    if (muted) return
    const ac = audio()
    if (!ac) return
    const start = ac.currentTime
    const length = 1.5
    const osc = ac.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = 62
    const filter = ac.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 260
    const pulse = ac.createGain()
    pulse.gain.value = 0.08
    const lfo = ac.createOscillator()
    lfo.frequency.value = 24
    const lfoDepth = ac.createGain()
    lfoDepth.gain.value = 0.06
    const envelope = ac.createGain()
    envelope.gain.setValueAtTime(0, start)
    envelope.gain.linearRampToValueAtTime(1, start + 0.15)
    envelope.gain.linearRampToValueAtTime(0, start + length)
    lfo.connect(lfoDepth)
    lfoDepth.connect(pulse.gain)
    osc.connect(filter)
    filter.connect(pulse)
    pulse.connect(envelope)
    envelope.connect(ac.destination)
    osc.start(start)
    lfo.start(start)
    osc.stop(start + length + 0.05)
    lfo.stop(start + length + 0.05)
  },
  chop: () => {
    tone(150, 0.12, { type: 'square', volume: 0.14, slideTo: 60 })
    tone(900, 0.04, { type: 'triangle', volume: 0.05 })
  },
  // A hand bell: a clear tone with a couple of soft overtones, after `delay` seconds.
  bell: (freq: number, delay = 0) => {
    tone(freq, 1.1, { volume: 0.11, delay })
    tone(freq * 2.01, 0.6, { volume: 0.035, delay })
    tone(freq * 3.02, 0.3, { type: 'triangle', volume: 0.018, delay })
  },
  cut: () => tone(520, 0.07, { type: 'triangle', volume: 0.06, slideTo: 780 }),
  miss: () => tone(420, 0.12, { volume: 0.05, slideTo: 250 }),
  // The creak and crash of a falling tree.
  timber: () => {
    tone(180, 0.7, { type: 'sawtooth', volume: 0.06, slideTo: 90 })
    tone(70, 0.5, { type: 'square', volume: 0.16, slideTo: 35, delay: 0.75 })
  },
  milestone: () => {
    tone(660, 0.12, { type: 'triangle' })
    tone(880, 0.2, { type: 'triangle', delay: 0.12 })
  },
}
