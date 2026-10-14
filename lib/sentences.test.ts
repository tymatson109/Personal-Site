import { describe, expect, it } from "vitest";
import type { Block } from "@/types/entry";
import { quotablePassages } from "./sentences";

describe("quotablePassages", () => {
  it("splits each paragraph into its sentences", () => {
    expect(quotablePassages([{ type: "p", text: "Small apps win. They ship fast! Do they last?" }], 500)).toEqual([
      { key: 0, sentences: ["Small apps win.", "They ship fast!", "Do they last?"] },
    ]);
  });

  it("offers sentences from quotes and leaves out headings, code and media", () => {
    const blocks: Block[] = [
      { type: "h", text: "A heading" },
      { type: "code", text: "const a = 1;" },
      { type: "quote", text: "A quoted line." },
      { type: "image", text: "A caption.", media: [] },
    ];
    expect(quotablePassages(blocks, 500)).toEqual([{ key: 2, sentences: ["A quoted line."] }]);
  });

  it("treats each line of a block as its own sentence", () => {
    expect(quotablePassages([{ type: "quote", text: "First line\nSecond line" }], 500)).toEqual([
      { key: 0, sentences: ["First line", "Second line"] },
    ]);
  });

  it("leaves out sentences longer than a quote can be and paragraphs with nothing left", () => {
    expect(quotablePassages([{ type: "p", text: "Short one. This sentence is far too long." }, { type: "p", text: "Also far too long." }], 12)).toEqual([
      { key: 0, sentences: ["Short one."] },
    ]);
  });

  it("returns nothing for a post with no text yet", () => {
    expect(quotablePassages([{ type: "p", text: "  " }], 500)).toEqual([]);
  });
});
