export const DECORATIONS = [
  { id: 'star', label: 'Stjärnan', emoji: '⭐' }, // placed on top in its own game (door 23)
  { id: 'ball', label: 'Julgranskulan', emoji: '🔴' },
  { id: 'bell', label: 'Klockan', emoji: '🔔' },
  { id: 'gift', label: 'Julklappen', emoji: '🎁' },
  { id: 'stocking', label: 'Strumpan', emoji: '🧦' },
  { id: 'cookie', label: 'Pepparkakan', emoji: '🍪' },
] as const

export type DecorationId = (typeof DECORATIONS)[number]['id']

// What the claw machine (door 10) hands out.
export const CLAW_DECORATIONS = DECORATIONS.filter((d) => d.id !== 'star')
