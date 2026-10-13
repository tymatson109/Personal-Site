-- Row-level security and constraint checks, run by scripts/db-test.sh after the migrations.
-- Visitors (site_reader) see only published content and write nothing; site_admin manages everything.
-- Any failed check raises and stops the run.

insert into public.entries (section, slug, title, status) values
  ('projects', 'live-one', 'Live', 'live'),
  ('projects', 'draft-one', 'Draft', 'draft');
insert into public.entries (section, slug, title, status, deleted_at) values
  ('writing', 'deleted-one', 'Deleted', 'live', now());

create function pg_temp.check(ok boolean, what text) returns void language plpgsql as $$
begin
  if not ok then raise exception 'Database check failed: %', what; end if;
  raise notice 'ok: %', what;
end;
$$;

-- True when the statement is refused for lack of privilege
create function pg_temp.blocked(statement text) returns boolean language plpgsql as $$
begin
  execute statement;
  return false;
exception when insufficient_privilege then
  return true;
end;
$$;

-- True when a constraint rejects the statement
create function pg_temp.rejected(statement text) returns boolean language plpgsql as $$
begin
  execute statement;
  return false;
exception when check_violation or not_null_violation or foreign_key_violation or unique_violation then
  return true;
end;
$$;

-- A visitor, through the reader role
set role site_reader;
select pg_temp.check((select count(*) from public.sections) = 2, 'a visitor sees both starting sections');
select pg_temp.check((select array_agg(slug) from public.entries) = array['live-one'], 'a visitor sees only live, undeleted entries');
select pg_temp.check((select count(*) from public.pages where slug = 'about') = 1, 'a visitor sees the About page');
select pg_temp.check(pg_temp.blocked($$insert into public.sections (slug, name, layout) values ('talks', 'Talks', 'grid')$$), 'a visitor cannot add a section');
select pg_temp.check(pg_temp.blocked($$update public.entries set title = 'x'$$), 'a visitor cannot edit entries');
select pg_temp.check(pg_temp.blocked($$delete from public.entries$$), 'a visitor cannot delete entries');
select pg_temp.check(pg_temp.blocked($$insert into public.media (url) values ('https://x.test/a.png')$$), 'a visitor cannot add media');
reset role;

-- The admin, through the admin role
set role site_admin;
select pg_temp.check((select count(*) from public.entries) = 3, 'the admin sees drafts and deleted entries too');
insert into public.sections (slug, name, layout, position) values ('talks', 'Talks', 'grid', 3);
select pg_temp.check((select count(*) from public.sections) = 3, 'the admin can add a section');
update public.entries set title = 'Edited' where slug = 'draft-one';
select pg_temp.check((select title from public.entries where slug = 'draft-one') = 'Edited', 'the admin can edit a draft');
insert into public.media (url, alt) values ('https://x.test/cover.png', 'Cover');
select pg_temp.check((select count(*) from public.media) = 1, 'the admin can record an uploaded image');
reset role;

-- The Substack sync, through the sync role: it adds and refreshes Substack posts and touches nothing else
set role site_sync;
select pg_temp.check((select count(*) from public.entries) = 3, 'the sync sees every address, drafts and removed entries included');
insert into public.entries (section, slug, title, status, source, source_url) values ('writing', 'synced', 'Synced', 'live', 'substack', 'https://x.substack.com/p/synced');
update public.entries set title = 'Refreshed' where source_url = 'https://x.substack.com/p/synced';
select pg_temp.check((select title from public.entries where slug = 'synced') = 'Refreshed', 'the sync can add a Substack post and refresh its words');
select pg_temp.check(pg_temp.blocked($$insert into public.entries (section, slug, title) values ('writing', 'own', 'Own')$$), 'the sync cannot add an entry of the site''s own');
update public.entries set title = 'Hijacked' where slug = 'live-one';
select pg_temp.check((select count(*) from public.entries where title = 'Hijacked') = 0, 'the sync cannot change an entry of the site''s own');
select pg_temp.check(pg_temp.blocked($$update public.entries set status = 'draft' where slug = 'synced'$$), 'the sync cannot unpublish a post');
select pg_temp.check(pg_temp.blocked($$update public.entries set quote = 'x' where slug = 'synced'$$), 'the sync cannot overwrite the highlight Ty picked');
select pg_temp.check(pg_temp.blocked($$delete from public.entries where slug = 'synced'$$), 'the sync cannot delete posts');
select pg_temp.check(pg_temp.blocked($$insert into public.sections (slug, name, layout) values ('feed', 'Feed', 'list')$$), 'the sync cannot add a section');
reset role;
delete from public.entries where slug = 'synced';

-- Constraints the content contract relies on
select pg_temp.check(pg_temp.rejected($$insert into public.sections (slug, name, layout) values ('Bad Slug', 'Bad', 'grid')$$), 'a slug must be lowercase words joined by hyphens');
select pg_temp.check(pg_temp.rejected($$insert into public.sections (slug, name, layout) values ('gallery', 'Gallery', 'masonry')$$), 'a section layout must be grid or list');
select pg_temp.check(pg_temp.rejected($$insert into public.entries (section, slug, status) values ('projects', 'x', 'published')$$), 'an entry status must be draft or live');
select pg_temp.check(pg_temp.rejected($$insert into public.entries (section, slug) values ('projects', 'live-one')$$), 'two entries in one section cannot share a slug');
select pg_temp.check(pg_temp.rejected($$insert into public.entries (section, slug) values ('nowhere', 'x')$$), 'an entry must belong to a real section');
select pg_temp.check(pg_temp.rejected($$insert into public.entries (section, slug, source) values ('writing', 'x', 'substack')$$), 'a Substack entry must carry its original link');
select pg_temp.check(pg_temp.rejected($$insert into public.entries (section, slug, blocks) values ('projects', 'x', '{}')$$), 'blocks must be a list');
select pg_temp.check(pg_temp.rejected($$insert into public.media (url) values ('http://x.test/a.png')$$), 'media URLs must be https');
select pg_temp.check(pg_temp.rejected($$delete from public.sections where slug = 'projects'$$), 'a section with entries cannot be dropped out from under them');

-- Removing a section, as the admin does it: one transaction stamps the section and its entries with the same time
set role site_admin;
begin;
update public.sections set deleted_at = now() where slug = 'projects';
update public.entries set deleted_at = now() where section = 'projects' and deleted_at is null;
commit;
reset role;
set role site_reader;
select pg_temp.check((select count(*) from public.sections where slug = 'projects') = 0, 'a visitor no longer sees a removed section');
select pg_temp.check((select count(*) from public.entries where section = 'projects') = 0, 'a visitor no longer sees the entries of a removed section');
reset role;
set role site_admin;
select pg_temp.check((select deleted_at is not null from public.sections where slug = 'projects'), 'the admin still sees a removed section, so it can be restored');
update public.entries e set deleted_at = null from public.sections s
  where s.slug = 'projects' and e.section = s.slug and e.deleted_at = s.deleted_at;
update public.sections set deleted_at = null where slug = 'projects';
reset role;
set role site_reader;
select pg_temp.check((select count(*) from public.entries where section = 'projects') = 1, 'restoring a section brings back its live entry');
reset role;

update public.entries set updated_at = '2000-01-01', title = 'Touched' where slug = 'live-one';
select pg_temp.check((select updated_at > '2001-01-01' from public.entries where slug = 'live-one'), 'editing an entry stamps updated_at');
