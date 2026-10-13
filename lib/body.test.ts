import { describe, expect, it } from "vitest";
import type { Block } from "@/types/entry";
import { bodyPieces } from "./body";

const p1: Block = { type: "p", text: "One" };
const p2: Block = { type: "p", text: "Two" };
const demo: Block = { type: "demo", text: "app" };
const video: Block = { type: "video", text: "" };

describe("bodyPieces", () => {
  it("keeps text blocks in order", () => {
    expect(bodyPieces([p1, p2]).map((x) => x.kind)).toEqual(["block", "block"]);
  });

  it("puts neighboring phones in one row", () => {
    const pieces = bodyPieces([p1, demo, video, p2]);
    expect(pieces.map((x) => x.kind)).toEqual(["block", "phones", "block"]);
    expect(pieces[1]).toMatchObject({ blocks: [demo, video] });
  });

  it("places the pull quote after the first block", () => {
    expect(bodyPieces([p1, p2], { pull: "Line" }).map((x) => x.kind)).toEqual(["block", "pull", "block"]);
  });

  it("skips the block already shown at the top of the page", () => {
    expect(bodyPieces([p1, demo, p2], { skip: demo }).map((x) => x.kind)).toEqual(["block", "block"]);
  });

  it("gives every piece a distinct key", () => {
    const keys = bodyPieces([p1, demo, video, p2], { pull: "Line" }).map((x) => x.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
