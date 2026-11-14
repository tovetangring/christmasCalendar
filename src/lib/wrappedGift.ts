import { createStore, parseJSON } from './store'

// The present you wrap yourself in door 22, which then lies under the tree: which paper and ribbon you chose.
export const PAPERS = ['stars', 'dots', 'snow'] as const
export const RIBBONS = ['gold', 'white', 'red'] as const
export type Paper = (typeof PAPERS)[number]
export type Ribbon = (typeof RIBBONS)[number]
export type GiftStyle = { paper: Paper; ribbon: Ribbon }

const store = createStore<GiftStyle | null>('wrapped', (raw) => {
  const v = parseJSON(raw) as Partial<GiftStyle> | undefined
  return v && PAPERS.includes(v.paper as Paper) && RIBBONS.includes(v.ribbon as Ribbon) ? (v as GiftStyle) : null
})

export const getWrappedGift = store.get
export const useWrappedGift = store.use
export const saveWrappedGift = (calendarId: string, style: GiftStyle) => store.set(calendarId, style)

// How each paper and ribbon looks.
export const PAPER_LOOK: Record<Paper, { label: string; base: string }> = {
  stars: { label: 'Röd med stjärnor', base: '#b3262e' },
  dots: { label: 'Grön med prickar', base: '#1f7a3d' },
  snow: { label: 'Blå med snöflingor', base: '#2f5fa8' },
}
export const RIBBON_LOOK: Record<Ribbon, { label: string; fill: string; edge: string }> = {
  gold: { label: 'Guld', fill: '#f4d58d', edge: '#b8862a' },
  white: { label: 'Vitt', fill: '#fbf7ee', edge: '#b9b2a0' },
  red: { label: 'Rött', fill: '#d8332c', edge: '#8f1d17' },
}
