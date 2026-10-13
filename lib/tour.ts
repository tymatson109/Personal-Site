// Scroll-story math: each stop pins, its media grows into place, then its text and tags slide in

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function easeOut(v: number): number {
  return 1 - Math.pow(1 - v, 3);
}

/** How far through a pinned stop the reader is, 0 at pin and 1 when it lets go. */
export function stopProgress(stopTop: number, headHeight: number, stopHeight: number, stickHeight: number): number {
  return clamp01((headHeight - stopTop) / Math.max(1, stopHeight - stickHeight));
}

export type StopFrame = {
  mediaY: number;
  mediaScale: number;
  textOpacity: number;
  textY: number;
  tagOpacity: (index: number) => number;
};

const MEDIA_RISE = 80;
const MEDIA_MIN_SCALE = 0.84;
const TEXT_RISE = 32;
const TEXT_MIN_OPACITY = 0.15;
const TAG_MIN_OPACITY = 0.2;

/** Where everything in a stop sits at progress p. */
export function stopFrame(p: number): StopFrame {
  const grow = easeOut(clamp01(p / 0.35));
  const show = easeOut(clamp01((p - 0.12) / 0.25));
  return {
    mediaY: (1 - grow) * MEDIA_RISE,
    mediaScale: MEDIA_MIN_SCALE + (1 - MEDIA_MIN_SCALE) * grow,
    textOpacity: TEXT_MIN_OPACITY + (1 - TEXT_MIN_OPACITY) * show,
    textY: (1 - show) * TEXT_RISE,
    tagOpacity: (i) => TAG_MIN_OPACITY + (1 - TAG_MIN_OPACITY) * clamp01((p - 0.3 - i * 0.06) / 0.12),
  };
}

/** The stop the reader is in: pinned under the header and still covering the middle of the screen. */
export function activeStop(rects: readonly { top: number; bottom: number }[], headHeight: number, viewportHeight: number): number {
  let active = -1;
  rects.forEach((r, i) => {
    if (r.top <= headHeight + 2 && r.bottom > viewportHeight / 2) active = i;
  });
  return active;
}

export type TourMove = "start" | "prev" | "next" | "exit";
export type TourTarget = { kind: "stop"; index: number } | { kind: "intro" } | { kind: "after" } | { kind: "top" };

/** Where Back, Next, Exit and the start button go from the current stop. */
export function tourTarget(move: TourMove, active: number, count: number): TourTarget {
  if (move === "start") return { kind: "stop", index: 0 };
  if (move === "exit") return { kind: "top" };
  const next = active + (move === "next" ? 1 : -1);
  if (next < 0) return { kind: "intro" };
  if (next >= count) return { kind: "after" };
  return { kind: "stop", index: next };
}
