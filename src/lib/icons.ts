// Every picture in the wheel/candy/package system lives here. Each one is an emoji for now.
// To use your own image, put the file in /public and set `src` to its file name, e.g. { emoji: '🍬', src: 'candy.png' }.
// whiteBackground: the image is a JPEG (or PNG) with a solid white background; the white is made see-through.
export type IconDef = { emoji: string; src?: string; whiteBackground?: boolean }

export const ICONS = {
  candy: { emoji: '🍬' } as IconDef, // the currency you earn from games
  sack: { emoji: '💰' } as IconDef, // the little sack on the calendar page
  pack: { emoji: '📦', src: 'present-small.png' } as IconDef, // the prize that ends up under the tree
  scissors: { emoji: '✂️' } as IconDef, // from door 1; cuts open the wrapped room
  treeGarland: { emoji: '🎊' } as IconDef, // from door 15; the tinsel on the tree is drawn
  garland: { emoji: '✨' } as IconDef, // from door 21; the garland in the room is drawn
  curtains: { emoji: '🪟' } as IconDef, // from door 19; the curtains in the room are drawn
  wreath: { emoji: '🎄' } as IconDef, // from door 12; the wreath on the door is drawn, set `src` to use an image
  armchair: { emoji: '🪑' } as IconDef, // from door 8; the armchair in the room is drawn, set `src` to use an image
  fish: { emoji: '🐟' } as IconDef, // from door 5; the fish on the floor is drawn, set `src` to use an image
  rug: { emoji: '🧶' } as IconDef, // from door 2; the rug itself is drawn in the room
  treeStand: { emoji: '🪵' } as IconDef, // from door 3; set `src` to draw an image under the tree instead
  nothing: { emoji: '💨' } as IconDef, // the "no prize" slice on the wheel
}

export const WHITE_TO_ALPHA = 'url(#white-to-alpha)'

export const iconUrl = (icon: IconDef) => (icon.src ? `${import.meta.env.BASE_URL}${icon.src}` : undefined)
