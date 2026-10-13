import { describe, expect, it } from "vitest";
import { follow, holdsForReveal, revealDelay, words } from "./motion";

describe("holdsForReveal", () => {
  it("holds content that starts below the first screen", () => {
    expect(holdsForReveal(900, 800)).toBe(true);
  });

  it("never holds content already on screen", () => {
    expect(holdsForReveal(400, 800)).toBe(false);
  });
});

describe("revealDelay", () => {
  it("staggers neighbors a beat apart", () => {
    expect([0, 1, 2].map(revealDelay)).toEqual([0, 70, 140]);
  });

  it("starts each group of three over, so long lists stay quick", () => {
    expect(revealDelay(3)).toBe(0);
  });
});

describe("follow", () => {
  it("moves a fifth of the way toward the target each frame", () => {
    expect(follow(0, 100)).toBe(20);
  });

  it("stays put once it has arrived", () => {
    expect(follow(50, 50)).toBe(50);
  });
});

describe("words", () => {
  it("splits a headline on any run of spaces", () => {
    expect(words("  Hi,   I’m Ty. ")).toEqual(["Hi,", "I’m", "Ty."]);
  });
});
