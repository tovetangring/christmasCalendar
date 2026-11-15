import type { Calendar, Door } from '../types'
import { etaag } from './etaag'
import { ivar } from './ivar'

// Doors that are the same in every calendar (replace the calendar's own door for that day).
const sharedDoors: Door[] = [
  {
    day: 1,
    type: 'message',
    from: 'santa',
    gives: 'scissors',
    text: 'Hohoho, God Jul kära vän! Även jag, tomten, har börjat vibe-koda, och i år blev det en kalender! Hoppas du får en fin december, så ses vi, Hoho-hooo!',
  },
  {
    day: 3,
    type: 'message',
    from: 'neighbour',
    gives: 'treeStand',
    text: 'Hej Grannen! Jag har fått utmaningen idag att ge en komplimang till en bekant och tänkte därför säga att jag verkligen uppskattar dig, även om vi bara är grannar, tänkte även ge dig denhär foten till jul då jag haft en extra ett tag, hoppas den kommer till användning!',
  },
  { day: 5, type: 'game', game: 'penguin' },
  {
    day: 6,
    type: 'quote',
    lightsCandle: 2,
    poem: true,
    text: 'När andra ljuset brinner\när snart lucia här\nhon bjuder oss på kaffe\noch bud om julen bär',
  },
  {
    day: 13,
    type: 'lucia',
    lightsCandle: 3,
    text: 'När tredje ljuset brinner\nvi juleklappar syr\noch mamma bakar kakor\noch har ett fasligt styr',
  },
  { day: 12, type: 'wreath' },
  { day: 16, type: 'cat' },
  { day: 19, type: 'curtains' },
  { day: 21, type: 'garland' },
  { day: 15, type: 'treeGarland' },
  { day: 9, type: 'cookies' },
  { day: 7, type: 'snowman' },
  { day: 11, type: 'bells' },
  { day: 22, type: 'giftWrap' },
  { day: 24, type: 'finale' },
  { day: 18, type: 'game', game: 'snowball' },
  {
    day: 20,
    type: 'quote',
    lightsCandle: 4,
    poem: true,
    text: 'När fjärde ljuset brinner\nvi hämtar julegran\noch alla barnen räknar\ndan före dan före dopparedan',
  },
  { day: 4, type: 'game', game: 'chop' },
  { day: 10, type: 'game', game: 'claw', revealsDecorations: true },
  { day: 23, type: 'game', game: 'star' },
  { day: 17, type: 'game', game: 'wheel' },
  { day: 2, type: 'game', game: 'wordle' },
  { day: 8, type: 'game', game: 'crossword' },
  { day: 14, type: 'video', youtubeId: 'KsInh3VvE3s', title: 'Julvideo' },
]

function withSharedDoors(calendar: Calendar): Calendar {
  return {
    ...calendar,
    doors: calendar.doors.map((door) => sharedDoors.find((s) => s.day === door.day) ?? door),
  }
}

// A player's own calendar (with Firebase, everyone who signs in gets one, keyed by their user id).
const placeholderDoors = Array.from({ length: 24 }, (_, i): Door => ({ day: i + 1, type: 'quote', text: 'God jul!' }))
const genitive = (name: string) => (/[sxz]$/i.test(name) ? name : `${name}s`)
export function playerCalendar(id: string, player: string): Calendar {
  return withSharedDoors({ id, player, name: `${genitive(player)} julkalender`, doors: placeholderDoors })
}

// Keys are lowercase codes.
const calendars: Record<string, Calendar> = {
  ivar: withSharedDoors(ivar),
  etaag: withSharedDoors(etaag),
}

export function findCalendar(code: string): Calendar | undefined {
  const key = code.trim().toLowerCase()
  // hasOwn: otherwise codes like "constructor" would match inherited object properties.
  return Object.hasOwn(calendars, key) ? calendars[key] : undefined
}
