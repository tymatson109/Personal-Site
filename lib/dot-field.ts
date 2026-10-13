// The hero's dot field: a grid of dots with a slow travelling wave; dots near the pointer swell and turn blue

export type Pointer = { x: number; y: number } | null;
export type Dot = { radius: number; hot: boolean; alpha: number };

const BASE_RADIUS = 1;
const WAVE_SWELL = 1.2;
const POINTER_SWELL = 4.5;
const HOT_WAVE = 0.85;
const HOT_NEAR = 0.05;

/** Dot spacing: tighter on phones so the field stays dense. */
export function dotGap(width: number): number {
  return width < 640 ? 16 : 20;
}

/** How far the pointer's pull reaches. */
export function pointerReach(width: number, height: number): number {
  return Math.min(width, height) * 0.22;
}

/** One dot at (x, y) and time t, in seconds. */
export function dotAt(x: number, y: number, t: number, pointer: Pointer, reach: number): Dot {
  const wave = Math.max(0, Math.sin(x * 0.016 + t * 1.1) * Math.cos(y * 0.02 - t * 0.7));
  const distance = pointer ? Math.hypot(x - pointer.x, y - pointer.y) : Infinity;
  const near = Math.max(0, 1 - distance / reach);
  const hot = near > HOT_NEAR || wave > HOT_WAVE;
  return {
    radius: BASE_RADIUS + wave * WAVE_SWELL + near * POINTER_SWELL,
    hot,
    alpha: hot ? 0.5 + near * 0.5 : 0.14 + wave * 0.2,
  };
}
