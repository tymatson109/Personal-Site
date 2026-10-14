"use server";

import { asAdmin } from "@/lib/db";
import { parsePageInput } from "@/lib/entry-input";
import { isSlug } from "@/lib/slug";
import type { SaveResult } from "./entry-actions";
import { refreshSite } from "./refresh";
import { requireAdmin } from "./session";

/** Saves a page's headline, opening line and story; problems come back as a message instead of an error page. */
export async function savePage(slug: string, value: unknown): Promise<SaveResult> {
  const admin = await requireAdmin();
  if (!isSlug(slug)) return { ok: false, error: "This page no longer exists." };
  const parsed = parsePageInput(value);
  if (!parsed.ok) return parsed;
  const { title, intro, blocks } = parsed.input;
  const { rowCount } = await asAdmin(admin, (db) =>
    db.query(`update public.pages set title = $2, intro = $3, blocks = $4 where slug = $1`, [slug, title, intro, JSON.stringify(blocks)]),
  );
  if (!rowCount) return { ok: false, error: "This page no longer exists." };
  refreshSite();
  return { ok: true };
}
