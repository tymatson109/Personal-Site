import { describe, expect, it } from "vitest";
import { parseEntryInput, parsePageInput, tagsFromText, type EntryInput } from "./entry-input";

const SECTIONS = ["projects", "writing"];
const VALID: EntryInput = {
  section: "projects",
  slug: "roomwise",
  title: "Roomwise",
  summary: "Designs a room from photos.",
  date: "2026-10-13",
  tags: ["iOS", "AI"],
  featured: true,
  status: "live",
  quote: "",
  facts: [["Platform", "iPhone"]],
  blocks: [{ type: "p", text: "Hello" }],
};

function errorFor(overrides: Record<string, unknown>) {
  const result = parseEntryInput({ ...VALID, ...overrides }, SECTIONS);
  return result.ok ? null : result.error;
}

describe("parseEntryInput", () => {
  it("accepts a complete entry unchanged", () => {
    expect(parseEntryInput(VALID, SECTIONS)).toEqual({ ok: true, input: VALID });
  });

  it("trims text fields", () => {
    const result = parseEntryInput({ ...VALID, title: "  Roomwise  ", summary: " Hi " }, SECTIONS);
    expect(result.ok && [result.input.title, result.input.summary]).toEqual(["Roomwise", "Hi"]);
  });

  it("lets a draft be saved without a title", () => {
    expect(errorFor({ title: "", status: "draft" })).toBeNull();
  });

  it("asks for a title before publishing", () => {
    expect(errorFor({ title: " " })).toBe("Give it a title before publishing.");
  });

  it("rejects a section that doesn't exist", () => {
    expect(errorFor({ section: "talks" })).toBe("Pick a section.");
  });

  it("rejects an address the database would refuse", () => {
    expect(errorFor({ slug: "Room Wise" })).toMatch(/lowercase letters/);
  });

  it("rejects a date that isn't on the calendar", () => {
    expect(errorFor({ date: "2026-02-30" })).toBe("The date isn't a real date.");
    expect(errorFor({ date: "13/10/2026" })).toBe("The date isn't a real date.");
  });

  it("rejects an unknown status", () => {
    expect(errorFor({ status: "published" })).toBe("Pick Draft or Live.");
  });

  it("drops empty text blocks and unknown block types but keeps media blocks", () => {
    const result = parseEntryInput(
      { ...VALID, blocks: [{ type: "p", text: "  " }, { type: "script", text: "x" }, { type: "video", text: "" }, { type: "h", text: "Hi" }] },
      SECTIONS,
    );
    expect(result.ok && result.input.blocks).toEqual([
      { type: "video", text: "" },
      { type: "h", text: "Hi" },
    ]);
  });

  it("drops fact rows left fully blank and needs a label on the rest", () => {
    const result = parseEntryInput({ ...VALID, facts: [["", ""], [" Role ", " Build "]] }, SECTIONS);
    expect(result.ok && result.input.facts).toEqual([["Role", "Build"]]);
    expect(errorFor({ facts: [["", "iPhone"]] })).toMatch(/needs a label/);
  });

  it("limits the number and length of tags", () => {
    expect(errorFor({ tags: Array.from({ length: 13 }, (_, i) => `t${i}`) })).toMatch(/up to 12 tags/);
    expect(errorFor({ tags: ["x".repeat(41)] })).toMatch(/up to 12 tags/);
  });

  it("rejects text that is too long", () => {
    expect(errorFor({ title: "x".repeat(201) })).toMatch(/title/);
    expect(errorFor({ blocks: [{ type: "p", text: "x".repeat(20001) }] })).toMatch(/too long/);
  });

  it("keeps an image block's file and caption, and an empty upload block so it can be filled later", () => {
    const photo = { url: "https://a.public.blob.vercel-storage.com/media/x.jpg", alt: "A desk", width: 4, height: 3 };
    const blocks = [{ type: "image", text: "Caption", media: [photo] }, { type: "gallery", text: "" }];
    const result = parseEntryInput({ ...VALID, blocks }, SECTIONS);
    expect(result.ok && result.input.blocks).toEqual(blocks);
  });

  it("rejects an image description that is too long", () => {
    const photo = { url: "https://a.public.blob.vercel-storage.com/media/x.jpg", alt: "x".repeat(501), width: 4, height: 3 };
    expect(errorFor({ blocks: [{ type: "image", text: "", media: [photo] }] })).toMatch(/description/);
  });

  it("rejects something that isn't an entry at all", () => {
    expect(parseEntryInput(null, SECTIONS)).toEqual({ ok: false, error: "Nothing to save." });
  });
});

describe("tagsFromText", () => {
  it("splits on commas, trims and drops blanks and repeats", () => {
    expect(tagsFromText(" iOS, Expo ,, iOS,AI ")).toEqual(["iOS", "Expo", "AI"]);
  });
});

describe("parsePageInput", () => {
  const PAGE = { title: "Hi, I’m Ty.", intro: "I build apps.", blocks: [{ type: "p", text: "Story" }] };

  it("accepts a page's headline, opening line and story, trimmed", () => {
    expect(parsePageInput({ ...PAGE, title: "  Hi, I’m Ty.  " })).toEqual({ ok: true, input: PAGE });
  });

  it("drops empty text blocks from the story", () => {
    const result = parsePageInput({ ...PAGE, blocks: [{ type: "p", text: "  " }, ...PAGE.blocks] });
    expect(result.ok && result.input.blocks).toEqual(PAGE.blocks);
  });

  it("refuses a page with no headline, since a page is always live", () => {
    expect(parsePageInput({ ...PAGE, title: "  " })).toMatchObject({ ok: false, error: expect.stringMatching(/headline/) });
  });

  it("refuses an opening line or story that is too long", () => {
    expect(parsePageInput({ ...PAGE, intro: "x".repeat(501) })).toMatchObject({ ok: false, error: expect.stringMatching(/opening line/) });
    expect(parsePageInput({ ...PAGE, blocks: [{ type: "p", text: "x".repeat(20001) }] })).toMatchObject({ ok: false, error: expect.stringMatching(/too long/) });
  });

  it("refuses something that isn't a page at all", () => {
    expect(parsePageInput("about")).toEqual({ ok: false, error: "Nothing to save." });
  });
});
