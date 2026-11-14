import { useCallback, useRef, useState } from 'react'

// Little glittering stars for Christmas magic (doors 12 and 19). `add` drops a star at (x, y) that drifts by (dx, dy)
// and fades; draw them with <MagicSparks>. Skipped for people who prefer reduced motion.
export type Spark = { id: number; x: number; y: number; dx: number; dy: number; color: string; size: number }
const COLORS = ['#fff3b0', '#ffd54a', '#ffffff', '#ffb3d9', '#9ee7ff']

export function useMagicSparks() {
  const [sparks, setSparks] = useState<Spark[]>([])
  const nextId = useRef(0)
  const reducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  const add = useCallback((x: number, y: number, dx: number, dy: number) => {
    if (reducedMotion.current) return
    const id = nextId.current++
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    const size = 0.6 + Math.random() * 1.1
    setSparks((all) => [...all.slice(-60), { id, x, y, dx, dy, color, size }])
  }, [])

  const remove = useCallback((id: number) => setSparks((all) => all.filter((s) => s.id !== id)), [])
  return { sparks, add, remove }
}
