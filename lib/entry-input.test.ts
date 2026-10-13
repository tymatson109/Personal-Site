import { describe, expect, it } from "vitest";
import { parseEntryInput, tagsFromText, type EntryInput } from "./entry-input";

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

  it("rejects something that isn't an entry at all", () => {
    expect(parseEntryInput(null, SECTIONS)).toEqual({ ok: false, error: "Nothing to save." });
  });
});

describe("tagsFromText", () => {
  it("splits on commas, trims and drops blanks and repeats", () => {
    expect(tagsFromText(" iOS, Expo ,, iOS,AI ")).toEqual(["iOS", "Expo", "AI"]);
  });
});
