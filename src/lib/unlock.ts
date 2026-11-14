// Add ?debug to the URL (e.g. /?debug#/c/ivar) to unlock every door while testing.
export function isDebug(): boolean {
  return new URLSearchParams(window.location.search).has('debug')
}

export function isUnlocked(day: number, now = new Date()): boolean {
  if (isDebug()) return true
  // Month 11 is December; doors open on or after their date.
  return now.getMonth() === 11 ? now.getDate() >= day : false
}
