import { describe, expect, it } from "vitest";
import { isSlug, slugify } from "./slug";

describe("slugify", () => {
  it("joins lowercase words with hyphens", () => {
    expect(slugify("Building Roomwise, Part 2")).toBe("building-roomwise-part-2");
  });

  it("drops accents and apostrophes instead of splitting on them", () => {
    expect(slugify("Ty’s café notes")).toBe("tys-cafe-notes");
  });

  it("trims hyphens from the ends", () => {
    expect(slugify("  — Hello! —  ")).toBe("hello");
  });

  it("returns an empty string when nothing usable is left", () => {
    expect(slugify("!!!")).toBe("");
  });

  it("keeps long titles within 80 characters without a trailing hyphen", () => {
    const slug = slugify(`${"word ".repeat(30)}`);
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(isSlug(slug)).toBe(true);
  });
});

describe("isSlug", () => {
  it("accepts lowercase words joined by single hyphens", () => {
    expect(isSlug("roomwise-2")).toBe(true);
  });

  it("rejects capitals, spaces, doubled or edge hyphens", () => {
    for (const bad of ["Roomwise", "room wise", "room--wise", "-room", "room-", "", 7]) {
      expect(isSlug(bad)).toBe(false);
    }
  });
});
