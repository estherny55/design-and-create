-- Run this once in Supabase SQL Editor.
create table if not exists public.members (
  id bigint generated always as identity primary key,
  name text not null,
  year_group text not null,
  added_to_chat boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.members enable row level security;

grant insert on public.members to anon;
grant insert, select, update, delete on public.members to authenticated;
grant usage, select on all sequences in schema public to anon;
grant usage, select on all sequences in schema public to authenticated;

drop policy if exists "Anyone can submit group chat signups" on public.members;
create policy "Anyone can submit group chat signups"
on public.members
for insert
to anon
with check (true);

drop policy if exists "Committee can manage group chat signups" on public.members;
create policy "Committee can manage group chat signups"
on public.members
for all
to authenticated
using (true)
with check (true);
