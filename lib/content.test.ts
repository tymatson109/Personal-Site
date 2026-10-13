import { describe, expect, it } from "vitest";
import type { Section } from "@/types/entry";
import { entryHref, entryMedia, excerpt, findEntry, highlightQuote, liveEntries, tagsOf, tourEntries } from "./content";
import { testEntry } from "./test-entry";

const projects: Section = { slug: "projects", name: "Projects", layout: "grid", order: 1 };
const writing: Section = { slug: "writing", name: "Writing", layout: "list", order: 2 };
const talks: Section = { slug: "talks", name: "Talks", layout: "grid", order: 3 };

describe("liveEntries", () => {
  it("leaves out drafts", () => {
    const entries = [testEntry({ id: "a" }), testEntry({ id: "b", status: "draft" })];
    expect(liveEntries(entries).map((e) => e.id)).toEqual(["a"]);
  });

  it("lists the newest entry first", () => {
    const entries = [testEntry({ id: "old", date: "2025-01-01" }), testEntry({ id: "new", date: "2026-03-01" })];
    expect(liveEntries(entries).map((e) => e.id)).toEqual(["new", "old"]);
  });

  it("keeps only the asked-for section", () => {
    const entries = [testEntry({ id: "p" }), testEntry({ id: "w", section: "writing" })];
    expect(liveEntries(entries, "writing").map((e) => e.id)).toEqual(["w"]);
  });
});

describe("tourEntries", () => {
  it("walks featured work from grid sections in nav order", () => {
    const entries = [
      testEntry({ id: "talk", section: "talks", featured: true, date: "2026-09-01" }),
      testEntry({ id: "proj", section: "projects", featured: true, date: "2026-01-01" }),
      testEntry({ id: "post", section: "writing", featured: true }),
      testEntry({ id: "plain", section: "projects" }),
    ];
    expect(tourEntries([talks, writing, projects], entries).map((e) => e.id)).toEqual(["proj", "talk"]);
  });

  it("skips featured drafts", () => {
    expect(tourEntries([projects], [testEntry({ featured: true, status: "draft" })])).toEqual([]);
  });
});

describe("findEntry", () => {
  it("finds a live entry by section and slug", () => {
    expect(findEntry([testEntry({ slug: "x" })], "projects", "x")?.slug).toBe("x");
  });

  it("does not find a draft", () => {
    expect(findEntry([testEntry({ slug: "x", status: "draft" })], "projects", "x")).toBeUndefined();
  });

  it("does not find an entry under another section's path", () => {
    expect(findEntry([testEntry({ slug: "x" })], "writing", "x")).toBeUndefined();
  });
});

describe("entryMedia", () => {
  it("prefers a live demo over a recording", () => {
    const e = testEntry({ blocks: [{ type: "video", text: "" }, { type: "demo", text: "app" }] });
    expect(entryMedia(e)).toEqual({ kind: "phone", block: { type: "demo", text: "app" } });
  });

  it("uses a recording when there is no demo", () => {
    expect(entryMedia(testEntry({ blocks: [{ type: "video", text: "" }] })).kind).toBe("phone");
  });

  it("uses an image when there is no app to show", () => {
    expect(entryMedia(testEntry({ blocks: [{ type: "p", text: "hi" }, { type: "image", text: "" }] })).kind).toBe("image");
  });

  it("falls back to the name in type when there is no media", () => {
    expect(entryMedia(testEntry({ blocks: [{ type: "p", text: "hi" }] }))).toEqual({ kind: "type" });
  });
});

describe("highlightQuote", () => {
  it("uses the chosen quote first", () => {
    expect(highlightQuote(testEntry({ quote: "Chosen", blocks: [{ type: "quote", text: "Block" }] }))).toBe("Chosen");
  });

  it("falls back to the first quote block", () => {
    expect(highlightQuote(testEntry({ blocks: [{ type: "quote", text: "Block" }] }))).toBe("Block");
  });

  it("falls back to the summary when there is no quote at all", () => {
    expect(highlightQuote(testEntry({ summary: "Sum" }))).toBe("Sum");
  });
});

describe("excerpt", () => {
  it("is the first paragraph, skipping headings", () => {
    expect(excerpt(testEntry({ blocks: [{ type: "h", text: "Head" }, { type: "p", text: "Body" }] }))).toBe("Body");
  });

  it("is empty when there is no paragraph", () => {
    expect(excerpt(testEntry())).toBe("");
  });
});

describe("tagsOf", () => {
  it("lists each tag once in first-seen order", () => {
    expect(tagsOf([testEntry({ tags: ["iOS", "AI"] }), testEntry({ tags: ["AI", "Web"] })])).toEqual(["iOS", "AI", "Web"]);
  });
});

describe("entryHref", () => {
  it("nests the entry under its section", () => {
    expect(entryHref(testEntry({ section: "writing", slug: "post" }))).toBe("/writing/post");
  });
});
