// localStorage can throw (blocked storage) or contain junk. These helpers never throw, and if writing fails
// the value is kept in memory so the game still works until the page is closed.
const memory = new Map<string, string>()

export function readString(key: string): string | null {
  if (memory.has(key)) return memory.get(key)!
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
    memory.delete(key)
  } catch {
    memory.set(key, value)
  }
}

export function readJSON<T>(key: string, isValid: (value: unknown) => value is T, fallback: T): T {
  const raw = readString(key)
  if (raw === null) return fallback
  try {
    const value = JSON.parse(raw)
    return isValid(value) ? value : fallback
  } catch {
    return fallback
  }
}
