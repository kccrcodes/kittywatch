-- CatWatch — Row Level Security
-- Run after schema.sql. All table writes (POST /api/cats, POST /api/sightings,
-- the disappearance check) happen server-side in Next.js API routes using the
-- Supabase SERVICE ROLE key, which bypasses RLS entirely. These policies only
-- govern what the public anon key can do — i.e. they're a backstop in case
-- the anon key is ever used client-side, not the app's primary access control.

alter table users enable row level security;
alter table cats enable row level security;
alter table sightings enable row level security;
alter table alerts enable row level security;

-- Public read on cats/sightings/alerts — the map and profile pages need this
-- data to be readable; no inserts are exposed to the anon key, so all writes
-- must go through an API route.
create policy "Public read" on cats for select using (true);
create policy "Public read" on sightings for select using (true);
create policy "Public read" on alerts for select using (true);

-- users has no public read policy — display names/emails/push subscriptions
-- stay server-side only.

-- Storage bucket for cat photos.
-- Direct browser upload (per SPEC.md's photo flow: client uploads to Storage
-- first, then calls the API with the resulting photo_url) needs the anon key
-- to be able to INSERT into this one bucket. This is a deliberate, narrowly
-- scoped hackathon-speed tradeoff — anyone with the anon key can upload a
-- file to `cat-photos`, but they can't write to any table or read other
-- buckets. Flag this in the Aikido scan writeup rather than hiding it.
insert into storage.buckets (id, name, public)
values ('cat-photos', 'cat-photos', true)
on conflict (id) do nothing;

create policy "Public read cat photos" on storage.objects
  for select using (bucket_id = 'cat-photos');

create policy "Public upload cat photos" on storage.objects
  for insert with check (bucket_id = 'cat-photos');
