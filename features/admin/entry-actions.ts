"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ENTRY_STATUSES } from "@/types/entry";
import { isEntryId, RESTORE_DAYS } from "@/lib/admin-entries";
import { asAdmin } from "@/lib/db";
import { parseEntryInput } from "@/lib/entry-input";
import { isSlug } from "@/lib/slug";
import { requireAdmin } from "./session";

export type SaveResult = { ok: true } | { ok: false; error: string };

// Postgres error codes the editor turns into plain messages
const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

function pgCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : undefined;
}

// Static public pages are rebuilt on their next visit, and the admin shows the change at once
function refreshSite() {
  revalidatePath("/", "layout");
}

// Ids and values arrive from the browser, so each is checked here before the one update it allows
async function updateEntry(id: unknown, set: string, values: unknown[] = [], where = "") {
  const admin = await requireAdmin();
  if (!isEntryId(id)) throw new Error("Unknown entry");
  await asAdmin(admin, (db) => db.query(`update public.entries set ${set} where id = $1 ${where}`, [id, ...values]));
  refreshSite();
}

export async function setEntryStatus(id: string, status: string) {
  if (!ENTRY_STATUSES.some((s) => s === status)) throw new Error("Unknown status");
  await updateEntry(id, "status = $2", [status]);
}

export async function setEntryFeatured(id: string, featured: boolean) {
  if (typeof featured !== "boolean") throw new Error("Featured must be true or false");
  await updateEntry(id, "featured = $2", [featured]);
}

export async function deleteEntry(id: string) {
  await updateEntry(id, "deleted_at = now()", [], "and deleted_at is null");
}

export async function restoreEntry(id: string) {
  await updateEntry(id, "deleted_at = null", [RESTORE_DAYS], "and deleted_at > now() - make_interval(days => $2)");
}

/** Starts an untitled draft in a section and opens it in the editor. */
export async function createEntry(section: string) {
  const admin = await requireAdmin();
  if (!isSlug(section)) throw new Error("Unknown section");
  const slug = `untitled-${randomBytes(3).toString("hex")}`;
  const { rows } = await asAdmin(admin, (db) =>
    db.query(`insert into public.entries (section, slug) values ($1, $2) returning id`, [section, slug]),
  );
  redirect(`/admin/entries/${rows[0].id}`);
}

/** Saves everything the editor holds; problems come back as a message instead of an error page. */
export async function saveEntry(id: string, value: unknown): Promise<SaveResult> {
  const admin = await requireAdmin();
  if (!isEntryId(id)) return { ok: false, error: "This entry no longer exists." };
  try {
    const result = await asAdmin(admin, async (db) => {
      const { rows } = await db.query(`select slug from public.sections`);
      const parsed = parseEntryInput(value, rows.map((r) => String(r.slug)));
      if (!parsed.ok) return parsed;
      const e = parsed.input;
      const { rowCount } = await db.query(
        `update public.entries
            set section = $2, slug = $3, title = $4, summary = $5, date = $6, tags = $7, featured = $8,
                status = $9, quote = $10, facts = $11, blocks = $12
          where id = $1 and deleted_at is null`,
        [id, e.section, e.slug, e.title, e.summary, e.date, e.tags, e.featured, e.status, e.quote,
          JSON.stringify(e.facts), JSON.stringify(e.blocks)],
      );
      return rowCount ? ({ ok: true } as const) : ({ ok: false, error: "This entry was deleted, so it can't be saved." } as const);
    });
    if (result.ok) refreshSite();
    return result;
  } catch (error) {
    if (pgCode(error) === UNIQUE_VIOLATION) return { ok: false, error: "Another entry in this section already uses that address." };
    if (pgCode(error) === FOREIGN_KEY_VIOLATION) return { ok: false, error: "That section no longer exists." };
    throw error;
  }
}
