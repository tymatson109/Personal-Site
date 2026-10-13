import { describe, expect, it } from "vitest";
import { toAdminEntry, toBlocks, toEntry, toFacts, toPage, toSection } from "./rows";

const ENTRY_ROW = {
  id: "0b6c5c1e-3c1a-4d55-9d4e-1f7f8c2f3a10",
  section: "projects",
  slug: "roomwise",
  title: "Roomwise",
  summary: "Designs a room from photos.",
  date: "2026-09-01",
  tags: ["iOS", "AI"],
  featured: true,
  status: "live",
  source: "site",
  quote: "",
  facts: [["Platform", "iPhone"]],
  blocks: [{ type: "p", text: "Hello" }],
};

describe("toEntry", () => {
  it("turns a well-formed row into the same entry", () => {
    expect(toEntry(ENTRY_ROW)).toEqual(ENTRY_ROW);
  });

  it("reads an unknown status as draft so the entry stays hidden", () => {
    expect(toEntry({ ...ENTRY_ROW, status: "published" }).status).toBe("draft");
  });

  it("falls back to empty text and lists when columns are missing", () => {
    const entry = toEntry({});
    expect(entry.title).toBe("");
    expect(entry.tags).toEqual([]);
    expect(entry.blocks).toEqual([]);
    expect(entry.featured).toBe(false);
    expect(entry.source).toBe("site");
  });

  it("drops tags that are not strings", () => {
    expect(toEntry({ ...ENTRY_ROW, tags: ["iOS", 3, null] }).tags).toEqual(["iOS"]);
  });
});

describe("toBlocks", () => {
  it("keeps blocks of a known type and drops the rest", () => {
    expect(toBlocks([{ type: "h", text: "Title" }, { type: "script", text: "x" }, "p", null])).toEqual([
      { type: "h", text: "Title" },
    ]);
  });

  it("gives a block without text an empty string", () => {
    expect(toBlocks([{ type: "video" }])).toEqual([{ type: "video", text: "" }]);
  });

  it("returns no blocks when the value is not a list", () => {
    expect(toBlocks({ type: "p", text: "x" })).toEqual([]);
  });
});

describe("toFacts", () => {
  it("keeps only label and value pairs of strings", () => {
    expect(toFacts([["Role", "Build"], ["Year", 2026], ["Only one"], "x"])).toEqual([["Role", "Build"]]);
  });
});

describe("toSection", () => {
  it("turns a row into a section with its order", () => {
    expect(toSection({ slug: "writing", name: "Writing", layout: "list", order: 2 })).toEqual({
      slug: "writing",
      name: "Writing",
      layout: "list",
      order: 2,
    });
  });

  it("reads an unknown layout as a list", () => {
    expect(toSection({ slug: "x", name: "X", layout: "masonry", order: 1 }).layout).toBe("list");
  });
});

describe("toPage", () => {
  it("turns a row into a page with checked blocks", () => {
    expect(toPage({ slug: "about", title: "About", blocks: [{ type: "p", text: "Hi" }, { type: "nope" }] })).toEqual({
      slug: "about",
      title: "About",
      blocks: [{ type: "p", text: "Hi" }],
    });
  });
});

describe("toAdminEntry", () => {
  it("keeps the deletion time alongside the entry", () => {
    expect(toAdminEntry({ ...ENTRY_ROW, deletedAt: "2026-10-12T09:00:00Z" })).toEqual({
      entry: ENTRY_ROW,
      deletedAt: "2026-10-12T09:00:00Z",
    });
  });

  it("reads a missing deletion time as not deleted", () => {
    expect(toAdminEntry(ENTRY_ROW).deletedAt).toBeNull();
  });
});
