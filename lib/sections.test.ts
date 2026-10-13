import { describe, expect, it } from "vitest";
import { entryCount, isSameSet, newSectionSlug, parseSectionInput, sectionView, type AdminSection } from "./sections";

const NOW = new Date("2026-10-13T12:00:00Z");

function section(slug: string, order: number, deletedAt: string | null = null): AdminSection {
  return { slug, name: slug, layout: "grid", order, entries: 0, deletedAt };
}

describe("parseSectionInput", () => {
  it("accepts a name and layout, trimming the name", () => {
    expect(parseSectionInput({ name: "  Talks ", layout: "list" })).toEqual({ ok: true, input: { name: "Talks", layout: "list" } });
  });

  it("asks for a name when it is empty", () => {
    expect(parseSectionInput({ name: "   ", layout: "grid" })).toEqual({ ok: false, error: "Give the section a name." });
  });

  it("rejects a name that is too long and a layout that doesn't exist", () => {
    expect(parseSectionInput({ name: "x".repeat(41), layout: "grid" }).ok).toBe(false);
    expect(parseSectionInput({ name: "Talks", layout: "masonry" })).toEqual({ ok: false, error: "Pick Grid or List." });
  });

  it("rejects something that isn't a section at all", () => {
    expect(parseSectionInput(null).ok).toBe(false);
  });
});

describe("newSectionSlug", () => {
  it("makes the address from the name", () => {
    expect(newSectionSlug("Side Projects", ["projects"])).toEqual({ ok: true, slug: "side-projects" });
  });

  it("refuses an address the site already uses for a page", () => {
    expect(newSectionSlug("About", []).ok).toBe(false);
    expect(newSectionSlug("Admin", []).ok).toBe(false);
  });

  it("refuses an address another section holds, including a removed one", () => {
    expect(newSectionSlug("Writing", ["writing"])).toEqual({
      ok: false,
      error: "A section already uses /writing, or did recently. Try another name.",
    });
  });

  it("refuses a name with no letters or numbers", () => {
    expect(newSectionSlug("!!!", []).ok).toBe(false);
  });
});

describe("isSameSet", () => {
  it("accepts the current sections in a new order", () => {
    expect(isSameSet(["writing", "projects"], ["projects", "writing"])).toBe(true);
  });

  it("rejects an order that drops, repeats or invents a section", () => {
    expect(isSameSet(["projects"], ["projects", "writing"])).toBe(false);
    expect(isSameSet(["projects", "projects"], ["projects", "writing"])).toBe(false);
    expect(isSameSet(["projects", "talks"], ["projects", "writing"])).toBe(false);
    expect(isSameSet("projects,writing", ["projects", "writing"])).toBe(false);
  });
});

describe("sectionView", () => {
  it("lists current sections in nav order", () => {
    const { current } = sectionView([section("writing", 2), section("projects", 1)], NOW);
    expect(current.map((s) => s.slug)).toEqual(["projects", "writing"]);
  });

  it("lists removed sections newest first, leaving out ones too old to restore", () => {
    const { removed } = sectionView(
      [section("old", 1, "2026-09-01T00:00:00Z"), section("a", 2, "2026-10-10T00:00:00Z"), section("b", 3, "2026-10-12T00:00:00Z")],
      NOW,
    );
    expect(removed.map((s) => s.slug)).toEqual(["b", "a"]);
  });
});

describe("entryCount", () => {
  it("says entry for one and entries otherwise", () => {
    expect(entryCount(1)).toBe("1 entry");
    expect(entryCount(0)).toBe("0 entries");
  });
});
