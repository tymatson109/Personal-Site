// Decisions behind the site's motion; the components only apply them

const REVEAL_STAGGER_MS = 70;
const REVEAL_GROUP = 3;

/** Only content starting below the first screen waits to reveal, so nothing visible on load ever blinks out. */
export function holdsForReveal(top: number, viewportHeight: number): boolean {
  return top > viewportHeight;
}

/** Neighbors reveal a beat apart, in groups of three so long lists don't lag. */
export function revealDelay(index: number): number {
  return (index % REVEAL_GROUP) * REVEAL_STAGGER_MS;
}

/** One frame of the ring cursor easing toward the pointer. */
export function follow(current: number, target: number, ease = 0.2): number {
  return current + (target - current) * ease;
}

/** Splits a headline into words, so each can rise in on its own beat. */
export function words(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}
