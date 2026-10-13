"use server";

import { revalidatePath } from "next/cache";
import { ENTRY_STATUSES } from "@/types/entry";
import { isEntryId, RESTORE_DAYS } from "@/lib/admin-entries";
import { asAdmin } from "@/lib/db";
import { requireAdmin } from "./session";

// Ids and values arrive from the browser, so each is checked here before the one update it allows
async function updateEntry(id: unknown, set: string, values: unknown[] = [], where = "") {
  const admin = await requireAdmin();
  if (!isEntryId(id)) throw new Error("Unknown entry");
  await asAdmin(admin, (db) => db.query(`update public.entries set ${set} where id = $1 ${where}`, [id, ...values]));
  // Static public pages are rebuilt on their next visit, and the admin list shows the change at once
  revalidatePath("/", "layout");
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
