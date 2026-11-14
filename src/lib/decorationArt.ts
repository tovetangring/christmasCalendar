import type { DecorationId } from '../games/tree/decorations'

// Drawings of the tree decorations, as layers of SVG path data in a 24 x 24 box centred on (0, 0).
// The same data draws them in SVG (the tree in the room) and on a canvas (the claw machine and the star game),
// so they look the same everywhere.
export type Layer = { d: string; fill?: string; stroke?: string; width?: number; opacity?: number }

const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`
const starPath = (outer: number, inner: number, dy = 0) =>
  'M' +
  Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? inner : outer
    const a = (Math.PI / 5) * i - Math.PI / 2
    return `${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r + dy).toFixed(2)}`
  }).join(' L') +
  ' Z'

export const DECORATION_ART: Record<DecorationId, Layer[]> = {
  star: [
    { d: starPath(12.5, 5.4, 0.6), fill: '#e0a92a', stroke: '#a8762a', width: 1.4 },
    { d: starPath(8.2, 3.6, 0.6), fill: '#ffd54a' },
    { d: starPath(3.6, 1.6, -1), fill: '#fff6c8', opacity: 0.9 },
  ],
  ball: [
    { d: 'M0 -9 q-2.2 -2.4 0 -4.2', stroke: '#a8762a', width: 1.1 },
    { d: 'M-2.8 -9.6 H2.8 V-6.6 H-2.8 Z', fill: '#d4a640', stroke: '#a8762a', width: 0.8 },
    { d: circle(0, 2, 9), fill: '#c8202e', stroke: '#8f1520', width: 1 },
    { d: 'M-8.6 3.6 Q0 8.4 8.6 3.6', stroke: '#f4d58d', width: 1.6 },
    { d: circle(-3.2, -1.2, 2.4), fill: '#ffc2c2', opacity: 0.85 },
  ],
  bell: [
    { d: 'M0 -9.5 C-6.5 -15 -9.5 -8.5 0 -9.5 Z', fill: '#d8332c', stroke: '#8f1d17', width: 0.8 },
    { d: 'M0 -9.5 C6.5 -15 9.5 -8.5 0 -9.5 Z', fill: '#d8332c', stroke: '#8f1d17', width: 0.8 },
    { d: 'M-7.6 6 Q-8 -8.4 0 -8.4 Q8 -8.4 7.6 6 L10 8.4 L-10 8.4 Z', fill: '#e6b422', stroke: '#a8802a', width: 1 },
    { d: circle(0, 9.8, 2), fill: '#a8802a' },
    { d: 'M-3.8 4 Q-4.6 -4 -1 -6', stroke: '#fff3b0', width: 1.5, opacity: 0.85 },
    { d: circle(0, -9.5, 1.6), fill: '#e04437' },
  ],
  gift: [
    { d: 'M-9 -2.5 H9 V10 H-9 Z', fill: '#2f6fb5', stroke: '#1e4a7a', width: 1 },
    { d: 'M-10.4 -6.2 H10.4 V-1.8 H-10.4 Z', fill: '#3a82cf', stroke: '#1e4a7a', width: 1 },
    { d: 'M-1.7 -6.2 H1.7 V10 H-1.7 Z', fill: '#f4d58d' },
    { d: 'M0 -6.2 C-7 -13 -9.5 -6 0 -6.2 Z', fill: '#f4d58d', stroke: '#b8862a', width: 0.8 },
    { d: 'M0 -6.2 C7 -13 9.5 -6 0 -6.2 Z', fill: '#f4d58d', stroke: '#b8862a', width: 0.8 },
  ],
  stocking: [
    { d: 'M-5 -8 H5 V2 Q5 5.6 8.6 6.6 Q12 7.6 11.2 10.6 Q10.2 13.2 5 12 L-1 10 Q-5 9 -5 4 Z', fill: '#c8202e', stroke: '#8f1520', width: 1 },
    { d: 'M-5 -3.2 H5 V-1 H-5 Z', fill: '#2a8c4c' },
    { d: 'M7.2 7 Q12 7.6 11.2 10.6 Q10.2 13.2 6.6 12.4 Z', fill: '#f7f3ea' },
    { d: 'M-6.6 -12 H6.6 V-7.2 H-6.6 Z', fill: '#f7f3ea', stroke: '#cfc7b4', width: 0.8 },
  ],
  cookie: [
    {
      d: 'M-3 -3 L-9 -1.2 Q-11.2 1.8 -8.2 3 L-4 2 L-6 9 Q-6.2 12 -3 11 L0 6 L3 11 Q6.2 12 6 9 L4 2 L8.2 3 Q11.2 1.8 9 -1.2 L3 -3 Z',
      fill: '#b86b2e',
      stroke: '#7a4418',
      width: 0.9,
    },
    { d: circle(0, -7.2, 4.6), fill: '#b86b2e', stroke: '#7a4418', width: 0.9 },
    { d: 'M-8 0.6 L-5 0.2 M8 0.6 L5 0.2 M-5 8.2 L-3.2 8.8 M5 8.2 L3.2 8.8', stroke: '#fffaf0', width: 1 },
    { d: 'M-1.6 -5.4 Q0 -4.2 1.6 -5.4', stroke: '#fffaf0', width: 0.8 },
    { d: `${circle(-1.7, -8, 0.7)} ${circle(1.7, -8, 0.7)}`, fill: '#3b2010' },
    { d: `${circle(0, 0, 0.95)} ${circle(0, 3.2, 0.95)}`, fill: '#e0263a' },
  ],
}

const paths = new Map<string, Path2D>()

// Draws a decoration on a canvas, centred on (x, y), `size` wide.
export function drawDecoration(ctx: CanvasRenderingContext2D, id: DecorationId, x: number, y: number, size: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 24, size / 24)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const layer of DECORATION_ART[id]) {
    let path = paths.get(layer.d)
    if (!path) {
      path = new Path2D(layer.d)
      paths.set(layer.d, path)
    }
    ctx.globalAlpha = layer.opacity ?? 1
    if (layer.fill) {
      ctx.fillStyle = layer.fill
      ctx.fill(path)
    }
    if (layer.stroke) {
      ctx.strokeStyle = layer.stroke
      ctx.lineWidth = layer.width ?? 1
      ctx.stroke(path)
    }
  }
  ctx.restore()
}
