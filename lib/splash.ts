// Reads the background color out of the splash.svg each app's web build publishes, and picks text that reads on it

export type Ink = "light" | "dark";

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const RGB = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;

/** The color of the rect that fills the whole splash, or null when the SVG has none or its color isn't a plain hex or rgb() value. */
export function splashColor(svg: string): string | null {
  for (const [rect] of svg.matchAll(/<rect\b[^>]*>/gi)) {
    if (!/\bwidth="100%"/.test(rect) || !/\bheight="100%"/.test(rect)) continue;
    const fill = /\bfill="([^"]*)"/.exec(rect)?.[1].trim() ?? "";
    return channels(fill) ? fill : null;
  }
  return null;
}

/** A color's red, green and blue as 0 to 255, or null for anything that isn't a plain hex or rgb() value. */
export function channels(color: string): [number, number, number] | null {
  if (HEX.test(color)) {
    const hex = color.length === 4 ? [...color.slice(1)].map((c) => c + c).join("") : color.slice(1);
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
  }
  const rgb = RGB.exec(color);
  if (!rgb) return null;
  const values = rgb.slice(1, 4).map(Number);
  return values.every((v) => v <= 255) ? (values as [number, number, number]) : null;
}

/** WCAG relative luminance of a color, 0 for black and 1 for white. */
function luminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Whichever of white or near-black text has more contrast on the color. */
export function inkOn(color: string): Ink {
  const rgb = channels(color);
  if (!rgb) return "dark";
  const l = luminance(rgb);
  return 1.05 / (l + 0.05) > (l + 0.05) / 0.05 ? "light" : "dark";
}
