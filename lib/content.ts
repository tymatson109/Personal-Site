import type { Block, Entry, Media, Section } from "@/types/entry";
import { isPhoneBlock, isShown } from "./blocks";
import { splashSrc } from "./demos";

/** Newest first; ISO dates sort as strings. */
function byDateDesc(a: Entry, b: Entry) {
  return b.date.localeCompare(a.date);
}

/** Published entries, newest first, optionally from one section. */
export function liveEntries(entries: readonly Entry[], section?: string): Entry[] {
  return entries.filter((e) => e.status === "live" && (!section || e.section === section)).sort(byDateDesc);
}

export function sortedSections(sections: readonly Section[]): Section[] {
  return [...sections].sort((a, b) => a.order - b.order);
}

/** The tour walks featured work from grid sections, in nav order, newest first within each. */
export function tourEntries(sections: readonly Section[], entries: readonly Entry[]): Entry[] {
  return sortedSections(sections)
    .filter((s) => s.layout === "grid")
    .flatMap((s) => liveEntries(entries, s.slug).filter((e) => e.featured));
}

export function findEntry(entries: readonly Entry[], section: string, slug: string): Entry | undefined {
  return entries.find((e) => e.status === "live" && e.section === section && e.slug === slug);
}

export type EntryMedia =
  | { kind: "phone"; block: Block }
  | { kind: "image"; block: Block; image: Media }
  | { kind: "type" };

/** What shows an entry: its app in a phone, its image, or its name set in type. */
export function entryMedia(entry: Entry): EntryMedia {
  const shown = entry.blocks.filter(isShown);
  const phone = shown.find((b) => b.type === "demo") ?? shown.find(isPhoneBlock);
  if (phone) return { kind: "phone", block: phone };
  const block = shown.find((b) => b.type === "image" || b.type === "gallery");
  const image = block?.media?.[0];
  return block && image ? { kind: "image", block, image } : { kind: "type" };
}

/** The splash screen the entry's app publishes beside its live demo, or null with no demo. */
export function entrySplash(entry: Entry): string | null {
  const demo = entry.blocks.filter(isShown).find((b) => b.type === "demo");
  return demo ? splashSrc(demo) : null;
}

/** The line a preview highlights: the chosen quote, else the first quote block, else the summary. */
export function highlightQuote(entry: Entry): string {
  return entry.quote || entry.blocks.find((b) => b.type === "quote")?.text || entry.summary;
}

export function excerpt(entry: Entry): string {
  return entry.blocks.find((b) => b.type === "p")?.text ?? "";
}

/** Every tag used across the entries, in first-seen order. */
export function tagsOf(entries: readonly Entry[]): string[] {
  return [...new Set(entries.flatMap((e) => e.tags))];
}

export function entryHref(entry: Entry): string {
  return `/${entry.section}/${entry.slug}`;
}
