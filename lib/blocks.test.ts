import { describe, expect, it } from "vitest";
import { blockMenu, isMediaBlock, isPhoneBlock, isShown, isSlashCommand, isTextBlock } from "./blocks";

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

describe("isShown", () => {
  const photo = { url: "https://a.public.blob.vercel-storage.com/media/x.jpg", alt: "", width: 4, height: 3 };

  it("shows text blocks as they are", () => {
    expect(isShown({ type: "p", text: "" })).toBe(true);
  });

  it("shows a live demo only once it has an https address", () => {
    expect(isShown({ type: "demo", text: "https://roomwise-demo.vercel.app" })).toBe(true);
    expect(isShown({ type: "demo", text: "Roomwise" })).toBe(false);
  });

  it("shows an image, gallery or recording only once it has a file", () => {
    expect(isShown({ type: "gallery", text: "Trip" })).toBe(false);
    expect(isShown({ type: "gallery", text: "Trip", media: [photo] })).toBe(true);
    expect(isShown({ type: "video", text: "", media: [] })).toBe(false);
  });
});

describe("blockMenu", () => {
  it("offers every text block, then every upload block and the live demo, for a bare slash", () => {
    expect(blockMenu("/")).toEqual(["p", "h", "quote", "code", "image", "gallery", "video", "demo"]);
  });

  it("finds the upload blocks by name", () => {
    expect(blockMenu("/im")).toEqual(["image"]);
    expect(blockMenu("/phone")).toEqual(["video"]);
    expect(blockMenu("/live")).toEqual(["demo"]);
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
