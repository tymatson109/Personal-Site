import { describe, expect, it } from "vitest";
import {
  canContinue,
  demoAddress,
  emptyDraft,
  freeSlug,
  hasAnswers,
  isSkipped,
  LIKELY_FACTS,
  NEW_ENTRY_STEPS,
  newEntryInput,
  toNewEntryDraft,
  type NewEntryDraft,
} from "./new-entry";

const draft = (change: Partial<NewEntryDraft> = {}): NewEntryDraft => ({ ...emptyDraft("grid"), ...change });

describe("NEW_ENTRY_STEPS", () => {
  it("asks a project for its demo and facts, and writing only for its name and line", () => {
    expect(NEW_ENTRY_STEPS.grid).toEqual(["name", "summary", "demo", "facts", "publish"]);
    expect(NEW_ENTRY_STEPS.list).toEqual(["name", "summary", "publish"]);
  });
});

describe("emptyDraft", () => {
  it("offers a project the usual fact labels with nothing filled in", () => {
    expect(emptyDraft("grid").facts).toEqual(LIKELY_FACTS.map((label) => [label, ""]));
  });

  it("offers writing no facts", () => {
    expect(emptyDraft("list").facts).toEqual([]);
  });
});

describe("demoAddress", () => {
  it("adds https:// to an address copied without it", () => {
    expect(demoAddress(" cambio-demo-alpha.vercel.app ")).toBe("https://cambio-demo-alpha.vercel.app");
  });

  it("keeps an address that already names its scheme, so a plain http one is still refused later", () => {
    expect(demoAddress("https://a.vercel.app")).toBe("https://a.vercel.app");
    expect(demoAddress("http://a.vercel.app")).toBe("http://a.vercel.app");
  });

  it("leaves an empty answer empty", () => {
    expect(demoAddress("   ")).toBe("");
  });
});

describe("canContinue", () => {
  it("needs a name before moving on", () => {
    expect(canContinue("name", draft())).toBe(false);
    expect(canContinue("name", draft({ title: "Cambio" }))).toBe(true);
  });

  it("lets the demo be skipped, or moves on once its address can play", () => {
    expect(canContinue("demo", draft())).toBe(true);
    expect(canContinue("demo", draft({ demo: "cambio-demo.vercel.app" }))).toBe(true);
  });

  it("holds on a demo address the site would refuse to play", () => {
    expect(canContinue("demo", draft({ demo: "http://cambio-demo.vercel.app" }))).toBe(false);
    expect(canContinue("demo", draft({ demo: "not an address" }))).toBe(false);
  });
});

describe("isSkipped", () => {
  it("reads an empty demo or facts with no values as skipped", () => {
    expect(isSkipped("demo", draft())).toBe(true);
    expect(isSkipped("facts", draft())).toBe(true);
    expect(isSkipped("facts", draft({ facts: [["Role", "Solo"]] }))).toBe(false);
  });

  it("never reads a required step as skipped", () => {
    expect(isSkipped("name", draft())).toBe(false);
  });
});

describe("hasAnswers", () => {
  it("is false until something is typed, since the offered fact labels alone are not an answer", () => {
    expect(hasAnswers(draft())).toBe(false);
    expect(hasAnswers(draft({ summary: "A card game" }))).toBe(true);
    expect(hasAnswers(draft({ facts: [["Role", "Solo"]] }))).toBe(true);
  });
});

describe("freeSlug", () => {
  it("uses the title's slug when the section has none like it", () => {
    expect(freeSlug("Cambio!", ["roomwise"])).toBe("cambio");
  });

  it("numbers the slug when the section already used it", () => {
    expect(freeSlug("Cambio", ["cambio", "cambio-2"])).toBe("cambio-3");
  });

  it("falls back to untitled for a title with no letters or numbers", () => {
    expect(freeSlug("!!!", [])).toBe("untitled");
  });

  it("keeps a numbered slug within the address length limit", () => {
    const long = "a".repeat(80);
    expect(freeSlug(long, [long])).toHaveLength(80);
  });
});

describe("newEntryInput", () => {
  const place = { section: "projects", slug: "cambio", date: "2026-10-13" };

  it("turns the answers into an entry with the demo as its one block", () => {
    const input = newEntryInput(draft({ title: "Cambio", summary: "A card game", demo: "cambio-demo.vercel.app", featured: true }), place, "live");
    expect(input).toMatchObject({ ...place, title: "Cambio", summary: "A card game", featured: true, status: "live", tags: [], quote: "" });
    expect(input.blocks).toEqual([{ type: "demo", text: "https://cambio-demo.vercel.app" }]);
  });

  it("keeps only the facts that were answered, and no blocks when the demo was skipped", () => {
    const input = newEntryInput(draft({ title: "Cambio", facts: [["Role", "Solo"], ["Platform", " "]] }), place, "draft");
    expect(input.facts).toEqual([["Role", "Solo"]]);
    expect(input.blocks).toEqual([]);
  });
});

describe("toNewEntryDraft", () => {
  it("reads the answers the flow sends", () => {
    const sent = { title: "Cambio", summary: "", demo: "", facts: [["Role", "Solo"]], featured: true };
    expect(toNewEntryDraft(sent)).toEqual(sent);
  });

  it("refuses anything missing a text answer", () => {
    expect(toNewEntryDraft({ title: "Cambio" })).toBeNull();
    expect(toNewEntryDraft(null)).toBeNull();
  });

  it("drops malformed facts and reads a featured flag that isn't true as false", () => {
    expect(toNewEntryDraft({ title: "", summary: "", demo: "", facts: "Role", featured: "yes" })).toMatchObject({ facts: [], featured: false });
  });
});
