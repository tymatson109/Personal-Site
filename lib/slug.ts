// The same rule the database checks on sections.slug and entries.slug
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const MAX_SLUG = 80;

export function isSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= MAX_SLUG && SLUG_PATTERN.test(value);
}

/** A URL-safe address from a title: lowercase words joined by hyphens, accents and punctuation dropped. */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, MAX_SLUG)
    .replace(/^-+|-+$/g, "");
}
