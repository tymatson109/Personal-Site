import { scheduledRun } from "@/features/cron/session";
import { syncSubstack } from "@/features/substack/sync";
import { asSync } from "@/lib/db";

// Vercel Cron calls this on the schedule in vercel.json; anyone without the cron secret is turned away
export async function GET(request: Request): Promise<Response> {
  const run = scheduledRun(request);
  if (!run) return new Response("Unauthorized", { status: 401 });
  const result = await syncSubstack((work) => asSync(run, work));
  return Response.json(result, { status: result.ok ? 200 : 502 });
}
