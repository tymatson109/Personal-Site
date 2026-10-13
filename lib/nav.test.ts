import { describe, expect, it } from "vitest";
import { isCurrent, navLinks } from "./nav";
import type { Section } from "@/types/entry";

const writing: Section = { slug: "writing", name: "Writing", layout: "list", order: 2 };
const projects: Section = { slug: "projects", name: "Projects", layout: "grid", order: 1 };

describe("navLinks", () => {
  it("lists sections by their order, whatever order they arrive in", () => {
    expect(navLinks([writing, projects]).map((l) => l.label)).toEqual(["Projects", "Writing", "About"]);
  });

  it("links each section to its slug", () => {
    expect(navLinks([projects])[0]).toEqual({ href: "/projects", label: "Projects" });
  });

  it("still links About when there are no sections", () => {
    expect(navLinks([])).toEqual([{ href: "/about", label: "About" }]);
  });
});

describe("isCurrent", () => {
  it("marks a link current on its own page", () => {
    expect(isCurrent("/writing", "/writing")).toBe(true);
  });

  it("marks a section current on an entry inside it", () => {
    expect(isCurrent("/writing/some-post", "/writing")).toBe(true);
  });

  it("does not mark a section current on a page that only shares its prefix", () => {
    expect(isCurrent("/writings", "/writing")).toBe(false);
  });

  it("marks nothing current on the home page", () => {
    expect(isCurrent("/", "/projects")).toBe(false);
  });
});
