import { describe, expect, it } from "vitest";
import { activeStop, stopFrame, stopProgress, tourTarget } from "./tour";

describe("stopProgress", () => {
  it("is 0 before the stop reaches the header", () => {
    expect(stopProgress(500, 60, 2000, 700)).toBe(0);
  });

  it("is halfway when the stop has scrolled half its pinned distance", () => {
    expect(stopProgress(60 - 650, 60, 2000, 700)).toBeCloseTo(0.5);
  });

  it("stops at 1 after the stop lets go", () => {
    expect(stopProgress(-5000, 60, 2000, 700)).toBe(1);
  });
});

describe("stopFrame", () => {
  it("starts with the media lowered, shrunk and the text faded", () => {
    const f = stopFrame(0);
    expect(f.mediaY).toBe(80);
    expect(f.mediaScale).toBeCloseTo(0.84);
    expect(f.textOpacity).toBeCloseTo(0.15);
  });

  it("ends with everything in place and fully shown", () => {
    const f = stopFrame(1);
    expect(f.mediaY).toBe(0);
    expect(f.mediaScale).toBe(1);
    expect(f.textOpacity).toBe(1);
    expect(f.textY).toBe(0);
    expect(f.tagOpacity(3)).toBe(1);
  });

  it("brings later tags in after earlier ones", () => {
    const f = stopFrame(0.36);
    expect(f.tagOpacity(0)).toBeGreaterThan(f.tagOpacity(1));
  });
});

describe("activeStop", () => {
  const rects = [
    { top: -900, bottom: 100 },
    { top: 40, bottom: 2000 },
    { top: 2000, bottom: 4000 },
  ];

  it("picks the pinned stop that still covers the middle of the screen", () => {
    expect(activeStop(rects, 60, 800)).toBe(1);
  });

  it("is -1 before the tour starts", () => {
    expect(activeStop([{ top: 900, bottom: 3000 }], 60, 800)).toBe(-1);
  });
});

describe("tourTarget", () => {
  it("starts at the first stop", () => {
    expect(tourTarget("start", -1, 3)).toEqual({ kind: "stop", index: 0 });
  });

  it("goes to the next stop", () => {
    expect(tourTarget("next", 0, 3)).toEqual({ kind: "stop", index: 1 });
  });

  it("goes past the tour after the last stop", () => {
    expect(tourTarget("next", 2, 3)).toEqual({ kind: "after" });
  });

  it("goes back to the tour intro from the first stop", () => {
    expect(tourTarget("prev", 0, 3)).toEqual({ kind: "intro" });
  });

  it("exits to the top of the page", () => {
    expect(tourTarget("exit", 1, 3)).toEqual({ kind: "top" });
  });
});
