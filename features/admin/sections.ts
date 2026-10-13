import "server-only";
import { asAdmin } from "@/lib/db";
import { toAdminSection } from "@/lib/rows";
import type { AdminSection } from "@/lib/sections";
import type { Admin } from "./session";

/**
 * Every section, removed ones included, with how many entries it holds.
 * A removed section counts the entries that left with it, which share its removal time.
 */
export async function listAdminSections(admin: Admin): Promise<AdminSection[]> {
  const { rows } = await asAdmin(admin, (db) =>
    db.query(
      `select s.slug, s.name, s.layout, s.position as "order",
              to_char(s.deleted_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "deletedAt",
              (select count(*)::int from public.entries e
                where e.section = s.slug and e.deleted_at is not distinct from s.deleted_at) as entries
         from public.sections s`,
    ),
  );
  return rows.map(toAdminSection);
}
