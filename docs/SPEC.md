# CatWatch — SPEC

Shared source of truth for **[You: design / frontend]** and **[Partner: backend / AI]**.
Agree this on **day one** and freeze the API contract — it's the seam that lets you both build in parallel without waiting on each other.

> This is a **mobile-first PWA**, not a dashboard. Every layout decision assumes one hand, one thumb, a phone held outdoors in sunlight. Desktop is a `[CUT]`. See *Form factor* below.

---

## What it is

A mobile-first **PWA** for finding and tracking community / stray cats. Register a cat on a map, log sightings with a photo, and get alerted when a cat hasn't been seen for a while. A CLIP-based re-identification model confirms each photo submission matches the right cat.

> **Pitch:** Every stray cat gets a digital heartbeat. If it flatlines, the neighbourhood knows.

**The three problems it solves**
1. Cat lovers without cats who want to find community cats to visit.
2. Community cats that vanish from their usual spots and go uncared-for.
3. Community cats in accidents/distress that no one notices in time.

---

## Form factor (read before designing anything)

The app is used **outdoors, walking, one-handed, phone in sunlight, wanting to log a cat in seconds.** That single scenario decides the UI:

- Primary actions in **thumb reach** (bottom of screen), not top nav.
- **44px minimum** touch targets. Gestures + taps, never hover.
- Minimal typing — cameras and taps over forms.
- Design at **~390px width first**; scale up only if time allows.
- Tapping a map pin opens a **bottom sheet**, not a new full page.
- Respect **safe-area insets** (notch / home indicator) and momentum scroll.

The `design.md` token system (palette, type, spacing, components, loading screen) is the visual source of truth and carries over wholesale. Only its *desktop-dashboard layout guidance* (sidebar, top nav, "dashboard versions A/B/C") is superseded by the mobile app shell above.

---

## Stack

| Layer | Tech |
|---|---|
| **Frontend** | Next.js 16 (App Router, Turbopack default), Tailwind **v4** (CSS-first `@theme`), shadcn/ui (new-york), Leaflet.js, React Hook Form |
| **PWA** | Built-in App Router manifest (`app/manifest.ts`) + **Serwist** (`@serwist/next`) *only if* offline caching is needed. **Not `next-pwa`** — it needs webpack and fights Turbopack in Next 16. |
| **Backend** | Next.js API routes, Supabase (Postgres + Auth + Storage + pgvector + Edge Functions), Upstash Redis |
| **AI** | HuggingFace Inference API — CLIP (ViT-B/32, 512-d embeddings), pgvector cosine similarity |
| **Notifications** | Web Push API, Resend (email fallback), in-app banner (fastest fallback) |
| **Fonts** | Fredoka (display / logo / titles), Nunito Sans (body / UI) |
| **Deploy** | Vercel (app + API routes), Supabase (managed DB / storage / cron) |
| **Security** | Coordinate fuzzing, Upstash rate limiting, Aikido scan report (see *Security*) |

> **Node.js 20.9+.** One person scaffolds the shared repo (frontend + API routes live together), commits, pushes; the other clones. Two people running `create-next-app` separately is a day-one mess.

---

## Config constants

Single source for the magic numbers — keep these in one file (`lib/config.ts`) so both sides agree.

| Constant | Value | Notes |
|---|---|---|
| `STATUS` | `healthy` \| `needs_attention` \| `missing` | Drives pin + badge colour |
| `SIGHTING_STATUS` | `healthy` \| `injured` \| `not_found` | Set per submission |
| `COORD_FUZZ` | ±0.0005° (~50 m) | Offset every stored coordinate to protect cat locations |
| `REID_THRESHOLD` | `0.70` | Match score below this → flag sighting for review |
| `MISSING_THRESHOLD` | `7 days` | No sighting for this long → status flips to `missing` |
| `RATE_LIMIT` | `10 / user / hour` | Enforced in Redis before processing a submission |

**Status → colour (from `design.md`), so pins/badges are consistent across both sides:**

| Status | Meaning | Chip bg / text | Pin |
|---|---|---|---|
| `healthy` | seen recently, fine | `green-100` / `green-600` | sage cat-face pin |
| `needs_attention` | injured / flagged | `yellow-soft` / brown | amber ring |
| `missing` | past threshold | `red-soft` / dark pink | pink/red alert ring |

> Status colour is **functional, not decoration** — never colour alone. Pair each with a shape or icon so it survives colourblindness and a sunlit screen.

---

## Design tokens (source of truth = `design.md`)

Full system lives in `design.md`. In Tailwind v4 these are **CSS custom properties in `globals.css`** under `:root`, mapped with `@theme inline` — *not* `tailwind.config.js`. The starter set:

```css
:root {
  --bg-main: #F9F3EE;   --bg-surface: #FFF9F6;  --bg-soft: #F6EEE7;
  --text-main: #5D4035; --text-body: #6E5549;   --text-muted: #9A8478;
  --line-brown: #7A5544; --border-soft: #EBDDD2;

  --pink-100:#FDEBED; --pink-200:#FAD8DF; --pink-300:#F7C1CF;
  --pink-400:#F39BB0; --pink-500:#EC8EA4; --pink-600:#DD7890;   /* primary CTA = pink-500 */
  --green-100:#EEF7EE;--green-200:#DDEEDB;--green-300:#BFDDBE;
  --green-400:#9DCAA3;--green-500:#8FB89A;--green-600:#6E9E7F;   /* accent = green-500 */

  --yellow-soft:#F6E5B8; --orange-soft:#F5C79A; --red-soft:#F3B7B3; --blue-soft:#C8DDF2;

  --radius-sm:12px; --radius-md:18px; --radius-lg:24px; --radius-xl:28px; --radius-pill:999px;
}
```

> **Accent change from the old spec:** primary is now **`pink-500` (#EC8EA4)** on a cream base with sage-green accent and warm-brown text/linework — per `design.md`. The old `#ff6b35` orange is retired; tell your partner so the manifest `theme_color` and any hardcoded pins match.

Type scale: H1 Fredoka 600 / 32–36px · H2 Fredoka 500–600 / 22–24px · card title Nunito Sans 700 / 16–18px · body Nunito Sans 400–500 / 14–16px · meta Nunito Sans 500 / 12–13px. Spacing on an 8px base. Radii/shadows per `design.md`.

---

## Data model

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  push_subscription jsonb,          -- Web Push subscription object
  created_at timestamptz default now()
);

create table cats (
  id uuid primary key default gen_random_uuid(),
  name text, breed text, estimated_age text,
  vaccinated boolean default false,
  tnr boolean default false,        -- trap-neuter-return status
  lat float not null,               -- FUZZED coordinates
  lng float not null,
  status text default 'healthy',    -- STATUS enum
  last_seen_at timestamptz,
  registered_by uuid references users(id),
  created_at timestamptz default now()
);

create table sightings (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid references cats(id),
  submitted_by uuid references users(id),
  photo_url text not null,
  embedding vector(512),            -- CLIP embedding for re-ID
  match_score float,                -- cosine similarity vs cat's known photos
  status_update text,               -- SIGHTING_STATUS enum
  notes text,
  created_at timestamptz default now()
);

create table alerts (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid references cats(id),
  triggered_at timestamptz default now(),
  resolved_at timestamptz,
  resolved boolean default false
);
```

> **Auth:** don't let it block the core loop. Start with a hardcoded demo user / device id. The `users` table stays in the schema but real OAuth is `[CUT]` unless you're ahead — identity is a time-sink judges don't reward.

---

## API contract

**This is the part you (designer) build against.** Each response is exactly the shape the screen receives. Don't change these without telling your partner.

**Photo flow:** the client uploads the image to **Supabase Storage first**, gets a public `photo_url`, then calls the API with that URL. Endpoints never receive raw files.

### `GET /api/cats` — map pins
Query: `lat`, `lng`, `radius` (metres). Returns cats in a bounding box.
```json
[
  { "id":"uuid", "name":"Mochi", "status":"healthy",
    "lat":1.3521, "lng":103.8198,
    "last_seen_at":"2026-07-01T09:30:00Z", "thumbnail_url":"https://.../thumb.jpg" }
]
```
> **Designer note:** everything a pin needs. `status` sets colour, `thumbnail_url` is the preview. Nothing heavier loads until a pin is tapped (then → bottom sheet).

### `GET /api/cats/[id]` — full profile
```json
{
  "id":"uuid", "name":"Mochi", "breed":"Domestic Shorthair", "estimated_age":"~2 years",
  "vaccinated":true, "tnr":true, "status":"healthy",
  "last_seen_at":"2026-07-01T09:30:00Z", "lat":1.3521, "lng":103.8198,
  "sightings":[
    { "id":"uuid", "photo_url":"https://.../photo.jpg", "status_update":"healthy",
      "notes":"napping by block 412", "match_score":0.92,
      "submitted_by_name":"Aisha", "created_at":"2026-07-01T09:30:00Z" }
  ]
}
```

### `POST /api/cats` — register a cat
Request (all optional except coords + photo):
```json
{ "name":"Mochi", "breed":"Domestic Shorthair", "estimated_age":"~2 years",
  "vaccinated":false, "tnr":false, "lat":1.3521, "lng":103.8198,
  "photo_url":"https://.../founding.jpg" }
```
Response: the created cat, with **fuzzed** coords the map will show.
Server-side: fuzz coords → insert cat → generate founding CLIP embedding → store founding sighting with `match_score: 1.0`.

### `POST /api/sightings` — submit a sighting
Request:
```json
{ "cat_id":"uuid", "photo_url":"https://.../new.jpg",
  "status_update":"healthy", "notes":"seen near the void deck" }
```
Response:
```json
{ "id":"uuid", "cat_id":"uuid",
  "match_score":0.89,        // or null if CLIP unavailable
  "flagged":false,           // true when match_score < REID_THRESHOLD
  "status_update":"healthy", "created_at":"2026-07-01T09:30:00Z" }
```
Server-side: rate-limit → generate embedding → pgvector match → insert sighting → update cat `last_seen_at` + `status`.
Errors: `429` rate-limited · `400` validation · `404` unknown cat.

### `match_cat_embedding` — Postgres RPC (backend-internal)
`match_cat_embedding(cat_id, query_embedding, threshold)` → `{ sighting_id, similarity }`
Cosine similarity `1 - (embedding <=> query_embedding)` against that cat's stored embeddings, best match only.

### Disappearance cron — Supabase Edge Function
Runs daily. Flips cats with `last_seen_at` older than `MISSING_THRESHOLD` to `missing`, writes an `alerts` row, notifies contributors who logged a sighting in the last 30 days.
> **Demo-critical:** also expose a manual `POST /api/admin/run-check` trigger + make the threshold configurable — you can't wait 7 days in a video.

---

## Screen flow (mobile)

```
                 ┌──────────────────┐
                 │   Map  (/)       │  app entry · geolocation centres here
                 │  colour pins     │  FAB "Register" bottom-right (thumb reach)
                 │  "Cats near me"  │
                 └──┬───────────┬───┘
        tap pin ────┘           └──── tap FAB
             │                          │
   bottom sheet slides up         ┌─────────────────┐
             │                    │  Register       │
             ▼                    │  drop pin+form  │
   ┌──────────────────┐          │  +founding photo│
   │  Cat Profile     │          └────────┬────────┘
   │  /cats/[id]      │                   │ on submit → back to Map (new pin)
   │  gallery+history │
   └──┬───────────────┘
      │ "Submit sighting"
      ▼
   ┌──────────────────┐
   │  Submit Sighting │  camera + status
   └──┬───────────────┘
      │ on submit
      ▼
   re-ID score reveal ──► back to updated Profile (optimistic)

  Push / banner: "Mochi hasn't been seen in 7 days" ──► deep-links to that Profile
```

**Cats near me** is a radius filter on the map, not a screen. **Missing-cat state** is a variant of the pin + profile, not a new route.

---

## Features

| # | Feature | Screen(s) | Owner | Priority |
|---|---|---|---|---|
| 1 | Community cat map (colour pins, geolocation) | Map | You | Must |
| 2 | Cat profile (gallery, history, status, TNR) | Profile | You | Must |
| 3 | Cat registration (drop pin + form + founding photo) | Register | You | Must |
| 4 | Photo submission → sighting update (camera) | Submit | You | Must |
| 5 | Cat re-ID via CLIP + pgvector (**showstopper**) | Submit reveal | Partner + You | High |
| 6 | Disappearance alert system (**narrative hook**) | Profile / push | Partner + You | High |
| 7 | Cats near me (radius filter, Haversine) | Map | You | Nice-to-have |
| 8 | PWA install (manifest, service worker, HTTPS) | Global | You | Must |
| — | Rate limiting (Upstash Redis) | Backend | Partner | Must |
| — | Coordinate fuzzing | Backend | Partner | Must |

---

## Security (worth 15% of the score — don't leave it to chance)

- **Coordinate fuzzing** (±~50 m on every stored coord) — protects cat locations from being used to harm animals. This is your headline *responsible-data-handling* story; say it out loud in the README.
- **Rate limiting** (Upstash, 10/user/hr) before any write.
- **No secrets in the client**; Supabase service-role key stays server-side; RLS on tables where feasible.
- **Run an Aikido scan** on the repo and drop the report in `docs/` — the rules give bonus points for it.
- Validate all inputs at the API boundary (the `400` cases above).

---

## How this is judged (#hackthekitty — bake it into every decision)

Video demo (< 5 min) + repo + docs. **No live stage** — judges may score from the description, images, and video without running the app. Weighted rubric:

| Criterion | Weight | Where it's won |
|---|---|---|
| Technical Execution | 25% | Working re-ID pipeline, clean architecture, the app actually runs |
| Innovation & Creativity | 20% | CLIP re-ID + "digital heartbeat" alert are the novel hooks |
| Theme Relevance | 15% | Playful cat-welfare framing; make the welfare story *felt* |
| Security | 15% | Fuzzing + rate limiting + Aikido report |
| UX / UI | 15% | Mobile-first polish, states, the re-ID animation, loading screen |
| Documentation | 10% | This SPEC + ROADMAP + README + architecture + security report |

**Sponsor bonuses (free points / extra prizes):** Aikido scan report (Security), Kiro track (opt in with a `.kiro` folder + write-up), Temporal durable execution (a natural fit for the disappearance workflow — optional, only if ahead).

---

## Day-one checklist (freeze before splitting)

- [ ] Schema created in Supabase, `pgvector` enabled, Storage bucket live
- [ ] API shapes above agreed by both — no changes without telling the other person
- [ ] CLIP de-risked (ROADMAP Phase 0) — confirmed it separates same-cat from different-cat
- [ ] App name + pastel palette locked so the icon + tokens can begin
- [ ] Decide Kiro opt-in now (it changes your agent workflow)
