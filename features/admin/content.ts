import "server-only";
import type { AdminEntry } from "@/lib/admin-entries";
import { asAdmin } from "@/lib/db";
import { toAdminEntry } from "@/lib/rows";
import { ENTRY_COLUMNS } from "@/features/content/columns";
import type { Admin } from "./session";

/** Every entry, drafts and deleted ones included, which only site_admin can see. */
export async function listAdminEntries(admin: Admin): Promise<AdminEntry[]> {
  const { rows } = await asAdmin(admin, (db) => db.query(`select ${ENTRY_COLUMNS} from public.entries`));
  return rows.map(toAdminEntry);
}

/** One entry for the editor, whatever its status; undefined when the id matches nothing. */
export async function getAdminEntry(admin: Admin, id: string): Promise<AdminEntry | undefined> {
  const { rows } = await asAdmin(admin, (db) => db.query(`select ${ENTRY_COLUMNS} from public.entries where id = $1`, [id]));
  return rows.length ? toAdminEntry(rows[0]) : undefined;
}
