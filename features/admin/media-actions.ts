"use server";

import { asAdmin } from "@/lib/db";
import { toMedia } from "@/lib/rows";
import { requireAdmin } from "./session";

/** Notes a finished upload in the media table, which keeps a list of every file in the store for cleanup later. */
export async function recordUpload(file: unknown, bytes: unknown): Promise<void> {
  const admin = await requireAdmin();
  const [media] = toMedia([file]);
  if (!media) throw new Error("Not a file from this site's store");
  const size = typeof bytes === "number" && Number.isInteger(bytes) && bytes > 0 ? bytes : null;
  await asAdmin(admin, (db) =>
    db.query(
      `insert into public.media (url, alt, width, height, bytes) values ($1, $2, $3, $4, $5) on conflict (url) do nothing`,
      [media.url, media.alt, media.width, media.height, size],
    ),
  );
}
