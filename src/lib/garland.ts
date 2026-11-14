// Shape of the garland along the ceiling (shared by the drawing and door 21).
export const SWAGS = 7
export const GARLAND_DIP = 26 // how far each swag hangs down in the middle
export const LIGHT_COLORS = ['#ffd54a', '#ff5e5e', '#5ec8ff', '#7dff8a']

// The point on the garland at x (used to put the lights, and the glitter in door 21, on the line).
export function garlandY(x: number, width: number, top: number) {
  const swag = width / SWAGS
  const t = (x % swag) / swag
  return top + 2 * (1 - t) * t * (GARLAND_DIP * 2) // a quadratic curve whose control point sits 2 x DIP below the hooks
}
