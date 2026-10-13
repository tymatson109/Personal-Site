import { describe, expect, it } from "vitest";
import { dotAt, dotGap, pointerReach } from "./dot-field";

describe("dotAt", () => {
  it("swells and turns blue right under the pointer", () => {
    const d = dotAt(100, 100, 0, { x: 100, y: 100 }, 50);
    expect(d.hot).toBe(true);
    expect(d.radius).toBeGreaterThan(5);
  });

  it("is unaffected by a pointer beyond its reach", () => {
    expect(dotAt(100, 100, 2, { x: 400, y: 400 }, 50)).toEqual(dotAt(100, 100, 2, null, 50));
  });

  it("never shrinks below its base size", () => {
    for (let t = 0; t < 10; t += 0.7) expect(dotAt(37, 91, t, null, 50).radius).toBeGreaterThanOrEqual(1);
  });

  it("changes over time, so the wave travels", () => {
    expect(dotAt(50, 50, 0, null, 50)).not.toEqual(dotAt(50, 50, 1.3, null, 50));
  });
});

describe("dotGap and pointerReach", () => {
  it("packs dots tighter on phone widths", () => {
    expect(dotGap(390)).toBeLessThan(dotGap(1200));
  });

  it("scales the pointer's reach with the shorter side", () => {
    expect(pointerReach(1000, 500)).toBeCloseTo(110);
  });
});
