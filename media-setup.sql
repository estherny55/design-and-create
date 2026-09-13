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
