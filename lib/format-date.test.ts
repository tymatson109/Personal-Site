import { describe, expect, it } from "vitest";
import { formatDate, pad2 } from "./format-date";

describe("formatDate", () => {
  it("shows the day for posts", () => {
    expect(formatDate("2026-09-28")).toBe("Sep 28, 2026");
  });

  it("shows only the month for projects", () => {
    expect(formatDate("2026-09-01", "month")).toBe("Sep 2026");
  });

  it("keeps the first of the month in that month whatever the time zone", () => {
    expect(formatDate("2026-01-01", "month")).toBe("Jan 2026");
  });
});

describe("pad2", () => {
  it("pads single digits to two", () => {
    expect(pad2(3)).toBe("03");
  });

  it("leaves two digits alone", () => {
    expect(pad2(12)).toBe("12");
  });
});
