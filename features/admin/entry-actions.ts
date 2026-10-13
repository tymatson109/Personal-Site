"use server";

import { revalidatePath } from "next/cache";
import { ENTRY_STATUSES, type EntryStatus } from "@/types/entry";
import { isEntryId, RESTORE_DAYS } from "@/lib/admin-entries";
import { asAdmin } from "@/lib/db";
import { parseEntryInput } from "@/lib/entry-input";
import { freeSlug, newEntryInput, toNewEntryDraft } from "@/lib/new-entry";
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

// An entry of a removed section comes back only with its section
export async function restoreEntry(id: string) {
  await updateEntry(
    id,
    "deleted_at = null",
    [RESTORE_DAYS],
    "and deleted_at > now() - make_interval(days => $2) and section in (select slug from public.sections where deleted_at is null)",
  );
}

export type CreateResult = { ok: true; id: string } | { ok: false; error: string };

/** Creates an entry from the new-entry flow's answers, giving it a free address in its section and today's date. */
export async function createEntry(section: string, value: unknown, status: EntryStatus): Promise<CreateResult> {
  const admin = await requireAdmin();
  if (!isSlug(section)) return { ok: false, error: "That section no longer exists." };
  try {
    return await asAdmin(admin, async (db) => {
      const sections = await db.query(`select slug from public.sections where deleted_at is null`);
      // Removed entries keep their address, so they count as taken too
      const taken = await db.query(`select slug from public.entries where section = $1`, [section]);
      const draft = toNewEntryDraft(value);
      if (!draft) return { ok: false, error: "Nothing to save." } as const;
      const place = { section, slug: freeSlug(draft.title, taken.rows.map((r) => String(r.slug))), date: new Date().toISOString().slice(0, 10) };
      const parsed = parseEntryInput(newEntryInput(draft, place, status), sections.rows.map((r) => String(r.slug)));
      if (!parsed.ok) return parsed;
      const e = parsed.input;
      const { rows } = await db.query(
        `insert into public.entries (section, slug, title, summary, date, tags, featured, status, quote, facts, blocks)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning id`,
        [e.section, e.slug, e.title, e.summary, e.date, e.tags, e.featured, e.status, e.quote, JSON.stringify(e.facts), JSON.stringify(e.blocks)],
      );
      refreshSite();
      return { ok: true, id: String(rows[0].id) } as const;
    });
  } catch (error) {
    if (pgCode(error) === UNIQUE_VIOLATION) return { ok: false, error: "Another entry took that address just now. Try again." };
    if (pgCode(error) === FOREIGN_KEY_VIOLATION) return { ok: false, error: "That section no longer exists." };
    throw error;
  }
}

/** Saves everything the editor holds; problems come back as a message instead of an error page. */
export async function saveEntry(id: string, value: unknown): Promise<SaveResult> {
  const admin = await requireAdmin();
  if (!isEntryId(id)) return { ok: false, error: "This entry no longer exists." };
  try {
    const result = await asAdmin(admin, async (db) => {
      const { rows } = await db.query(`select slug from public.sections where deleted_at is null`);
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
