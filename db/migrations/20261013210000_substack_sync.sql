-- The Substack sync runs on a schedule with no one signed in, so it gets its own role that can only add and
-- refresh Substack posts: it sees every entry's address (to pick a free one) but writes only source = 'substack'
-- rows, and only the columns the feed supplies, so the highlight, tags, feature and status stay as Ty set them.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'site_sync') then
    create role site_sync nologin;
  end if;
end;
$$;

grant site_sync to current_user;
grant usage on schema public to site_sync;

create policy sync_reads_sections on public.sections for select to site_sync using (deleted_at is null);
grant select (slug, deleted_at) on public.sections to site_sync;

create policy sync_reads_addresses on public.entries for select to site_sync using (true);
create policy sync_adds_posts on public.entries for insert to site_sync with check (source = 'substack');
create policy sync_refreshes_posts on public.entries for update to site_sync
  using (source = 'substack') with check (source = 'substack');

grant select (section, slug, source, source_url, title, summary, date, blocks) on public.entries to site_sync;
grant insert (section, slug, title, summary, date, status, source, source_url, blocks) on public.entries to site_sync;
grant update (title, summary, date, blocks) on public.entries to site_sync;
