# KittyWatch — Architecture & Planning Document

> Generated from planning conversation for **Hack the Kitty 2026**
> Last updated: July 2026
> To be adapted alongside UI/UX mockups

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution Overview](#solution-overview)
3. [Hackathon Context](#hackathon-context)
4. [Judging Criteria & Scoring Strategy](#judging-criteria--scoring-strategy)
5. [Tech Stack Master List](#tech-stack-master-list)
6. [Database Schema](#database-schema)
7. [Features & Implementation Detail](#features--implementation-detail)
8. [Temporal Workflows](#temporal-workflows)
9. [Security Strategy](#security-strategy)
10. [Work Split](#work-split)
11. [Pitch Narrative](#pitch-narrative)
12. [Next Steps](#next-steps)

---

## Problem Statement

### Problem 1 — Cat Discovery
Cat lovers who don't own cats but want to find stray or community cats to pet and play with have no reliable way to locate them.

### Problem 2 — Disappearing Cats
Stray cats go missing from their regular haunts with no system to detect this or alert the people who care for them.

### Problem 3 — Cat Welfare Incidents
Stray cats encounter accidents or harm, and there is no community mechanism to report, track, or respond to welfare incidents in real time.

---

## Solution Overview

**KittyWatch** is a community-powered PWA (Progressive Web App) for registering, tracking, and protecting community cats. Key capabilities:

- Interactive map of registered community cats with live status
- Photo-based sighting submissions from mobile, directly from camera
- AI-powered cat re-identification using CLIP embeddings and pgvector cosine similarity
- Automatic disappearance detection with push notification alerts to nearby users
- Durable workflow orchestration via Temporal for all multi-step async processes
- Security scanning via Aikido

---

## Hackathon Context

**Hackathon:** Hack the Kitty 2026 — "World Cat Domination Day"
**Theme:** Build something with positive impact for cats, cat owners, or the broader cat community
**Format:** Pair submission (two-person team)
**Sponsors:** Temporal, Aikido Security, AWS (Kiro)

### Judges

| Judge | Organisation | Relevance |
|---|---|---|
| Shy Ruparel | Temporal (Sr. Dev Advocate) | Durable execution, workflow reliability |
| Philippe Dourassov | Aikido Security (AI Pentest Lead) | Security scan report, secure coding |
| Jay Raval | AWS / Kiro (Sr. Solutions Architect) | Cloud architecture quality |
| Geethanjali Jayakumar Uma | AWS / Kiro (Subject Matter Expert) | Cloud infra, generative AI |
| Hammad Mardani | Deloitte (Analyst) | Full-stack quality, engineering rigour |
| Yash Jajoo | Walter AI (Software Engineer) | AI integration, accessible UI/UX |

---

## Judging Criteria & Scoring Strategy

| Category | Weight | How to Score Well |
|---|---|---|
| Technical Execution | 25% | Temporal workflows, clean architecture, working demo |
| Innovation & Creativity | 20% | CLIP re-ID + disappearance alerts is genuinely novel in this space |
| Theme Relevance | 15% | Every feature maps explicitly to cat welfare |
| Security | 15% | Aikido scan report + RLS + rate limiting + coordinate fuzzing |
| UX / UI | 15% | Mobile-first PWA, polished shadcn/ui, smooth camera flow |
| Documentation | 10% | README + architecture overview + Aikido report + setup instructions |

**Tiebreaker order:** Technical Execution → Innovation → remaining categories → judge vote

### Critical Actions for Scoring
- [ ] Run Aikido security scan and include report in submission (Philippe Dourassov is the Aikido judge — this is near-free marks)
- [ ] Use Temporal for all async workflows (Shy Ruparel from Temporal is a judge — explicitly called out in the Technical Execution rubric)
- [ ] Record a demo video (judges are NOT required to run your code)
- [ ] Write a thorough README with architecture diagram and setup instructions

---

## Tech Stack Master List

### Frontend

| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | Core framework — routing, pages, API routes in one project |
| Tailwind CSS | Mobile-first styling — base styles for phone, `md:` prefix for desktop |
| next-pwa | Adds service worker and manifest — home screen install, full screen mode |
| Leaflet.js | Interactive map for cat pins, proximity filtering |
| shadcn/ui | Pre-built accessible components — badges, cards, modals, buttons |
| React Hook Form | Form handling for cat registration and photo submission |

### Backend

| Technology | Purpose |
|---|---|
| Next.js API Routes | Thin HTTP trigger layer — validates input, starts Temporal workflows |
| Supabase (Postgres) | Primary database — cats, sightings, users, embeddings |
| Supabase Auth | Email / Google OAuth user authentication |
| Supabase Storage | Cat photo storage — original uploads and thumbnails |
| Supabase pgvector | Vector similarity search for CLIP-based cat re-ID |
| Upstash Redis | Rate limiting — tracks submission count per user per hour |

### Temporal (Critical — Judge is from Temporal)

| Technology | Purpose |
|---|---|
| Temporal Cloud (free tier) | Hosts and manages all durable workflow execution |
| Temporal TypeScript SDK | Workflow and activity definitions in TypeScript |

Workflows replace:
- Supabase Edge Function cron jobs (disappearance detection)
- Fat API routes with multi-step async logic (sighting submission, cat registration)

### AI Pipeline

| Technology | Purpose |
|---|---|
| HuggingFace Inference API | Hosted CLIP (`openai/clip-vit-base-patch32`) — generates 512-dim embeddings |
| pgvector (cosine similarity) | Matches new photo embeddings against cat's known reference embeddings |

**Why CLIP, not a custom model:**
CLIP is OpenAI's open-source vision-language model trained on 400M image-text pairs. It produces semantic image embeddings where visually similar subjects (same cat) cluster together in vector space. Zero-shot performance is sufficient for a hackathon demo on visually distinctive cats. Fine-tuning on cat-specific pair data is a clear and credible next step for a production system.

### Security (Critical — Judge is from Aikido)

| Technology | Purpose |
|---|---|
| Aikido Security | Static analysis + dependency scan — produces report for submission |
| Supabase RLS | Row Level Security — public read, authenticated write on all tables |
| Upstash Redis | Rate limiting on all mutation endpoints |
| Zod | Server-side input validation on all API routes |
| Coordinate fuzzing | Offsets cat coordinates by up to ~50m before storage |

### Notifications

| Technology | Purpose |
|---|---|
| Web Push API | OS-level push notifications to PWA on Android |
| Resend | Email fallback for users without push permission granted |

### Deployment

| Technology | Purpose |
|---|---|
| Vercel | Next.js hosting + API routes, free tier, automatic HTTPS |
| Supabase | Managed Postgres + storage + auth |
| Temporal Cloud | Managed workflow orchestration, free tier |

---

## Database Schema

```sql
-- Users
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  push_subscription jsonb,        -- Web Push API subscription object
  created_at timestamptz default now()
);

-- Cats
create table cats (
  id uuid primary key default gen_random_uuid(),
  name text,
  breed text,
  estimated_age text,
  vaccinated boolean default false,
  tnr boolean default false,      -- trap-neuter-return status
  lat float not null,             -- fuzzed coordinates (~50m offset)
  lng float not null,
  status text default 'healthy',  -- healthy | needs_attention | missing
  last_seen_at timestamptz,
  registered_by uuid references users(id),
  created_at timestamptz default now()
);

-- Sightings (photo submissions)
create table sightings (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid references cats(id),
  submitted_by uuid references users(id),
  photo_url text not null,
  embedding vector(512),          -- CLIP embedding for re-ID
  match_score float,              -- cosine similarity vs cat's reference photos
  status_update text,             -- healthy | injured | not_found
  notes text,
  flagged boolean default false,  -- true if match_score < 0.70
  created_at timestamptz default now()
);

-- Alerts (disappearance events)
create table alerts (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid references cats(id),
  triggered_at timestamptz default now(),
  resolved_at timestamptz,
  resolved boolean default false
);
```

### pgvector Similarity Function

```sql
create or replace function match_cat_embedding(
  cat_id uuid,
  query_embedding vector(512),
  threshold float default 0.70
)
returns table(sighting_id uuid, similarity float)
language sql
as $$
  select
    id as sighting_id,
    1 - (embedding <=> query_embedding) as similarity
  from sightings
  where cat_id = match_cat_embedding.cat_id
    and embedding is not null
  order by embedding <=> query_embedding
  limit 1;
$$;
```

### Supabase RLS Policies

```sql
-- Cats: anyone can read, only authenticated users can insert
alter table cats enable row level security;
create policy "Public read" on cats for select using (true);
create policy "Auth insert" on cats for insert with check (auth.uid() is not null);

-- Sightings: same pattern
alter table sightings enable row level security;
create policy "Public read" on sightings for select using (true);
create policy "Auth insert" on sightings for insert with check (auth.uid() is not null);
```

---

## Features & Implementation Detail

### Feature 1 — Community Cat Map

**User story:** A user opens the app while walking. The map centres on their location and shows nearby community cats as colour-coded pins.

**Pin colours:**
- Green — Healthy
- Yellow — Needs Attention
- Red — Missing

**Implementation:**
- Leaflet.js with OpenStreetMap tiles (free, no API key)
- Browser Geolocation API to centre map on user
- Supabase query: cats within lat/lng bounding box around user's coordinates
- Coordinate fuzzing applied at write time (not read time) — stored coordinates are already fuzzed

```ts
// GET /api/cats?lat=1.35&lng=103.82
const { data } = await supabase
  .from('cats')
  .select('*')
  .gte('lat', lat - latDelta)
  .lte('lat', lat + latDelta)
  .gte('lng', lng - lngDelta)
  .lte('lng', lng + lngDelta)
```

---

### Feature 2 — Cat Profile Page

**User story:** Tapping a map pin opens a cat's full profile — photo gallery, status badge, sighting history, and a button to submit a new sighting.

**Route:** `/cats/[id]` (Next.js dynamic route)

**Implementation:**
- Supabase join: `cats` + `sightings` ordered by `created_at desc`
- Supabase Storage public URLs for photos
- shadcn/ui: Badge (status), Card (sighting history entries)
- TNR status flag — relevant for Singapore CWS context

---

### Feature 3 — Cat Registration

**User story:** A user finds a new community cat not yet on the map. They drop a pin, fill in details, upload a photo, and register the cat.

**Implementation:**
- React Hook Form — multi-step form with Zod validation
- Supabase Storage — direct browser upload to storage bucket
- Triggers **Temporal Cat Registration Workflow** (see Workflows section)
- Coordinate fuzzing applied inside the workflow activity, not client-side

---

### Feature 4 — Photo Submission & Sighting Update

**User story:** A user walking past a known cat taps "Submit Sighting", takes a photo with their rear camera, optionally adds a note and status update, and submits. The cat's profile updates in near real-time.

**Mobile camera input:**
```html
<!-- Opens rear camera directly on mobile -->
<input type="file" accept="image/*" capture="environment" />
```

**Implementation:**
- API route validates input and checks rate limit (Upstash Redis: 10 submissions/user/hour)
- Triggers **Temporal Sighting Workflow** (see Workflows section)
- API route returns immediately with `workflowId` — UI can poll for completion

---

### Feature 5 — Cat Re-Identification (Showstopper Demo)

**User story:** When a sighting photo is submitted, the system compares it against the cat's known reference photos and returns a confidence score — "89% match."

**Why this matters:** Prevents accidental or malicious cross-contamination of cat profiles. Flags low-confidence submissions for manual review rather than auto-accepting.

**Confidence thresholds:**
- ≥ 0.85 — Auto-accepted, high confidence
- 0.70–0.84 — Accepted with flag for review
- < 0.70 — Rejected, user prompted to re-check they selected the right cat

**CLIP embedding pipeline:**
```ts
// activities/clipActivity.ts
import fetch from 'node-fetch'

export async function generateCLIPEmbedding(imageUrl: string): Promise<number[]> {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
      body: JSON.stringify({ inputs: { image: imageUrl } })
    }
  )
  const data = await response.json()
  return data.embedding // 512 floats
}
```

**Demo script for judges:**
1. Show cat profile with founding photo (e.g. orange tabby, distinctive markings)
2. Upload a second photo of the same cat taken at a different time
3. System returns: "91% match — this is likely the same cat"
4. Upload a photo of a different cat
5. System returns: "34% match — low confidence, flagged for review"

---

### Feature 6 — Disappearance Alert System (Narrative Hook)

**User story:** If a registered cat hasn't had a sighting submitted in 7 days, the system automatically marks it as missing and pushes a notification to users who have previously submitted sightings for that cat.

**This is the pitch centrepiece:** transforms the app from a passive registry into an active welfare network.

**Implementation:** Temporal long-running workflow (see Workflows section) — NOT a Supabase cron job.

---

### Feature 7 — Cats Near Me Filter

**User story:** A user taps "Near Me" and the map filters to show only cats within a chosen radius (500m / 1km / 2km).

**Implementation:**
- Browser Geolocation API
- Haversine distance calculation client-side (no extra API call)
- Leaflet marker filtering — hide/show pins based on calculated distance

---

### Feature 8 — PWA Installation

**User story:** A user visits the app URL on their phone, is prompted to install it to their home screen, and from then on it opens full-screen like a native app.

**Setup:**
```js
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
})
module.exports = withPWA({})
```

```json
// public/manifest.json
{
  "name": "CatWatch",
  "short_name": "CatWatch",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#ff6b35",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## Temporal Workflows

Temporal replaces all fat async API routes and cron jobs with durable, observable, automatically-retried workflows. This is the primary Technical Execution differentiator and directly addresses the judging criteria ("consider using durable execution for reliable workflows").

### Why Temporal over cron jobs / plain async

If a normal async function fails midway (e.g. HuggingFace times out after the photo is uploaded but before the embedding is stored), the process is silently lost. Temporal guarantees every activity completes — failed steps are retried automatically with full state preservation.

### Workflow 1 — Sighting Submission

```ts
// workflows/sightingWorkflow.ts
import { proxyActivities, sleep } from '@temporalio/workflow'

const {
  generateCLIPEmbedding,
  matchCatEmbedding,
  updateCatLastSeen,
  flagLowConfidenceSubmission
} = proxyActivities({
  startToCloseTimeout: '30 seconds',
  retry: { maximumAttempts: 3 }
})

export async function sightingWorkflow(input: {
  catId: string
  photoUrl: string
  userId: string
  statusUpdate: string
  notes: string
}) {
  const embedding = await generateCLIPEmbedding(input.photoUrl)

  const matchResult = await matchCatEmbedding({
    catId: input.catId,
    embedding
  })

  if (matchResult.similarity < 0.70) {
    await flagLowConfidenceSubmission({
      catId: input.catId,
      similarity: matchResult.similarity
    })
    return { status: 'flagged', similarity: matchResult.similarity }
  }

  await updateCatLastSeen({
    catId: input.catId,
    statusUpdate: input.statusUpdate,
    photoUrl: input.photoUrl,
    embedding,
    matchScore: matchResult.similarity
  })

  return { status: 'accepted', similarity: matchResult.similarity }
}
```

### Workflow 2 — Disappearance Detection (Perpetual)

```ts
// workflows/disappearanceWorkflow.ts
import { proxyActivities, sleep, continueAsNew } from '@temporalio/workflow'

const {
  fetchCatsNotSeenSince,
  markCatAsMissing,
  notifyNearbyUsers,
  sendEmailAlert
} = proxyActivities({
  startToCloseTimeout: '60 seconds',
  retry: { maximumAttempts: 3 }
})

export async function disappearanceDetectionWorkflow() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const missingCats = await fetchCatsNotSeenSince(sevenDaysAgo)

  for (const cat of missingCats) {
    await markCatAsMissing({ catId: cat.id })
    await notifyNearbyUsers({ cat })
    await sendEmailAlert({ cat })
  }

  // Sleep 24 hours then restart cleanly — idiomatic Temporal pattern
  await sleep('24 hours')
  await continueAsNew()
}
```

### Workflow 3 — Cat Registration

```ts
// workflows/registrationWorkflow.ts
export async function catRegistrationWorkflow(input: {
  photoUrl: string
  catDetails: CatDetails
  userId: string
}) {
  const embedding = await generateCLIPEmbedding(input.photoUrl)

  const fuzzedCoords = await fuzzCoordinates({
    lat: input.catDetails.lat,
    lng: input.catDetails.lng
  })

  const cat = await insertCatRecord({
    ...input.catDetails,
    ...fuzzedCoords
  })

  await insertFoundingSighting({
    catId: cat.id,
    photoUrl: input.photoUrl,
    embedding,
    submittedBy: input.userId
  })

  return { catId: cat.id }
}
```

### API Routes as Thin Triggers

```ts
// app/api/sightings/route.ts
import { Connection, Client } from '@temporalio/client'
import { sightingWorkflow } from '@/workflows/sightingWorkflow'

export async function POST(req: Request) {
  const body = await req.json()

  // Rate limit check — fast, synchronous, stays in API route
  const count = await redis.incr(`submissions:${body.userId}`)
  if (count > 10) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  if (count === 1) await redis.expire(`submissions:${body.userId}`, 3600)

  // Trigger workflow — returns immediately
  const client = new Client({ connection: await Connection.connect() })

  const handle = await client.workflow.start(sightingWorkflow, {
    args: [body],
    taskQueue: 'catwatch',
    workflowId: `sighting-${body.catId}-${Date.now()}`
  })

  return Response.json({
    workflowId: handle.workflowId,
    status: 'processing'
  })
}
```

---

## Security Strategy

### Aikido Security Scan

1. Create free account at [aikido.dev](https://aikido.dev)
2. Connect GitHub repository
3. Run scan (automated — takes a few minutes)
4. Download PDF report
5. Include report in submission and reference it in README

Philippe Dourassov from Aikido Security is one of the judges. Submitting an Aikido report is the highest effort-to-reward action in the entire rubric.

### Security Practices in Code

| Practice | Location | Notes |
|---|---|---|
| Coordinate fuzzing | Cat Registration Workflow | Random ±~50m offset before DB write |
| Rate limiting | All mutation API routes | Upstash Redis, 10 submissions/user/hour |
| Input validation | All API routes | Zod schema validation server-side |
| Row Level Security | Supabase (all tables) | Public read, authenticated write |
| Parameterised queries | Throughout | Supabase client — no raw SQL |
| Auth required for mutations | All write endpoints | Supabase Auth middleware |
| No secrets in repo | .env.local + Vercel env vars | Aikido scan will catch any leaks |

---

## Work Split

### Developer (Backend + AI + Temporal) — Wei Feng

- [ ] Supabase project setup — schema, pgvector extension, RLS policies
- [ ] pgvector similarity function (`match_cat_embedding`)
- [ ] HuggingFace CLIP integration — activity implementation
- [ ] Temporal Cloud setup — worker, task queue, workflow registration
- [ ] Temporal workflows — sighting, registration, disappearance detection
- [ ] Activity implementations — all DB writes, CLIP calls, push/email dispatch
- [ ] API routes — thin triggers for each workflow
- [ ] Rate limiting — Upstash Redis setup and middleware
- [ ] Resend email integration for alert fallback
- [ ] Aikido security scan — run against repo, include report
- [ ] Vercel deployment + environment variable configuration
- [ ] README + architecture documentation

### Designer/Frontend (UI/UX + Frontend) — Partner

- [ ] Mobile-first Tailwind design system and component palette
- [ ] Leaflet map — colour-coded pins, tap-to-open profile card
- [ ] Cat profile page — photo gallery, status badge, sighting history feed
- [ ] Camera-enabled photo submission flow
- [ ] Cat registration multi-step form
- [ ] "Cats Near Me" radius filter UI
- [ ] Sighting submission status indicator (workflow processing state)
- [ ] PWA manifest, app icons, install prompt UI
- [ ] Push notification permission request flow
- [ ] Demo video recording and editing

---

## Pitch Narrative

> "There are thousands of community cats across Singapore, cared for by a loose network of feeders and volunteers. But when a cat goes missing, there's no system — just WhatsApp groups and hope.
>
> We built CatWatch: a community-powered platform where every community cat has a profile, every sighting builds a welfare history, and if a cat disappears, the neighbourhood gets alerted automatically.
>
> Our AI re-identification system uses CLIP embeddings to verify that photo submissions match the right cat — so a profile stays accurate even without a name tag. And every critical workflow runs on Temporal, so no sighting is ever silently lost."

---

## Prior Art & Differentiation

Existing apps in this space include:

| App | Gaps |
|---|---|
| The Stray App | Global focus, no disappearance alerts, no Temporal |
| Whisker Tracker | Poorly implemented, paywalled, no community care features |
| Pet Buddy SG | No AI re-ID, no alert system, no durable workflows |
| Catalog (2016, SG) | UX prototype only, never shipped |
| CWS + OneMap | Report-only, no cat identity tracking, no alerts |

**CatWatch differentiates on:**
1. Disappearance alert system — no existing app does this cleanly
2. CLIP re-ID with confidence scoring — most competitors claim it, none implement it well
3. Temporal-backed workflows — architectural reliability none of the above have
4. Singapore community cat context — TNR status, CWS alignment, local relevance

---

## Next Steps

- [ ] Align this document with UI/UX mockups from partner
- [ ] Scaffold Next.js project with Tailwind + shadcn/ui + next-pwa
- [ ] Set up Supabase project — run schema SQL, enable pgvector
- [ ] Set up Temporal Cloud account and connect TypeScript SDK
- [ ] Implement and test CLIP embedding pipeline end-to-end
- [ ] Implement sighting workflow with re-ID confidence scoring
- [ ] Implement disappearance detection perpetual workflow
- [ ] Run Aikido scan on repo before final submission
- [ ] Record demo video
- [ ] Write final README

---

*This document was generated from an architectural planning conversation and should be treated as a living spec. Update it as UI/UX mockups are finalised and implementation decisions are made.*
