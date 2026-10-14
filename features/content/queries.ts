import { cache } from "react";
import type { Entry, Page, Section } from "@/types/entry";
import { asReader } from "@/lib/db";
import { toEntry, toPage, toSection } from "@/lib/rows";
import { ENTRY_COLUMNS } from "./columns";

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
`select ${ENTRY_COLUMNS} from public.entries order by date desc, title`,
    ),
  );
  return rows.map(toEntry);
});

export const getPage = cache(async (slug: string): Promise<Page | undefined> => {
  const { rows } = await asReader((db) => db.query(`select slug, title, intro, blocks from public.pages where slug = $1`, [slug]));
  return rows.length ? toPage(rows[0]) : undefined;
});
