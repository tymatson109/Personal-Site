import type { EntryInput } from "./entry-input";
import type { EntryStatus, SectionLayout } from "@/types/entry";
import { isDemoUrl } from "./demos";
import { toFacts } from "./rows";
import { slugify } from "./slug";

/** One question of the new-entry flow. */
export type NewEntryStep = "name" | "summary" | "demo" | "facts" | "publish";

/** Projects ask for their demo and facts; writing goes straight from its line to publishing. */
export const NEW_ENTRY_STEPS: Record<SectionLayout, readonly NewEntryStep[]> = {
  grid: ["name", "summary", "demo", "facts", "publish"],
  list: ["name", "summary", "publish"],
};

/** The question each step asks, as its title. */
export const STEP_QUESTIONS: Record<NewEntryStep, string> = {
  name: "What’s it called?",
  summary: "Describe it in one line",
  demo: "Link its live demo",
  facts: "Quick facts",
  publish: "Ready to publish?",
};

/** The short name of each answer on the last step, where tapping one goes back to change it. */
export const STEP_NAMES: Record<Exclude<NewEntryStep, "publish">, string> = {
  name: "Name",
  summary: "One line",
  demo: "Live demo",
  facts: "Facts",
};

/** The facts a project page usually shows, offered with empty values so only the answers need typing. */
export const LIKELY_FACTS = ["Role", "Platform", "Stack", "Status"] as const;

type Fact = [label: string, value: string];

/** Everything the flow asks before the entry exists. */
export type NewEntryDraft = { title: string; summary: string; demo: string; facts: Fact[]; featured: boolean };

export function emptyDraft(layout: SectionLayout): NewEntryDraft {
  return { title: "", summary: "", demo: "", facts: layout === "grid" ? LIKELY_FACTS.map((label) => [label, ""]) : [], featured: false };
}

/** The address a typed demo link will play, adding the https:// that a link copied from Vercel's dashboard leaves off. */
export function demoAddress(typed: string): string {
  const text = typed.trim();
  if (!text) return "";
  return /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`;
}

const filledFacts = (facts: readonly Fact[]): Fact[] => facts.filter(([, value]) => value.trim() !== "");

/** True when a step's answer is optional and was left empty, so its button reads Skip instead of Next. */
export function isSkipped(step: NewEntryStep, draft: NewEntryDraft): boolean {
  if (step === "demo") return draft.demo.trim() === "";
  if (step === "facts") return filledFacts(draft.facts).length === 0;
  return false;
}

/** True when a step's answer is good enough to move on. */
export function canContinue(step: NewEntryStep, draft: NewEntryDraft): boolean {
  if (step === "name") return draft.title.trim() !== "";
  if (step === "demo") return isSkipped(step, draft) || isDemoUrl(demoAddress(draft.demo));
  return true;
}

/** True once anything has been typed, so closing the flow asks before throwing it away. */
export function hasAnswers(draft: NewEntryDraft): boolean {
  return [draft.title, draft.summary, draft.demo].some((t) => t.trim() !== "") || filledFacts(draft.facts).length > 0;
}

/** The answers as the browser sent them, or null when they aren't the flow's shape; lengths are checked with the rest of the entry. */
export function toNewEntryDraft(value: unknown): NewEntryDraft | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const { title, summary, demo } = v;
  if (typeof title !== "string" || typeof summary !== "string" || typeof demo !== "string") return null;
  return { title, summary, demo, facts: toFacts(v.facts), featured: v.featured === true };
}

const MAX_SLUG = 80;

/** The address a new entry gets from its title: the slug itself, or the first numbered one no entry in the section has used. */
export function freeSlug(title: string, taken: readonly string[]): string {
  const base = slugify(title) || "untitled";
  if (!taken.includes(base)) return base;
  for (let n = 2; ; n++) {
    const suffix = `-${n}`;
    const slug = `${base.slice(0, MAX_SLUG - suffix.length).replace(/-+$/, "")}${suffix}`;
    if (!taken.includes(slug)) return slug;
  }
}

/** The entry the flow's answers make, ready for the same checks the editor's saves go through. */
export function newEntryInput(
  draft: NewEntryDraft,
  place: { section: string; slug: string; date: string },
  status: EntryStatus,
): EntryInput {
  const demo = demoAddress(draft.demo);
  return {
    ...place,
    title: draft.title,
    summary: draft.summary,
    tags: [],
    featured: draft.featured,
    status,
    quote: "",
    facts: filledFacts(draft.facts),
    blocks: demo ? [{ type: "demo", text: demo }] : [],
  };
}
