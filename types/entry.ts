// The one shape for site content: every page reads it, the admin editor and the Substack sync write it.

export type BlockType = "p" | "h" | "code" | "quote" | "image" | "gallery" | "demo" | "video";

export type Block = { type: BlockType; text: string };

export type EntryStatus = "draft" | "live";

export type EntrySource = "site" | "substack";

export type SectionLayout = "grid" | "list";

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
