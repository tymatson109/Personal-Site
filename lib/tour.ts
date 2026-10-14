// Flood math: each project's color pours over the screen from its logo as the project nears the middle of the screen

/** How far from the middle, in viewport heights, a project can sit and still carry some of its color. */
export const FLOOD_RANGE = 0.78;

/** How much color makes the text switch to the ink that reads on the app's color. */
export const INK_SWITCH = 0.45;

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function easeOut(v: number): number {
  return 1 - Math.pow(1 - v, 3);
}

/** How much a project has flooded the screen: 1 with its middle on the screen's middle, falling to 0 a range away either side. */
export function floodAmount(top: number, height: number, viewportHeight: number): number {
  const offset = Math.abs(top + height / 2 - viewportHeight / 2) / viewportHeight;
  return easeOut(clamp01(1 - offset / FLOOD_RANGE));
}

/** Reduced motion swaps colors outright instead of pouring them. */
export function floodStep(amount: number): number {
  return amount >= INK_SWITCH ? 1 : 0;
}

export type Rgb = [number, number, number];

/** What the shared backdrop shows: the stops' colors mixed by how much each has flooded, how far the color has spread, and which stop leads it. */
export type Blend = { rgb: Rgb | null; coverage: number; lead: number };

/** Mixes the colors of every stop with some flood, weighted by its amount, so one app's color glides into the next with no gap between them. */
export function blendFlood(stops: readonly { rgb: Rgb | null; amount: number }[]): Blend {
  let total = 0;
  let lead = -1;
  const sum: Rgb = [0, 0, 0];
  stops.forEach(({ rgb, amount }, i) => {
    if (!rgb || amount <= 0) return;
    total += amount;
    rgb.forEach((c, k) => (sum[k] += c * amount));
    if (lead === -1 || amount > stops[lead].amount) lead = i;
  });
  if (lead === -1) return { rgb: null, coverage: 0, lead };
  return { rgb: sum.map((c) => Math.round(c / total)) as Rgb, coverage: stops[lead].amount, lead };
}
