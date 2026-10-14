import { describe, expect, it } from "vitest";
import { activeStory, clamp01, storyProgress } from "./tour";

describe("clamp01", () => {
  it("keeps a value between 0 and 1", () => {
    expect(clamp01(-2)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(3)).toBe(1);
  });
});

describe("activeStory", () => {
  it("shows the first story before any story has reached the line", () => {
    expect(activeStory([900, 1800, 2700], 500)).toBe(0);
  });

  it("shows the last story whose top has passed the line", () => {
    expect(activeStory([-900, 300, 1200], 500)).toBe(1);
  });

  it("shows the final story once every story has passed the line", () => {
    expect(activeStory([-2000, -1000, -100], 500)).toBe(2);
  });

  it("gives 0 when there are no stories", () => {
    expect(activeStory([], 500)).toBe(0);
  });
});

describe("storyProgress", () => {
  it("is 0 before the story reaches the line", () => {
    expect(storyProgress(800, 600, 500)).toBe(0);
  });

  it("is halfway when half the story has passed the line", () => {
    expect(storyProgress(200, 600, 500)).toBeCloseTo(0.5);
  });

  it("stops at 1 once the whole story has passed the line", () => {
    expect(storyProgress(-900, 600, 500)).toBe(1);
  });
});
