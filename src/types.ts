// Games with a highscore list.
export const SCORE_GAMES = ['penguin', 'snowball'] as const
export type ScoreGameId = (typeof SCORE_GAMES)[number]
export type GameId = ScoreGameId | 'chop' | 'claw' | 'star' | 'wheel' | 'wordle' | 'crossword'

export function isScoreGame(game: GameId): game is ScoreGameId {
  return (SCORE_GAMES as readonly string[]).includes(game)
}

export type Door =
  | { day: number; type: 'quote'; text: string; author?: string; poem?: boolean } // poem: keep line breaks, no quote marks
  | { day: number; type: 'game'; game: GameId }
  | { day: number; type: 'message'; text: string; from: 'santa' | 'neighbour'; gives: 'scissors' | 'treeStand' } // a note that hands over an item (doors 1 and 3)
  | { day: number; type: 'wreath' } // door 12: spin the wreath
  | { day: number; type: 'curtains' } // door 19: open the curtains
  | { day: number; type: 'cat' } // door 16: a cat eats the fish
  | { day: number; type: 'video'; youtubeId: string; title?: string } // the id is the part after v= in the YouTube link
// Later: | { day: number; type: 'image'; src: string }

export type Calendar = {
  id: string
  name: string
  player: string // the name highscores are saved under
  doors: Door[]
}
