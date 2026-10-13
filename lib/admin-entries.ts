import type { Entry, EntryStatus, Section } from "@/types/entry";
import { formatDate } from "./format-date";

/** An entry as the admin sees it: the content contract plus when it was deleted, if it was. */
export type AdminEntry = { entry: Entry; deletedAt: string | null };

/** Deleted entries can be restored for this long before they are purged. */
export const RESTORE_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Server actions receive ids from the browser, so they are checked before reaching a query. */
export function isEntryId(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

export function isRestorable(deletedAt: string, now: Date): boolean {
  const at = Date.parse(deletedAt);
  return Number.isFinite(at) && now.getTime() - at < RESTORE_DAYS * DAY_MS;
}

/** The section the list is narrowed to, or undefined for all when the value isn't a real section. */
export function sectionFilter(sections: readonly Section[], value: unknown): string | undefined {
  return sections.find((s) => s.slug === value)?.slug;
}

/** Entries in the list newest first, and the recently deleted ones (newest deletion first) that can still come back. */
export function adminView(items: readonly AdminEntry[], section: string | undefined, now: Date) {
  const inSection = items.filter((i) => !section || i.entry.section === section);
  const current = inSection
    .filter((i) => i.deletedAt === null)
    .map((i) => i.entry)
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  const deleted = inSection
    .filter((i): i is { entry: Entry; deletedAt: string } => i.deletedAt !== null && isRestorable(i.deletedAt, now))
    .sort((a, b) => b.deletedAt.localeCompare(a.deletedAt))
    .map((i) => i.entry);
  return { current, deleted };
}

const STATUS_LABELS: Record<EntryStatus, string> = { draft: "Draft", live: "Live" };

/** The mono line under an entry's title in the admin list. */
export function adminMeta(entry: Entry, sectionName: string): string[] {
  return [
    sectionName,
    formatDate(entry.date),
    STATUS_LABELS[entry.status],
    ...(entry.featured ? ["Featured"] : []),
    ...(entry.source === "substack" ? ["Substack"] : []),
  ];
}
