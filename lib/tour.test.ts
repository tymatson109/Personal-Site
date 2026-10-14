import { describe, expect, it } from "vitest";
import { blendFlood, clamp01, easeOut, floodAmount, floodStep, FLOOD_RANGE, INK_SWITCH } from "./tour";

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

describe("blendFlood", () => {
  const green: [number, number, number] = [27, 58, 47];
  const gray: [number, number, number] = [233, 236, 234];

  it("shows nothing when no stop has any flood", () => {
    expect(blendFlood([{ rgb: gray, amount: 0 }])).toEqual({ rgb: null, coverage: 0, lead: -1 });
  });

  it("shows one stop's own color while it is the only one flooding", () => {
    expect(blendFlood([{ rgb: gray, amount: 0.6 }, { rgb: green, amount: 0 }])).toEqual({ rgb: gray, coverage: 0.6, lead: 0 });
  });

  it("mixes two stops evenly at the point where they flood equally", () => {
    expect(blendFlood([{ rgb: gray, amount: 0.5 }, { rgb: green, amount: 0.5 }])).toEqual({ rgb: [130, 147, 141], coverage: 0.5, lead: 0 });
  });

  it("leans toward and is led by whichever stop floods more", () => {
    const blend = blendFlood([{ rgb: gray, amount: 0.2 }, { rgb: green, amount: 0.8 }]);
    expect(blend.lead).toBe(1);
    expect(blend.coverage).toBe(0.8);
    expect(blend.rgb![0]).toBeLessThan(80);
  });

  it("skips stops whose app has no splash color", () => {
    expect(blendFlood([{ rgb: null, amount: 1 }, { rgb: green, amount: 0.3 }])).toEqual({ rgb: green, coverage: 0.3, lead: 1 });
  });
});
