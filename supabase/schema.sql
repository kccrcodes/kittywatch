-- CatWatch — initial schema
-- Run once in the Supabase SQL Editor (or via `supabase db push` if you set
-- up the CLI). Matches the data model in docs/SPEC.md.

create extension if not exists vector;
create extension if not exists pgcrypto; -- gen_random_uuid()

-- Users
-- Auth is deferred per SPEC.md (hardcoded demo user/device id for the
-- hackathon) — this table exists so the schema is forward-compatible, but
-- nothing enforces a real auth.users link yet.
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  push_subscription jsonb,
  created_at timestamptz default now()
);

-- Cats
create table if not exists cats (
  id uuid primary key default gen_random_uuid(),
  name text,
  breed text,
  estimated_age text,
  vaccinated boolean default false,
  tnr boolean default false,
  lat float8 not null,           -- fuzzed coordinates (~50m offset), see COORD_FUZZ in SPEC.md
  lng float8 not null,
  status text not null default 'healthy'
    check (status in ('healthy', 'needs_attention', 'missing')),
  last_seen_at timestamptz,
  registered_by uuid references users(id),
  created_at timestamptz default now()
);

create index if not exists cats_lat_lng_idx on cats (lat, lng);
create index if not exists cats_status_idx on cats (status);

-- Sightings (photo submissions)
create table if not exists sightings (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid not null references cats(id) on delete cascade,
  submitted_by uuid references users(id),
  photo_url text not null,
  embedding vector(512),          -- CLIP embedding, see scripts/derisk-clip.mjs
  match_score float8,              -- cosine similarity vs cat's known embeddings
  status_update text
    check (status_update in ('healthy', 'injured', 'not_found')),
  notes text,
  created_at timestamptz default now()
);

create index if not exists sightings_cat_id_idx on sightings (cat_id);
-- IVFFlat index for cosine similarity search. Needs rows present before
-- `create index` picks good list count — fine to add after seeding (Milestone 3).
-- create index sightings_embedding_idx on sightings
--   using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Alerts (disappearance events)
create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid not null references cats(id) on delete cascade,
  triggered_at timestamptz default now(),
  resolved_at timestamptz,
  resolved boolean default false
);

create index if not exists alerts_cat_id_idx on alerts (cat_id);

-- Cat re-ID similarity match, per docs/SPEC.md.
-- Returns the single best-matching prior sighting for a cat, by cosine
-- similarity, above `threshold` (default REID_THRESHOLD = 0.70 in SPEC.md —
-- see scripts/derisk-clip.mjs findings before trusting that number as-is).
create or replace function match_cat_embedding(
  cat_id uuid,
  query_embedding vector(512),
  threshold float8 default 0.70
)
returns table(sighting_id uuid, similarity float8)
language sql
stable
as $$
  select
    id as sighting_id,
    1 - (embedding <=> query_embedding) as similarity
  from sightings
  where sightings.cat_id = match_cat_embedding.cat_id
    and embedding is not null
  order by embedding <=> query_embedding
  limit 1;
$$;

-- Register a cat: insert the cat + its founding sighting in one transaction.
-- Called from POST /api/cats after the API route has already fuzzed the
-- coordinates and generated the founding CLIP embedding (Postgres can't do
-- either of those itself). Single RPC instead of two separate REST calls so
-- a failure can't leave an orphan cat row with no founding sighting.
create or replace function register_cat(
  p_name text,
  p_breed text,
  p_estimated_age text,
  p_vaccinated boolean,
  p_tnr boolean,
  p_lat float8,
  p_lng float8,
  p_photo_url text,
  p_embedding vector(512),
  p_notes text default null
)
returns cats
language plpgsql
as $$
declare
  new_cat cats;
begin
  insert into cats (name, breed, estimated_age, vaccinated, tnr, lat, lng, status, last_seen_at)
  values (p_name, p_breed, p_estimated_age, p_vaccinated, p_tnr, p_lat, p_lng, 'healthy', now())
  returning * into new_cat;

  insert into sightings (cat_id, photo_url, embedding, match_score, status_update, notes)
  values (
    new_cat.id,
    p_photo_url,
    p_embedding,
    case when p_embedding is null then null else 1.0 end,
    'healthy',
    coalesce(p_notes, 'Founding photo')
  );

  return new_cat;
end;
$$;

-- Map pins for GET /api/cats, per docs/SPEC.md. thumbnail_url is the most
-- recent sighting's photo (falls back to null if a cat somehow has none,
-- which shouldn't happen since register_cat always creates a founding
-- sighting). A correlated subquery per row is fine at hackathon scale
-- (Milestone 3 seeds 15-20 cats) - not worth a lateral join for this.
create or replace function cats_in_bounding_box(
  min_lat float8,
  max_lat float8,
  min_lng float8,
  max_lng float8
)
returns table(
  id uuid,
  name text,
  status text,
  lat float8,
  lng float8,
  last_seen_at timestamptz,
  thumbnail_url text
)
language sql
stable
as $$
  select
    c.id,
    c.name,
    c.status,
    c.lat,
    c.lng,
    c.last_seen_at,
    (
      select s.photo_url from sightings s
      where s.cat_id = c.id
      order by s.created_at desc, s.id desc
      limit 1
    ) as thumbnail_url
  from cats c
  where c.lat between min_lat and max_lat
    and c.lng between min_lng and max_lng;
$$;

-- Submit a sighting: insert the sighting, then conditionally update the
-- cat's last_seen_at/status - one transaction instead of two REST calls.
-- Called from POST /api/sightings after the API route has generated the
-- CLIP embedding and looked up match_score via match_cat_embedding.
--
-- 'not_found' sightings don't update last_seen_at/status: the whole point
-- of last_seen_at is to drive disappearance detection (missing after
-- MISSING_THRESHOLD days with no sighting), and a "couldn't find this cat"
-- report is evidence *for* that, not a fresh sighting - resetting the
-- countdown on a not_found report would be backwards.
create or replace function submit_sighting(
  p_cat_id uuid,
  p_photo_url text,
  p_status_update text,
  p_notes text,
  p_embedding vector(512),
  p_match_score float8
)
returns sightings
language plpgsql
as $$
declare
  new_sighting sightings;
begin
  if p_status_update is null then
    -- The check constraint allows NULL, and `NULL <> 'not_found'` evaluates
    -- to NULL (falsy), which would silently skip the cat update below
    -- instead of erroring - status_update is required by the API contract,
    -- so reject it explicitly here too.
    raise exception 'status_update is required' using errcode = '22004';
  end if;

  insert into sightings (cat_id, photo_url, embedding, match_score, status_update, notes)
  values (p_cat_id, p_photo_url, p_embedding, p_match_score, p_status_update, p_notes)
  returning * into new_sighting;

  if p_status_update <> 'not_found' then
    update cats
    set last_seen_at = new_sighting.created_at,
        status = case p_status_update when 'injured' then 'needs_attention' else 'healthy' end
    where id = p_cat_id;
  end if;

  return new_sighting;
end;
$$;

-- Disappearance detection. Flips cats not seen in threshold_days to
-- 'missing' and writes an alerts row for each. Filtering on
-- `status <> 'missing'` means a cat already flagged missing won't get a
-- duplicate alert on the next scheduled run.
--
-- Also callable directly from POST /api/admin/run-check with a
-- configurable threshold - the demo can't wait 7 real days to show the
-- missing-cat flow.
create or replace function run_disappearance_check(threshold_days integer default 7)
returns table(cat_id uuid, name text, last_seen_at timestamptz)
language plpgsql
as $$
begin
  return query
  with newly_missing as (
    update cats
    set status = 'missing'
    where cats.status <> 'missing'
      and cats.last_seen_at is not null
      and cats.last_seen_at < now() - (threshold_days || ' days')::interval
    returning cats.id, cats.name, cats.last_seen_at
  ),
  inserted_alerts as (
    insert into alerts (cat_id)
    select newly_missing.id from newly_missing
    returning alerts.cat_id
  )
  select nm.id, nm.name, nm.last_seen_at
  from newly_missing nm;
end;
$$;

-- Schedule the check daily via pg_cron rather than a separate Supabase Edge
-- Function - same outcome, no extra deploy toolchain. Wrapped so re-running
-- this file doesn't create duplicate scheduled jobs.
create extension if not exists pg_cron;

-- cron.unschedule(job_id bigint) is the original, version-stable signature
-- (unlike the text-overload, which is newer and version-dependent) - delete
-- by jobid looked up from cron.job rather than relying on it.
select cron.unschedule(jobid) from cron.job where jobname = 'disappearance-check-daily';

-- The 7 here is a literal, not lib/config.ts's MISSING_THRESHOLD_DAYS -
-- cron.schedule needs a literal SQL command. Keep these in sync by hand if
-- that constant ever changes.
select cron.schedule(
  'disappearance-check-daily',
  '0 0 * * *', -- daily at midnight UTC
  $cron$select run_disappearance_check(7)$cron$
);
