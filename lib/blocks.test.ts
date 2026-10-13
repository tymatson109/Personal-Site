import { describe, expect, it } from "vitest";
import { blockMenu, isMediaBlock, isPhoneBlock, isSlashCommand, isTextBlock } from "./blocks";

describe("block kinds", () => {
  it("puts demos and recordings in a phone", () => {
    expect(isPhoneBlock({ type: "demo", text: "" })).toBe(true);
    expect(isPhoneBlock({ type: "image", text: "" })).toBe(false);
  });

  it("separates text blocks from media blocks", () => {
    expect(isTextBlock({ type: "quote", text: "" })).toBe(true);
    expect(isTextBlock({ type: "gallery", text: "" })).toBe(false);
    expect(isMediaBlock({ type: "gallery", text: "" })).toBe(true);
  });
});

describe("blockMenu", () => {
  it("offers every text block for a bare slash", () => {
    expect(blockMenu("/")).toEqual(["p", "h", "quote", "code"]);
  });

  it("narrows by the start of the block's name, ignoring case", () => {
    expect(blockMenu("/He")).toEqual(["h"]);
    expect(blockMenu("/q")).toEqual(["quote"]);
  });

  it("offers nothing when no name matches", () => {
    expect(blockMenu("/zzz")).toEqual([]);
  });
});

describe("isSlashCommand", () => {
  it("is true for a slash and one partial word", () => {
    expect(isSlashCommand("/")).toBe(true);
    expect(isSlashCommand("/head")).toBe(true);
  });

  it("is false once there is a space or text before the slash", () => {
    expect(isSlashCommand("/head ing")).toBe(false);
    expect(isSlashCommand("a/b")).toBe(false);
  });
});
