import type { Entry } from "@/types/entry";

/** A minimal live entry for tests; override only what a test is about. */
export function testEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: "e1",
    section: "projects",
    slug: "e1",
    title: "Entry",
    summary: "Summary",
    date: "2026-01-01",
    tags: [],
    featured: false,
    status: "live",
    source: "site",
    quote: "",
    facts: [],
    blocks: [],
    ...overrides,
  };
}
