import { describe, expect, it } from "vitest";
import { clamp01, easeOut, floodAmount, floodStep, FLOOD_RANGE, INK_SWITCH } from "./tour";

describe("clamp01", () => {
  it("keeps a value between 0 and 1", () => {
    expect(clamp01(-2)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(3)).toBe(1);
  });
});

describe("easeOut", () => {
  it("starts at 0, ends at 1 and runs ahead of linear in between", () => {
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
    expect(easeOut(0.5)).toBeGreaterThan(0.5);
  });
});

describe("floodAmount", () => {
  it("is full when the project's middle sits on the screen's middle", () => {
    expect(floodAmount(0, 1000, 1000)).toBe(1);
  });

  it("is empty once the project is a whole range away, above or below", () => {
    expect(floodAmount(1000 * FLOOD_RANGE, 1000, 1000)).toBe(0);
    expect(floodAmount(-1000 * FLOOD_RANGE, 1000, 1000)).toBe(0);
    expect(floodAmount(5000, 1000, 1000)).toBe(0);
  });

  it("pours in the same way scrolling down as it drains scrolling back up", () => {
    expect(floodAmount(300, 1000, 1000)).toBeCloseTo(floodAmount(-300, 1000, 1000));
  });

  it("grows as the project nears the middle", () => {
    expect(floodAmount(200, 1000, 1000)).toBeGreaterThan(floodAmount(500, 1000, 1000));
  });
});

describe("floodStep", () => {
  it("swaps straight to full color at the point the text switches, and to none below it", () => {
    expect(floodStep(INK_SWITCH)).toBe(1);
    expect(floodStep(INK_SWITCH - 0.01)).toBe(0);
  });
});
