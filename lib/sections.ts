import { SECTION_LAYOUTS, type Section, type SectionLayout } from "@/types/entry";
import { isRestorable } from "./admin-entries";
import { slugify } from "./slug";

/** A section as the admin sees it: how many entries it holds now, and when it was removed, if it was. */
export type AdminSection = Section & { entries: number; deletedAt: string | null };

export type SectionInput = { name: string; layout: SectionLayout };

export type SectionResult = { ok: true; input: SectionInput } | { ok: false; error: string };

const MAX_NAME = 40;

// Sections live at /<slug>, so a slug can't take an address the site already uses or will use
export const RESERVED_SLUGS = ["about", "admin", "api", "demos", "feed", "rss", "sitemap", "robots"] as const;

/** Checks a section's name and layout as the browser sent them. */
export function parseSectionInput(value: unknown): SectionResult {
  if (typeof value !== "object" || value === null) return { ok: false, error: "Nothing to save." };
  const v = value as Record<string, unknown>;
  const name = typeof v.name === "string" ? v.name.trim() : "";
  if (!name) return { ok: false, error: "Give the section a name." };
  if (name.length > MAX_NAME) return { ok: false, error: `A section name can be at most ${MAX_NAME} characters.` };
  const layout = SECTION_LAYOUTS.find((l) => l === v.layout);
  if (!layout) return { ok: false, error: "Pick Grid or List." };
  return { ok: true, input: { name, layout } };
}

/** The address a new section gets from its name, or the reason it can't have one. */
export function newSectionSlug(name: string, taken: readonly string[]): { ok: true; slug: string } | { ok: false; error: string } {
  const slug = slugify(name);
  if (!slug) return { ok: false, error: "Use at least one letter or number in the name." };
  if ((RESERVED_SLUGS as readonly string[]).includes(slug)) return { ok: false, error: `/${slug} is already a page on the site. Try another name.` };
  if (taken.includes(slug)) return { ok: false, error: `A section already uses /${slug}, or did recently. Try another name.` };
  return { ok: true, slug };
}

/** True when the browser sent every current section exactly once, so a new order can't drop or invent one. */
export function isSameSet(order: unknown, current: readonly string[]): order is string[] {
  return (
    Array.isArray(order) &&
    order.length === current.length &&
    new Set(order).size === order.length &&
    order.every((slug) => typeof slug === "string" && current.includes(slug))
  );
}

/** Sections in nav order, and the removed ones (newest first) that can still be restored. */
export function sectionView(sections: readonly AdminSection[], now: Date) {
  const current = sections.filter((s) => s.deletedAt === null).sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  const removed = sections
    .filter((s): s is AdminSection & { deletedAt: string } => s.deletedAt !== null && isRestorable(s.deletedAt, now))
    .sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
  return { current, removed };
}

/** "3 entries" or "1 entry". */
export function entryCount(n: number): string {
  return `${n} ${n === 1 ? "entry" : "entries"}`;
}
