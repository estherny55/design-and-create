-- Run this once in Supabase SQL Editor to enable photo/PDF attachments.

alter table public.articles add column if not exists media_url text;
alter table public.articles add column if not exists media_type text;
alter table public.resources add column if not exists media_url text;
alter table public.resources add column if not exists media_type text;

insert into storage.buckets (id, name, public)
values ('club-media', 'club-media', true)
on conflict (id) do update set public = true;

grant insert, select, update, delete on storage.objects to authenticated;

drop policy if exists "Committee can upload club media" on storage.objects;
create policy "Committee can upload club media"
on storage.objects for all
to authenticated
using (bucket_id = 'club-media')
with check (bucket_id = 'club-media');

drop policy if exists "Public can view club media" on storage.objects;
create policy "Public can view club media"
on storage.objects for select
to public
using (bucket_id = 'club-media');


-- Member creations: one project can belong to a topic and contain multiple media files.
create table if not exists public.creations (
  id bigint generated always as identity primary key,
  topic text not null,
  title text not null,
  author text,
  description text not null,
  content text,
  created_at timestamptz not null default now()
);

create table if not exists public.creation_media (
  id bigint generated always as identity primary key,
  creation_id bigint not null references public.creations(id) on delete cascade,
  media_url text not null,
  media_type text,
  file_name text,
  created_at timestamptz not null default now()
);

alter table public.creations enable row level security;
alter table public.creation_media enable row level security;

grant select on public.creations to anon;
grant select on public.creation_media to anon;
grant insert, select, update, delete on public.creations to authenticated;
grant insert, select, update, delete on public.creation_media to authenticated;
grant usage, select on all sequences in schema public to anon;
grant usage, select on all sequences in schema public to authenticated;

drop policy if exists "Public can view member creations" on public.creations;
create policy "Public can view member creations" on public.creations for select to public using (true);
drop policy if exists "Committee can manage member creations" on public.creations;
create policy "Committee can manage member creations" on public.creations for all to authenticated using (true) with check (true);

drop policy if exists "Public can view creation media" on public.creation_media;
create policy "Public can view creation media" on public.creation_media for select to public using (true);
drop policy if exists "Committee can manage creation media" on public.creation_media;
create policy "Committee can manage creation media" on public.creation_media for all to authenticated using (true) with check (true);
