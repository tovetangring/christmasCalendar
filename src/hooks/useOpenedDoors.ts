import { useCallback, useEffect, useState } from 'react'
import { readJSON, writeString } from '../lib/storage'

const isNumberArray = (v: unknown): v is number[] => Array.isArray(v) && v.every((n) => typeof n === 'number')

export function useOpenedDoors(calendarId: string) {
  const key = `opened:${calendarId}`
  const [opened, setOpened] = useState<number[]>(() => readJSON(key, isNumberArray, []))

  useEffect(() => {
    writeString(key, JSON.stringify(opened))
  }, [key, opened])

  const markOpened = useCallback((day: number) => {
    setOpened((prev) => (prev.includes(day) ? prev : [...prev, day]))
  }, [])

  return { opened, markOpened }
}
