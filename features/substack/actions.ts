"use server";

import { requireAdmin } from "@/features/admin/session";
import { asAdmin } from "@/lib/db";
import { syncSubstack } from "./sync";

/** Pulls in new Substack posts now instead of waiting for the daily run. */
export async function syncSubstackNow(): Promise<void> {
  const admin = await requireAdmin();
  const result = await syncSubstack((work) => asAdmin(admin, work));
  if (!result.ok) throw new Error(result.error);
}
