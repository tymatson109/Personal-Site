// The one shape for site content: every page reads it, the admin editor and the Substack sync write it.
// The value lists are shared with the database's check constraints; db/schema.test.ts keeps them in step.

export const BLOCK_TYPES = ["p", "h", "code", "quote", "image", "gallery", "demo", "video"] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export type Block = { type: BlockType; text: string };

export const ENTRY_STATUSES = ["draft", "live"] as const;
export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export const ENTRY_SOURCES = ["site", "substack"] as const;
export type EntrySource = (typeof ENTRY_SOURCES)[number];

export const SECTION_LAYOUTS = ["grid", "list"] as const;
export type SectionLayout = (typeof SECTION_LAYOUTS)[number];

export type Section = {
  slug: string;
  name: string;
  layout: SectionLayout;
  order: number;
};

export type Entry = {
  id: string;
  section: string;
  slug: string;
  title: string;
  summary: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  tags: string[];
  featured: boolean;
  status: EntryStatus;
  source: EntrySource;
  /** The line a post's preview highlights; empty means use the first quote block. */
  quote: string;
  facts: [label: string, value: string][];
  blocks: Block[];
};

/** A one-off page such as About: a title and the same blocks an entry uses. */
export type Page = {
  slug: string;
  title: string;
  blocks: Block[];
};
