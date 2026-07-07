# CatWatch — Security

Security is 15% of the #hackthekitty judging rubric. This is the writeup referenced from the README.

## Coordinate fuzzing

Every cat's stored `lat`/`lng` is offset by up to ±0.0005° (~50m) at write time (`lib/geo.ts`'s `fuzzCoordinate`), applied inside `POST /api/cats` before the coordinates ever reach the database. Real locations are never stored — protects community cats from being tracked precisely enough to cause harm. This is the headline responsible-data-handling story for the app.

## Rate limiting

`POST /api/cats` and `POST /api/sightings` share a combined budget of 10 requests/hour (Upstash Redis, fixed window), keyed by client IP since real auth is deferred (see below). Enforced as the very first check in each route — a rate-limited request never reaches validation, CLIP, or the database. Implementation: `lib/rate-limit.ts`.

## SSRF protection on photo uploads

Every photo-accepting route (`POST /api/cats`, `POST /api/sightings`) calls out server-side (`fetch()`) to the client-supplied `photo_url` to generate a CLIP embedding. Without a check, that's a classic SSRF hole — a client could point it at an internal URL (cloud metadata endpoints, internal services) or an oversized response.

`lib/photo-url.ts`'s `isSupabaseStorageUrl()` restricts `photo_url` to `https://` + the project's own Supabase host + the `/storage/v1/object/` path prefix. This isn't just a security backstop — it's the actual intended flow (`SPEC.md`: client uploads to Storage first, sends the resulting URL), so nothing legitimate is restricted.

## Admin endpoint authentication

`POST /api/admin/run-check` is a publicly reachable Vercel URL that can flip cats to `missing` ahead of schedule. It's gated behind a shared-secret bearer token (`ADMIN_RUN_CHECK_TOKEN`) and **fails closed**: if the env var isn't set at all, the route returns `500` rather than silently allowing unauthenticated access. This isn't full auth (deferred, see below) — just enough to stop anonymous abuse of the one route that can alter demo state early.

## Row Level Security

All four tables (`users`, `cats`, `sightings`, `alerts`) have RLS enabled. Public read policies exist on `cats`/`sightings`/`alerts` (the map and profile need this data); there are **no public write policies** — every insert/update happens server-side through the Supabase service-role key inside API routes, which bypasses RLS entirely. In practice RLS here is defense-in-depth: it guarantees the anon key (safe to expose to the browser) can never write to a table even if it were ever used client-side by mistake.

One deliberate, narrowly-scoped exception: the `cat-photos` Storage bucket has public read **and** public upload, since the client uploads photos directly to Storage before calling the API (see SSRF section above). Anyone with the anon key can upload a file to this one bucket — they cannot write to any table or read any other bucket. Accepted as a hackathon-speed tradeoff, called out explicitly rather than left implicit.

## Input validation

Every API route validates its input with Zod before doing anything else (`registerCatSchema`, `submitSightingSchema`, `boundingBoxQuerySchema`, etc.), including a defense-in-depth check inside `submit_sighting` itself: `status_update` being `NULL` would otherwise silently no-op the cat's status update rather than error (`NULL <> 'not_found'` evaluates to `NULL`, not true), so the RPC rejects it explicitly.

## No secrets in the client

Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are exposed to the browser (and the anon key has no write access, see RLS above). `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_RUN_CHECK_TOKEN`, `UPSTASH_REDIS_REST_TOKEN`, and `HF_TOKEN` are server-only env vars, never referenced from client components. `.env.local` is gitignored; `.env.example` documents every required variable without real values.

## What's deferred

Real user authentication (Supabase Auth/OAuth) is deferred in favor of a hardcoded demo user for the hackathon window — identity work the judging rubric doesn't reward, and every write already goes through the service-role key server-side regardless of who's "logged in."

## Aikido scan

Scanned with [Aikido Security](https://www.aikido.dev) (report: `docs/aikido-report.pdf`): **0 critical**; the one high (client-controlled filename in the Storage upload key — path traversal) and a flagged SSRF in the CLIP fetcher were fixed same-day: filenames are now sanitised in `lib/upload-photo.ts`, and the Supabase-Storage-URL guard is enforced *inside* `generateClipEmbedding` itself, not only at the API boundary.
Remaining mediums are triaged, not ignored: a prototype-pollution CVE in a `zod@3` copy that ships only inside the `shadcn` scaffolding CLI (dev tooling — never part of the runtime bundle), and GitHub org IP allow-listing, which requires GitHub Enterprise Cloud.
