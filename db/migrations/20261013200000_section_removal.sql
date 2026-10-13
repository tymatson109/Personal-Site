-- Sections can be removed and restored like entries: removing one stamps deleted_at on the section and on
-- its entries with the same time, so restoring it brings back exactly the entries that left with it.
-- Visitors stop seeing a removed section at once; its entries are already hidden by their own deleted_at.

alter table public.sections add column deleted_at timestamptz;

drop policy reader_reads_sections on public.sections;
create policy reader_reads_sections on public.sections for select to site_reader using (deleted_at is null);
