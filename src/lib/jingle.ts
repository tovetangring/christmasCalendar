// "Bjällerklang" (Jingle Bells), the start of the chorus, played on four hand bells (door 11) and by the gramophone.
export const BELL_NOTES = [
  { name: 'C', freq: 523.25 },
  { name: 'D', freq: 587.33 },
  { name: 'E', freq: 659.25 },
  { name: 'G', freq: 783.99 },
]

// Which bell plays each note, and how long each note is in beats: E E E, E E E, E G C D E.
export const MELODY = [2, 2, 2, 2, 2, 2, 2, 3, 0, 1, 2]
export const BEATS = [1, 1, 2, 1, 1, 2, 1, 1, 1.5, 0.5, 3]
export const BEAT_SECONDS = 0.3

// When each note starts, in seconds from the start.
export const NOTE_STARTS = BEATS.reduce<number[]>((starts, _, i) => [...starts, i === 0 ? 0 : starts[i - 1] + BEATS[i - 1] * BEAT_SECONDS], [])
