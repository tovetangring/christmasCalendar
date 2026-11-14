// The shape of the Christmas tree (in the tree picture's own coordinates: 200 wide, 280 high, centre line at x 100).
// Shared by the tree drawing, its lights and the tinsel garland that door 15 winds around it.
export type Tier = { top: number; bottom: number; half: number } // apex y, bottom edge y, half the width at the bottom

// Six layers of branches, from the top down; they overlap like real branches.
export const TIERS: Tier[] = [
  { top: 30, bottom: 72, half: 28 },
  { top: 52, bottom: 100, half: 42 },
  { top: 76, bottom: 128, half: 56 },
  { top: 102, bottom: 158, half: 68 },
  { top: 128, bottom: 188, half: 78 },
  { top: 156, bottom: 215, half: 86 },
]

export const halfWidthAt = (tier: Tier, y: number) => (tier.half * (y - tier.top)) / (tier.bottom - tier.top)

// The tinsel garland: one drooping swag across each layer (not the top one), listed from the bottom up, because
// door 15 winds it from the bottom to the top, every other swag in the other direction.
export type Swag = { y: number; left: number; right: number; dip: number }
export const SWAGS: Swag[] = TIERS.slice(1)
  .map((tier) => {
    const y = tier.top + (tier.bottom - tier.top) * 0.6
    const half = halfWidthAt(tier, y) * 0.97
    return { y, left: 100 - half, right: 100 + half, dip: 9 }
  })
  .reverse()

// The point a share `t` (0..1) of the way along a swag, going left-to-right if `forwards`.
export function swagPoint(swag: Swag, t: number, forwards: boolean): [number, number] {
  const s = forwards ? t : 1 - t
  return [swag.left + (swag.right - swag.left) * s, swag.y + 4 * (1 - s) * s * swag.dip]
}
