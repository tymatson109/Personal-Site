import type { Block } from "@/types/entry";

/** True for an https address with no login in it, the only kind of page the site will frame as a live demo. */
export function isDemoUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

/** The address a demo block plays, or null while it has none. */
export function demoSrc(block: Block): string | null {
  return block.type === "demo" && isDemoUrl(block.text) ? block.text.trim() : null;
}

/** Where a demo's app publishes its splash screen, at the root of the same web build. */
export function splashSrc(block: Block): string | null {
  const src = demoSrc(block);
  return src && new URL("/splash.svg", src).href;
}
