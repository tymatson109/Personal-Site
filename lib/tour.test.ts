import { describe, expect, it } from "vitest";
import { clamp01, easeOut, nameDrift, nameFill, storyReveal } from "./tour";

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

describe("nameFill", () => {
  it("is empty while the name is still low on the screen", () => {
    expect(nameFill(900, 1000)).toBe(0);
  });

  it("is half full halfway between the start and end lines", () => {
    expect(nameFill(625, 1000)).toBeCloseTo(0.5);
  });

  it("is full once the name passes the end line and stays full above it", () => {
    expect(nameFill(400, 1000)).toBe(1);
    expect(nameFill(-300, 1000)).toBe(1);
  });
});

describe("nameDrift", () => {
  it("is zero when the name sits in the middle of the screen", () => {
    expect(nameDrift(500, 1000, 0)).toBeCloseTo(0);
  });

  it("drifts alternate rows in opposite directions", () => {
    expect(nameDrift(900, 1000, 0)).toBeLessThan(0);
    expect(nameDrift(900, 1000, 1)).toBeGreaterThan(0);
  });
});

describe("storyReveal", () => {
  it("stays hidden until the name is a third filled", () => {
    expect(storyReveal(0.3)).toBe(0);
  });

  it("is fully shown once the name is mostly filled", () => {
    expect(storyReveal(0.85)).toBe(1);
  });
});
