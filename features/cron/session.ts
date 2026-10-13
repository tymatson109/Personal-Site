import "server-only";
import { timingSafeEqual } from "node:crypto";

/** Proof that a request came from Vercel Cron, which sends CRON_SECRET as a bearer token. */
export type ScheduledRun = { scheduled: true };

/** The scheduled run behind this request, or null for anyone else or when CRON_SECRET isn't set. */
export function scheduledRun(request: Request): ScheduledRun | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null;
  const sent = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return sent.length === expected.length && timingSafeEqual(sent, expected) ? { scheduled: true } : null;
}
