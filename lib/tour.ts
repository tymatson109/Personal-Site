// Scroll-index math: each project's name drifts sideways and fills with the accent as it crosses the screen

/** Where a name starts and finishes filling, as shares of the viewport's height from the top. */
export const FILL_START = 0.85;
export const FILL_END = 0.4;

/** How far a name drifts sideways per pixel it sits away from the middle of the screen. */
export const DRIFT = 0.25;

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function easeOut(v: number): number {
  return 1 - Math.pow(1 - v, 3);
}

/** How much of a name is filled, 0 below the start line and 1 once its top passes the end line. */
export function nameFill(top: number, viewportHeight: number): number {
  const start = viewportHeight * FILL_START;
  const end = viewportHeight * FILL_END;
  return clamp01((start - top) / (start - end));
}

/** A name's sideways offset in pixels; alternate rows drift opposite ways so the list shears as it scrolls. */
export function nameDrift(top: number, viewportHeight: number, index: number): number {
  return (top - viewportHeight / 2) * DRIFT * (index % 2 === 0 ? -1 : 1);
}

/** How far a project's story and recording have come in, starting once its name is a third filled. */
export function storyReveal(fill: number): number {
  return easeOut(clamp01((fill - 0.35) / 0.5));
}
