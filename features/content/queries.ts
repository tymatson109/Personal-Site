import { cache } from "react";
import type { Entry, Page, Section } from "@/types/entry";
import { asReader } from "@/lib/db";
import { toEntry, toPage, toSection } from "@/lib/rows";

// Every page reads content through here, as site_reader; cache() shares one query across a render

export const getSections = cache(async (): Promise<Section[]> => {
  const { rows } = await asReader((db) =>
    db.query(`select slug, name, layout, position as "order" from public.sections order by position, slug`),
  );
  return rows.map(toSection);
});

export const getEntries = cache(async (): Promise<Entry[]> => {
  const { rows } = await asReader((db) =>
    db.query(
      `select id, section, slug, title, summary, to_char(date, 'YYYY-MM-DD') as date, tags, featured, status, source,
              quote, facts, blocks
         from public.entries
        order by date desc, title`,
    ),
  );
  return rows.map(toEntry);
});

export const getPage = cache(async (slug: string): Promise<Page | undefined> => {
  const { rows } = await asReader((db) => db.query(`select slug, title, blocks from public.pages where slug = $1`, [slug]));
  return rows.length ? toPage(rows[0]) : undefined;
});
