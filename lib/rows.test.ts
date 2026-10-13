import { describe, expect, it } from "vitest";
import { toAdminEntry, toAdminSection, toBlocks, toEntry, toFacts, toMedia, toPage, toSection } from "./rows";

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

const PHOTO = { url: "https://abc.public.blob.vercel-storage.com/media/desk-x1.jpg", alt: "A desk", width: 1200, height: 800 };

describe("toMedia", () => {
  it("keeps a file from the site's store with its size and alt text", () => {
    expect(toMedia([PHOTO])).toEqual([PHOTO]);
  });

  it("drops files from other hosts, plain http, and files without a size", () => {
    expect(
      toMedia([
        { ...PHOTO, url: "https://evil.example.com/x.jpg" },
        { ...PHOTO, url: "http://abc.public.blob.vercel-storage.com/x.jpg" },
        { ...PHOTO, width: 0 },
        { ...PHOTO, height: "800" },
        "x",
      ]),
    ).toEqual([]);
  });

  it("gives a file without alt text an empty one", () => {
    expect(toMedia([{ ...PHOTO, alt: undefined }])[0].alt).toBe("");
  });
});

describe("toBlocks with media", () => {
  it("keeps the files of an image block alongside its caption", () => {
    expect(toBlocks([{ type: "image", text: "Caption", media: [PHOTO] }])).toEqual([
      { type: "image", text: "Caption", media: [PHOTO] },
    ]);
  });

  it("keeps only as many files as the block holds", () => {
    expect(toBlocks([{ type: "image", text: "", media: [PHOTO, PHOTO] }])[0].media).toHaveLength(1);
  });

  it("drops files attached to a text block", () => {
    expect(toBlocks([{ type: "p", text: "Hi", media: [PHOTO] }])).toEqual([{ type: "p", text: "Hi" }]);
  });
});

describe("toAdminSection", () => {
  it("keeps the section with its entry count and removal time", () => {
    expect(
      toAdminSection({ slug: "talks", name: "Talks", layout: "grid", order: 3, entries: 2, deletedAt: "2026-10-12T09:00:00Z" }),
    ).toEqual({ slug: "talks", name: "Talks", layout: "grid", order: 3, entries: 2, deletedAt: "2026-10-12T09:00:00Z" });
  });

  it("reads a missing count as none and a missing removal time as not removed", () => {
    expect(toAdminSection({ slug: "talks", name: "Talks", layout: "grid", order: 3 })).toMatchObject({ entries: 0, deletedAt: null });
  });
});
