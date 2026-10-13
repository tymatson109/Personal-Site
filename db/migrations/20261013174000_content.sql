-- Content tables for the site: sections, entries, media and one-off pages.
-- The site never queries as the owner: public pages switch to site_reader, which sees published content only,
-- and admin actions switch to site_admin after the server has checked the signed-in admin. Row-level security
-- enforces both here, so a bug in a page can't leak a draft and a visitor can't write anything.

-- Roles -------------------------------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'site_reader') then
    create role site_reader nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'site_admin') then
    create role site_admin nologin;
  end if;
end;
$$;

-- The connecting user may switch into either role for one transaction at a time
grant site_reader, site_admin to current_user;

grant usage on schema public to site_reader, site_admin;

-- Shared trigger --------------------------------------------------------------------------------------------

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Sections ----------------------------------------------------------------------------------------------

create table public.sections (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  layout text not null check (layout in ('grid', 'list')),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger sections_touch before update on public.sections
  for each row execute function public.touch_updated_at();

alter table public.sections enable row level security;
create policy reader_reads_sections on public.sections for select to site_reader using (true);
create policy admin_manages_sections on public.sections for all to site_admin using (true) with check (true);

grant select on public.sections to site_reader;
grant select, insert, update, delete on public.sections to site_admin;

-- Entries -----------------------------------------------------------------------------------------------

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  section text not null references public.sections (slug) on update cascade on delete restrict,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null default '',
  summary text not null default '',
  date date not null default current_date,
  tags text[] not null default '{}',
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'live')),
  source text not null default 'site' check (source in ('site', 'substack')),
  -- The original post for synced entries: the canonical link, and the key the sync upserts on
  source_url text check (source_url is null or source_url ~ '^https://'),
  quote text not null default '',
  facts jsonb not null default '[]' check (jsonb_typeof(facts) = 'array'),
  blocks jsonb not null default '[]' check (jsonb_typeof(blocks) = 'array'),
  -- Set when removed; kept 30 days so a delete can be undone
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section, slug),
  check ((source = 'substack') = (source_url is not null))
);

create unique index entries_source_url_key on public.entries (source_url) where source_url is not null;
create index entries_section_date_idx on public.entries (section, date desc) where deleted_at is null;

create trigger entries_touch before update on public.entries
  for each row execute function public.touch_updated_at();

alter table public.entries enable row level security;
create policy reader_reads_published on public.entries for select to site_reader
  using (status = 'live' and deleted_at is null);
create policy admin_manages_entries on public.entries for all to site_admin using (true) with check (true);

grant select on public.entries to site_reader;
grant select, insert, update, delete on public.entries to site_admin;

-- Media -------------------------------------------------------------------------------------------------

-- Uploaded images live in Vercel Blob; this records each one's public URL, alt text and size
create table public.media (
  id uuid primary key default gen_random_uuid(),
  url text not null unique check (url ~ '^https://'),
  alt text not null default '',
  width integer check (width > 0),
  height integer check (height > 0),
  bytes integer check (bytes > 0),
  created_at timestamptz not null default now()
);

alter table public.media enable row level security;
create policy reader_reads_media on public.media for select to site_reader using (true);
create policy admin_manages_media on public.media for all to site_admin using (true) with check (true);

grant select on public.media to site_reader;
grant select, insert, update, delete on public.media to site_admin;

-- Pages -------------------------------------------------------------------------------------------------

create table public.pages (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null default '',
  blocks jsonb not null default '[]' check (jsonb_typeof(blocks) = 'array'),
  updated_at timestamptz not null default now()
);

create trigger pages_touch before update on public.pages
  for each row execute function public.touch_updated_at();

alter table public.pages enable row level security;
create policy reader_reads_pages on public.pages for select to site_reader using (true);
create policy admin_manages_pages on public.pages for all to site_admin using (true) with check (true);

grant select on public.pages to site_reader;
grant select, insert, update, delete on public.pages to site_admin;

-- Starting content ---------------------------------------------------------------------------------------

insert into public.sections (slug, name, layout, position) values
  ('projects', 'Projects', 'grid', 1),
  ('writing', 'Writing', 'list', 2)
on conflict (slug) do nothing;

insert into public.pages (slug, title) values ('about', 'About')
on conflict (slug) do nothing;
