import { describe, expect, it } from "vitest";
import { readMinutes } from "./read-time";
import type { Block } from "@/types/entry";

const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");

describe("readMinutes", () => {
  it("returns one minute for a post with almost no text", () => {
    expect(readMinutes([{ type: "p", text: "Hello" }])).toBe(1);
  });

  it("rounds the word count at 220 words per minute", () => {
    expect(readMinutes([{ type: "p", text: words(660) }])).toBe(3);
  });

  it("ignores image, gallery, demo and video blocks", () => {
    const blocks: Block[] = [
      { type: "p", text: words(440) },
      { type: "image", text: words(5000) },
      { type: "demo", text: words(5000) },
    ];
    expect(readMinutes(blocks)).toBe(2);
  });

  it("does not count extra whitespace as words", () => {
    expect(readMinutes([{ type: "p", text: `  ${words(220)}   \n ` }])).toBe(1);
  });
});
