// Scroll-story math: one phone stays in view while each project's story scrolls past it

/** Where a story counts as reached, as a share of the viewport's height from the top. */
export const STORY_LINE = 0.62;

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/** The story the phone shows: the last one whose top has passed the line, else the first. */
export function activeStory(tops: readonly number[], line: number): number {
  let active = 0;
  tops.forEach((top, i) => {
    if (top <= line) active = i;
  });
  return active;
}

/** How much of a story has passed the line, 0 before it arrives and 1 once it has gone by. */
export function storyProgress(top: number, height: number, line: number): number {
  return clamp01((line - top) / Math.max(1, height));
}
