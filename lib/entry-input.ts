import type { Block, Entry, EntryStatus, Page } from "@/types/entry";
import { ENTRY_STATUSES } from "@/types/entry";
import { isTextBlock } from "./blocks";
import { toBlocks, toFacts } from "./rows";
import { isSlug } from "./slug";

/** What the editor saves: every field of an entry Ty can change. */
export type EntryInput = Pick<
  Entry,
  "section" | "slug" | "title" | "summary" | "date" | "tags" | "featured" | "status" | "quote" | "facts" | "blocks"
>;

export type InputResult = { ok: true; input: EntryInput } | { ok: false; error: string };

const LIMITS = { title: 200, summary: 500, quote: 500, tag: 40, tags: 12, facts: 12, blocks: 500, text: 20000, alt: 500 };

function text(value: unknown, max: number): string | null {
  return typeof value === "string" && value.length <= max ? value.trim() : null;
}

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/** Tags typed as one comma-separated line, trimmed and without repeats. */
export function tagsFromText(line: string): string[] {
  return [...new Set(line.split(",").map((t) => t.trim()).filter(Boolean))];
}

/** Empty text blocks are dropped on save; media blocks stay, since their content isn't text. */
function keptBlocks(blocks: Block[]): Block[] {
  return blocks.filter((b) => !isTextBlock(b) || b.text.trim() !== "");
}

export type StoryResult = { ok: true; blocks: Block[] } | { ok: false; error: string };

/** Checks a story's blocks as sent by the browser, for entries and pages alike. */
export function parseStory(value: unknown): StoryResult {
  const blocks = keptBlocks(toBlocks(value));
  if (blocks.length > LIMITS.blocks || blocks.some((b) => b.text.length > LIMITS.text)) {
    return { ok: false, error: "The story is too long to save in one go." };
  }
  if (blocks.some((b) => b.media?.some((m) => m.alt.length > LIMITS.alt))) {
    return { ok: false, error: `Each image description can be at most ${LIMITS.alt} characters.` };
  }
  return { ok: true, blocks };
}

/** Checks what the browser sent before it is saved; the first problem found is the message shown. */
export function parseEntryInput(value: unknown, sections: readonly string[]): InputResult {
  if (typeof value !== "object" || value === null) return { ok: false, error: "Nothing to save." };
  const v = value as Record<string, unknown>;

  const title = text(v.title, LIMITS.title);
  if (title === null) return { ok: false, error: `The title can be at most ${LIMITS.title} characters.` };
  const summary = text(v.summary, LIMITS.summary);
  if (summary === null) return { ok: false, error: `The summary can be at most ${LIMITS.summary} characters.` };
  const quote = text(v.quote, LIMITS.quote);
  if (quote === null) return { ok: false, error: `The highlight quote can be at most ${LIMITS.quote} characters.` };
  if (typeof v.section !== "string" || !sections.includes(v.section)) return { ok: false, error: "Pick a section." };
  if (!isSlug(v.slug)) return { ok: false, error: "The address can use only lowercase letters, numbers and single hyphens." };
  if (!isDate(v.date)) return { ok: false, error: "The date isn't a real date." };
  const status = ENTRY_STATUSES.find((s): s is EntryStatus => s === v.status);
  if (!status) return { ok: false, error: "Pick Draft or Live." };
  if (status === "live" && !title) return { ok: false, error: "Give it a title before publishing." };

  const tags = Array.isArray(v.tags) ? v.tags.filter((t): t is string => typeof t === "string") : [];
  if (tags.length > LIMITS.tags || tags.some((t) => !t.trim() || t.length > LIMITS.tag)) {
    return { ok: false, error: `Use up to ${LIMITS.tags} tags of at most ${LIMITS.tag} characters.` };
  }
  const facts = toFacts(v.facts).map(([label, val]): [string, string] => [label.trim(), val.trim()]).filter(([l, x]) => l || x);
  if (facts.length > LIMITS.facts || facts.some(([label]) => !label)) {
    return { ok: false, error: `Each fact needs a label, and there can be up to ${LIMITS.facts}.` };
  }
  const story = parseStory(v.blocks);
  if (!story.ok) return story;

  return {
    ok: true,
    input: {
      section: v.section,
      slug: v.slug,
      title,
      summary,
      date: v.date,
      tags: tagsFromText(tags.join(",")),
      featured: v.featured === true,
      status,
      quote,
      facts,
      blocks: story.blocks,
    },
  };
}

/** What the page editor saves: a page's headline, opening line and story. */
export type PageInput = Pick<Page, "title" | "intro" | "blocks">;

export type PageInputResult = { ok: true; input: PageInput } | { ok: false; error: string };

/** Checks a page as the browser sent it; a page always needs a headline, since it has no draft state. */
export function parsePageInput(value: unknown): PageInputResult {
  if (typeof value !== "object" || value === null) return { ok: false, error: "Nothing to save." };
  const v = value as Record<string, unknown>;
  const title = text(v.title, LIMITS.title);
  if (!title) return { ok: false, error: `Give the page a headline of at most ${LIMITS.title} characters.` };
  const intro = text(v.intro, LIMITS.summary);
  if (intro === null) return { ok: false, error: `The opening line can be at most ${LIMITS.summary} characters.` };
  const story = parseStory(v.blocks);
  if (!story.ok) return story;
  return { ok: true, input: { title, intro, blocks: story.blocks } };
}
