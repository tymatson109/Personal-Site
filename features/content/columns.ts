// The entry columns every query selects, shaped for lib/rows.ts: the date as YYYY-MM-DD, deletion as an ISO time
export const ENTRY_COLUMNS = `id, section, slug, title, summary, to_char(date, 'YYYY-MM-DD') as date, tags, featured, status, source,
  quote, facts, blocks, to_char(deleted_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "deletedAt"`;
