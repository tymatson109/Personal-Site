import type { Section } from "@/types/entry";

/** Stand-in sections until pages read Supabase (PR 6). */
export const SAMPLE_SECTIONS: Section[] = [
  { slug: "projects", name: "Projects", layout: "grid", order: 1 },
  { slug: "writing", name: "Writing", layout: "list", order: 2 },
];
