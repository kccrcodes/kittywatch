# CatWatch — Architecture

> Supersedes `docs/KITTYWATCH_ARCHITECTURE.md`, the original planning doc — kept for historical reference, but several of its core decisions changed during the build (see [INITIAL_ISSUES_MILESTONES.md](INITIAL_ISSUES_MILESTONES.md) §1 for the full reconciliation). This document reflects what actually shipped.

## What it is

A mobile-first PWA for finding and tracking community/stray cats. Register a cat on a map, log sightings with a photo, and get alerted when a cat hasn't been seen in a while. A CLIP-based re-identification model confirms each photo submission matches the right cat. Full product spec: [SPEC.md](SPEC.md).

## Stack

| Layer | Tech | Notes |
|---|---|---|
| Frontend | Next.js 16 (App Router, Turbopack), Tailwind v4, shadcn/ui, Leaflet.js | |
| Backend | Next.js API routes, Supabase (Postgres + Storage + pgvector) | All table writes go through the service-role client server-side, never the anon key |
| AI | Local CLIP (`@huggingface/transformers`, `Xenova/clip-vit-base-patch32`) | **Not** HF's hosted Inference API — that endpoint doesn't support raw image embeddings for this model. See `scripts/derisk-clip.mjs`. |
| Rate limiting | Upstash Redis (`@upstash/ratelimit`) | |
| Deploy | Vercel (app + API routes), Supabase (managed DB/storage), `pg_cron` (scheduled job) | |

## Data model

Four tables — `users`, `cats`, `sightings`, `alerts` — defined in `supabase/schema.sql`, which also holds every RPC (Postgres function) the API routes call. Full schema + RLS policies live there; not duplicated here to avoid drift.

## API routes

| Route | Purpose |
|---|---|
| `GET /api/cats` | Bounding-box query (`lat`/`lng`/`radius`) for map pins. Calls `cats_in_bounding_box` RPC. |
| `GET /api/cats/[id]` | Full cat profile + joined sighting history. |
| `POST /api/cats` | Register a cat — fuzzes coordinates, generates a founding CLIP embedding, inserts the cat + founding sighting atomically via `register_cat` RPC. |
| `POST /api/sightings` | Submit a sighting — generates a CLIP embedding, looks up `match_score` via `match_cat_embedding`, inserts the sighting + conditionally updates the cat's `last_seen_at`/`status` via `submit_sighting` RPC. |
| `POST /api/admin/run-check` | Manually triggers the disappearance check with a configurable threshold (demo can't wait 7 real days). Gated by `ADMIN_RUN_CHECK_TOKEN`. |
| `GET /api/health` | Confirms the deployed environment can actually reach Supabase — useful after any env var change. |

All mutation routes: rate-limited (Upstash, 10/hour combined budget, keyed by client IP) as the very first check, Zod-validated, and reject any `photo_url` that isn't a Supabase Storage URL (see [security.md](security.md)).

## The re-identification pipeline

1. Client uploads the photo directly to Supabase Storage (`cat-photos` bucket), gets back a public URL.
2. Client calls the API with that URL — routes never receive raw image bytes.
3. The route fetches the image server-side and runs it through local CLIP to get a 512-dim embedding.
4. `match_cat_embedding` (pgvector cosine similarity) compares it against the cat's existing sightings, returns the best match.
5. `match_score` is returned to the client; `flagged = match_score < REID_THRESHOLD`.

CLIP failing (network blip, model load issue) doesn't block the submission — the sighting is still recorded with `match_score: null` rather than rejected outright.

## Disappearance detection

`run_disappearance_check(threshold_days)` flips cats not seen in `threshold_days` to `missing` and writes an `alerts` row, filtered so an already-missing cat doesn't get a duplicate alert. Scheduled daily via `pg_cron` directly on the Postgres function — not a separate Supabase Edge Function as the original plan called for, since a `pg_cron` schedule needed one more SQL statement instead of a whole new Deno deploy toolchain. Also exposed as `POST /api/admin/run-check` with a configurable threshold for the demo.

The alert itself surfaces as an in-app panel (`AlertsPanel`), not Web Push — see "What was cut" below.

## What was cut or deferred, and why

| Item | Original plan | What shipped | Why |
|---|---|---|---|
| Temporal | Core architecture — 3 durable workflows | Not built | Tracked as an explicit stretch goal (issue #25), conditional on M1/M2 finishing early. They didn't finish early enough to justify the setup cost this close to the deadline. |
| Auth | Supabase Auth, OAuth | Hardcoded demo user/device id | Identity is a time-sink the judging rubric doesn't reward; every write is server-side via the service-role key regardless. |
| Web Push | VAPID push notifications, Resend email fallback | In-app `AlertsPanel` | `ROADMAP.md` tagged this `[SHOULD]` with an explicit "fall back fast" clause. VAPID/iOS Safari support is exactly the kind of afternoon-eater that clause warned about, and the in-app panel fully covers the demo narrative with zero extra backend work. |
| PWA install | `next-pwa` | Not yet implemented (`app/manifest.ts` pending) | Scoped for Milestone 3; `next-pwa` itself was ruled out regardless since it needs webpack and fights Turbopack in Next 16. |

## Known follow-up

`REID_THRESHOLD` (currently 0.70) was calibrated against the original plan's assumptions, but real local-CLIP cosine similarity runs higher across the board than expected — a different-cat pair scored ~0.79–0.85 in testing, comfortably above the reject cutoff. Recalibrate against the actual demo cats before relying on the exact confidence numbers in the pitch.
