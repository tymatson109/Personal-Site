import { describe, expect, it } from "vitest";
import { mailto, substackSubscribe } from "./links";

describe("links", () => {
  it("builds a mailto link", () => {
    expect(mailto("a@b.co")).toBe("mailto:a@b.co");
  });

  it("builds the Substack subscribe page with or without a trailing slash", () => {
    expect(substackSubscribe("https://x.substack.com/")).toBe("https://x.substack.com/subscribe");
    expect(substackSubscribe("https://x.substack.com")).toBe("https://x.substack.com/subscribe");
  });
});
