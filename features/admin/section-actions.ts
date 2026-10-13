"use server";

import { revalidatePath } from "next/cache";
import { RESTORE_DAYS } from "@/lib/admin-entries";
import { asAdmin } from "@/lib/db";
import { isSameSet, newSectionSlug, parseSectionInput } from "@/lib/sections";
import { isSlug } from "@/lib/slug";
import type { SaveResult } from "./entry-actions";
import { requireAdmin } from "./session";

// The nav on every public page lists sections, so any change rebuilds the whole site on its next visit
function refreshSite() {
  revalidatePath("/", "layout");
}

/** Adds a section at the end of the nav; its address comes from its name. */
export async function createSection(value: unknown): Promise<SaveResult> {
  const admin = await requireAdmin();
  const parsed = parseSectionInput(value);
  if (!parsed.ok) return parsed;
  const { name, layout } = parsed.input;
  const result = await asAdmin(admin, async (db) => {
    const { rows } = await db.query(`select slug from public.sections`);
    const slug = newSectionSlug(name, rows.map((r) => String(r.slug)));
    if (!slug.ok) return slug;
    await db.query(
      `insert into public.sections (slug, name, layout, position)
       select $1, $2, $3, coalesce(max(position), 0) + 1 from public.sections`,
      [slug.slug, name, layout],
    );
    return { ok: true } as const;
  });
  if (result.ok) refreshSite();
  return result;
}

/** Renames a section or changes its layout; its address stays, so links to it keep working. */
export async function updateSection(slug: string, value: unknown): Promise<SaveResult> {
  const admin = await requireAdmin();
  if (!isSlug(slug)) return { ok: false, error: "This section no longer exists." };
  const parsed = parseSectionInput(value);
  if (!parsed.ok) return parsed;
  const { rowCount } = await asAdmin(admin, (db) =>
    db.query(`update public.sections set name = $2, layout = $3 where slug = $1 and deleted_at is null`, [
      slug,
      parsed.input.name,
      parsed.input.layout,
    ]),
  );
  if (!rowCount) return { ok: false, error: "This section no longer exists." };
  refreshSite();
  return { ok: true };
}

/** Puts the sections in the order given, which must name every current section once. */
export async function reorderSections(order: unknown): Promise<SaveResult> {
  const admin = await requireAdmin();
  const result = await asAdmin(admin, async (db) => {
    const { rows } = await db.query(`select slug from public.sections where deleted_at is null`);
    if (!isSameSet(order, rows.map((r) => String(r.slug)))) {
      return { ok: false, error: "The sections changed while you were moving them. Reload and try again." } as const;
    }
    await db.query(
      `update public.sections s set position = o.position
         from unnest($1::text[]) with ordinality as o(slug, position) where s.slug = o.slug`,
      [order],
    );
    return { ok: true } as const;
  });
  if (result.ok) refreshSite();
  return result;
}

// One transaction gives the section and its entries the same now(), which is how restore finds them again
export async function removeSection(slug: string) {
  const admin = await requireAdmin();
  if (!isSlug(slug)) throw new Error("Unknown section");
  await asAdmin(admin, async (db) => {
    const { rowCount } = await db.query(`update public.sections set deleted_at = now() where slug = $1 and deleted_at is null`, [slug]);
    if (rowCount) await db.query(`update public.entries set deleted_at = now() where section = $1 and deleted_at is null`, [slug]);
  });
  refreshSite();
}

/** Brings back a section removed within the restore window, with exactly the entries that left with it. */
export async function restoreSection(slug: string) {
  const admin = await requireAdmin();
  if (!isSlug(slug)) throw new Error("Unknown section");
  // Compared inside the database, since a JavaScript Date would lose the timestamp's microseconds
  await asAdmin(admin, async (db) => {
    await db.query(
      `update public.entries e set deleted_at = null from public.sections s
        where s.slug = $1 and e.section = s.slug and e.deleted_at = s.deleted_at
          and s.deleted_at > now() - make_interval(days => $2)`,
      [slug, RESTORE_DAYS],
    );
    await db.query(`update public.sections set deleted_at = null where slug = $1 and deleted_at > now() - make_interval(days => $2)`, [
      slug,
      RESTORE_DAYS,
    ]);
  });
  refreshSite();
}
