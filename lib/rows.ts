import type { AdminEntry } from "./admin-entries";
import type { AdminSection } from "./sections";
import { isMediaUrl, isUploadBlockType, UPLOAD_RULES } from "./media";
import {
  BLOCK_TYPES,
  ENTRY_SOURCES,
  ENTRY_STATUSES,
  SECTION_LAYOUTS,
  type Block,
  type Entry,
  type Media,
  type Page,
  type Section,
} from "@/types/entry";

// Database rows arrive untyped; these turn them into the content contract and drop anything malformed

export type Row = Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function oneOf<T extends string>(allowed: readonly T[], value: unknown, fallback: T): T {
  return allowed.find((a) => a === value) ?? fallback;
}

function texts(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function isRecord(value: unknown): value is Row {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function size(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}

/** Keeps files from this site's store that know their size; anything else is dropped. */
export function toMedia(value: unknown): Media[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((m) => {
    if (!isRecord(m) || !isMediaUrl(m.url)) return [];
    const width = size(m.width);
    const height = size(m.height);
    return width && height ? [{ url: m.url, alt: text(m.alt), width, height }] : [];
  });
}

/** Keeps blocks with a known type; a block without text gets an empty string, and only image, gallery and recording blocks carry `media`, up to what each holds. */
export function toBlocks(value: unknown): Block[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((b): Block[] => {
    if (!isRecord(b)) return [];
    const type = BLOCK_TYPES.find((t) => t === b.type);
    if (!type) return [];
    const media = isUploadBlockType(type) ? toMedia(b.media).slice(0, UPLOAD_RULES[type].max) : [];
    return [media.length ? { type, text: text(b.text), media } : { type, text: text(b.text) }];
  });
}

/** Keeps only label and value pairs of strings. */
export function toFacts(value: unknown): Entry["facts"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((f): Entry["facts"] =>
    Array.isArray(f) && f.length === 2 && typeof f[0] === "string" && typeof f[1] === "string" ? [[f[0], f[1]]] : [],
  );
}

export function toSection(row: Row): Section {
  return {
    slug: text(row.slug),
    name: text(row.name),
    layout: oneOf(SECTION_LAYOUTS, row.layout, "list"),
    order: typeof row.order === "number" ? row.order : 0,
  };
}

/** An unknown status reads as draft, so a bad row is hidden rather than published. */
export function toEntry(row: Row): Entry {
  return {
    id: text(row.id),
    section: text(row.section),
    slug: text(row.slug),
    title: text(row.title),
    summary: text(row.summary),
    date: text(row.date),
    tags: texts(row.tags),
    featured: row.featured === true,
    status: oneOf(ENTRY_STATUSES, row.status, "draft"),
    source: oneOf(ENTRY_SOURCES, row.source, "site"),
    quote: text(row.quote),
    facts: toFacts(row.facts),
    blocks: toBlocks(row.blocks),
  };
}

export function toPage(row: Row): Page {
  return { slug: text(row.slug), title: text(row.title), intro: text(row.intro), blocks: toBlocks(row.blocks) };
}

export function toAdminSection(row: Row): AdminSection {
  return {
    ...toSection(row),
    entries: typeof row.entries === "number" ? row.entries : 0,
    deletedAt: typeof row.deletedAt === "string" ? row.deletedAt : null,
  };
}

export function toAdminEntry(row: Row): AdminEntry {
  return { entry: toEntry(row), deletedAt: typeof row.deletedAt === "string" ? row.deletedAt : null };
}
