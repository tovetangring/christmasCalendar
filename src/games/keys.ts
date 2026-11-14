// Game key handlers live on window. Leave the keys alone while the player is typing or using a button,
// otherwise a name can't contain w/s/space and Enter can't press "Stäng".
export function ignoreKey(e: KeyboardEvent): boolean {
  const el = e.target
  return el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(el.tagName))
}
