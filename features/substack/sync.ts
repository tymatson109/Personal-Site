import "server-only";
import { revalidatePath } from "next/cache";
import type { PoolClient } from "pg";
import { parseEntryInput } from "@/lib/entry-input";
import { SITE_LINKS, SUBSTACK_SECTION, substackFeed } from "@/lib/links";
import { parseSubstackFeed, postEntryInput, postSlug, type SubstackPost } from "@/lib/substack";

export type SyncResult = { ok: true; added: number; updated: number } | { ok: false; error: string };

/** The posts in Ty's Substack feed right now; fetched before any transaction opens, so a slow feed never holds a connection. */
export async function fetchSubstackPosts(): Promise<SubstackPost[] | null> {
  try {
    const response = await fetch(substackFeed(SITE_LINKS.substack), { cache: "no-store", signal: AbortSignal.timeout(15000) });
    return response.ok ? parseSubstackFeed(await response.text()) : null;
  } catch {
    return null;
  }
}

/** Adds new posts to Writing and refreshes the words of ones already there; runs as site_admin or site_sync. */
export async function savePosts(db: PoolClient, posts: SubstackPost[]): Promise<SyncResult> {
  const sections = await db.query(`select slug from public.sections where slug = $1 and deleted_at is null`, [SUBSTACK_SECTION]);
  if (sections.rowCount === 0) return { ok: false, error: "There is no Writing section to sync into." };
  // Removed entries keep their address, so they count as taken too
  const taken = (await db.query(`select slug from public.entries where section = $1`, [SUBSTACK_SECTION])).rows.map((r) => String(r.slug));
  const known = new Set(
    (await db.query(`select source_url from public.entries where source_url = any($1)`, [posts.map((p) => p.url)])).rows.map((r) =>
      String(r.source_url),
    ),
  );

  let added = 0;
  let updated = 0;
  for (const post of posts) {
    if (known.has(post.url)) {
      const { rowCount } = await db.query(
        `update public.entries set title = $2, summary = $3, date = $4, blocks = $5
         where source_url = $1 and (title, summary, date, blocks) is distinct from ($2, $3, $4::date, $5::jsonb)`,
        [post.url, post.title, post.summary, post.date, JSON.stringify(post.blocks)],
      );
      updated += rowCount ?? 0;
      continue;
    }
    const slug = postSlug(post, taken);
    const parsed = parseEntryInput(postEntryInput(post, SUBSTACK_SECTION, slug), [SUBSTACK_SECTION]);
    if (!parsed.ok) continue;
    const e = parsed.input;
    await db.query(
      `insert into public.entries (section, slug, title, summary, date, status, source, source_url, blocks)
       values ($1, $2, $3, $4, $5, $6, 'substack', $7, $8)`,
      [e.section, e.slug, e.title, e.summary, e.date, e.status, post.url, JSON.stringify(e.blocks)],
    );
    taken.push(slug);
    added++;
  }
  return { ok: true, added, updated };
}

/** Fetches the feed and saves it through the given role's transaction, refreshing the site when anything changed. */
export async function syncSubstack(inRole: (work: (db: PoolClient) => Promise<SyncResult>) => Promise<SyncResult>): Promise<SyncResult> {
  const posts = await fetchSubstackPosts();
  if (!posts) return { ok: false, error: "Substack's feed couldn't be read." };
  const result = await inRole((db) => savePosts(db, posts));
  if (result.ok && result.added + result.updated > 0) revalidatePath("/", "layout");
  return result;
}
