import { describe, expect, it } from "vitest";
import type { Section } from "@/types/entry";
import { adminMeta, adminView, isEntryId, isRestorable, sectionFilter, type AdminEntry } from "./admin-entries";
import { testEntry } from "./test-entry";

const NOW = new Date("2026-10-13T12:00:00Z");
const SECTIONS: Section[] = [
  { slug: "projects", name: "Projects", layout: "grid", order: 1 },
  { slug: "writing", name: "Writing", layout: "list", order: 2 },
];

function item(overrides: Parameters<typeof testEntry>[0], deletedAt: string | null = null): AdminEntry {
  return { entry: testEntry(overrides), deletedAt };
}

describe("isEntryId", () => {
  it("accepts a uuid", () => {
    expect(isEntryId("0b6c5c1e-3c1a-4d55-9d4e-1f7f8c2f3a10")).toBe(true);
  });

  it("rejects anything else a browser could send", () => {
    expect(isEntryId("1; drop table entries")).toBe(false);
    expect(isEntryId("")).toBe(false);
    expect(isEntryId(42)).toBe(false);
    expect(isEntryId(undefined)).toBe(false);
  });
});

describe("isRestorable", () => {
  it("keeps an entry deleted within the last 30 days", () => {
    expect(isRestorable("2026-09-14T12:00:01Z", NOW)).toBe(true);
  });

  it("drops an entry deleted 30 days ago or more", () => {
    expect(isRestorable("2026-09-13T12:00:00Z", NOW)).toBe(false);
  });

  it("drops a deletion time it can't read", () => {
    expect(isRestorable("yesterday", NOW)).toBe(false);
  });
});

describe("sectionFilter", () => {
  it("narrows to a real section", () => {
    expect(sectionFilter(SECTIONS, "writing")).toBe("writing");
  });

  it("shows everything for a missing or unknown section", () => {
    expect(sectionFilter(SECTIONS, undefined)).toBeUndefined();
    expect(sectionFilter(SECTIONS, "talks")).toBeUndefined();
    expect(sectionFilter(SECTIONS, ["writing"])).toBeUndefined();
  });
});

describe("adminView", () => {
  const items = [
    item({ id: "old", date: "2026-01-01", status: "draft" }),
    item({ id: "new", date: "2026-06-01" }),
    item({ id: "post", section: "writing", date: "2026-07-01" }),
    item({ id: "gone", date: "2026-05-01" }, "2026-10-12T09:00:00Z"),
    item({ id: "gone-earlier", date: "2026-05-01" }, "2026-10-01T09:00:00Z"),
    item({ id: "purged", date: "2026-05-01" }, "2026-08-01T09:00:00Z"),
  ];

  it("lists drafts and live entries together, newest first", () => {
    expect(adminView(items, undefined, NOW).current.map((e) => e.id)).toEqual(["post", "new", "old"]);
  });

  it("narrows both lists to one section", () => {
    const view = adminView(items, "writing", NOW);
    expect(view.current.map((e) => e.id)).toEqual(["post"]);
    expect(view.deleted).toEqual([]);
  });

  it("shows recently deleted entries, newest deletion first, and hides ones past the restore window", () => {
    expect(adminView(items, undefined, NOW).deleted.map((e) => e.id)).toEqual(["gone", "gone-earlier"]);
  });
});

describe("adminMeta", () => {
  it("names the section, date and status", () => {
    expect(adminMeta(testEntry({ date: "2026-10-13", status: "draft" }), "Projects")).toEqual(["Projects", "Oct 13, 2026", "Draft"]);
  });

  it("marks featured and Substack entries", () => {
    expect(adminMeta(testEntry({ date: "2026-10-13", featured: true, source: "substack" }), "Writing")).toEqual([
      "Writing",
      "Oct 13, 2026",
      "Live",
      "Featured",
      "Substack",
    ]);
  });
});
