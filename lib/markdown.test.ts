import { describe, expect, it } from "vitest";
import { looksLikeMarkdown, markdownToBlocks, stripInline } from "./markdown";

describe("markdownToBlocks", () => {
  it("turns headings, paragraphs, quotes and code into blocks", () => {
    const md = [
      "# Building Roomwise",
      "",
      "Photos go in,",
      "a plan comes out.",
      "",
      "> Measure twice.",
      "> Cut once.",
      "",
      "```ts",
      "const room = scan()",
      "  fit(room)",
      "```",
    ].join("\n");
    expect(markdownToBlocks(md)).toEqual([
      { type: "h", text: "Building Roomwise" },
      { type: "p", text: "Photos go in, a plan comes out." },
      { type: "quote", text: "Measure twice. Cut once." },
      { type: "code", text: "const room = scan()\n  fit(room)" },
    ]);
  });

  it("gives each list item its own paragraph with its marker", () => {
    expect(markdownToBlocks("- one\n- two\n\n1. first\n2) second")).toEqual([
      { type: "p", text: "• one" },
      { type: "p", text: "• two" },
      { type: "p", text: "1. first" },
      { type: "p", text: "2. second" },
    ]);
  });

  it("skips horizontal rules and blank lines", () => {
    expect(markdownToBlocks("Above\n\n---\n\n\nBelow")).toEqual([
      { type: "p", text: "Above" },
      { type: "p", text: "Below" },
    ]);
  });

  it("drops inline formatting but keeps the words", () => {
    expect(markdownToBlocks("Read **the** [_post_](https://x.test) on `main`.")).toEqual([
      { type: "p", text: "Read the post on main." },
    ]);
  });

  it("keeps a code block open to the end when its fence is never closed", () => {
    expect(markdownToBlocks("```\nlet a = 1")).toEqual([{ type: "code", text: "let a = 1" }]);
  });

  it("handles Windows line endings and trailing heading hashes", () => {
    expect(markdownToBlocks("## Title ##\r\nBody")).toEqual([
      { type: "h", text: "Title" },
      { type: "p", text: "Body" },
    ]);
  });
});

describe("stripInline", () => {
  it("removes images and emphasis but leaves underscores inside words", () => {
    expect(stripInline("![shot](a.png) snake_case and *em* and __strong__")).toBe("snake_case and em and strong");
  });
});

describe("looksLikeMarkdown", () => {
  it("is true for several lines or a Markdown marker", () => {
    expect(looksLikeMarkdown("one\ntwo")).toBe(true);
    expect(looksLikeMarkdown("# Title")).toBe(true);
    expect(looksLikeMarkdown("- item")).toBe(true);
  });

  it("is false for a plain sentence", () => {
    expect(looksLikeMarkdown("Just one sentence, with a - dash.")).toBe(false);
  });
});
