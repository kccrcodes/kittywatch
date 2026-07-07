# CatWatch

> Every stray cat gets a digital heartbeat. If it flatlines, the neighbourhood knows.

A mobile-first PWA for finding and tracking community/stray cats. Register a cat on a map, log sightings with a photo, and get alerted when a cat hasn't been seen in a while. A CLIP-based re-identification model confirms each photo submission matches the right cat before its profile updates.

Built for **#hackthekitty 2026**.

## The three problems it solves

1. Cat lovers without cats who want to find community cats to visit.
2. Community cats that vanish from their usual spots and go uncared-for.
3. Community cats in accidents/distress that no one notices in time.

## Stack

Next.js 16 (App Router, Turbopack) · Tailwind v4 · shadcn/ui · Leaflet.js · Supabase (Postgres + Storage + pgvector) · local CLIP (`@huggingface/transformers`) · Upstash Redis · Vercel · `pg_cron`

Full breakdown: [docs/architecture.md](docs/architecture.md). Security measures: [docs/security.md](docs/security.md). Product spec: [docs/SPEC.md](docs/SPEC.md).

## Running locally

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - In the SQL Editor, run `supabase/schema.sql`, then `supabase/policies.sql`
   - Grab your Project URL + anon key + service role key from Project Settings → API

3. **Set up Upstash** (rate limiting)
   - Create a Redis database at [upstash.com](https://upstash.com)
   - Grab the REST URL + token

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the Supabase and Upstash values above, plus a random string for `ADMIN_RUN_CHECK_TOKEN` (gates the manual disappearance-check trigger).

5. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Visit `/api/health` to confirm the Supabase connection is working.

## De-risking CLIP

`scripts/derisk-clip.mjs` confirms CLIP embeddings actually discriminate same-cat vs. different-cat photos before anything downstream depends on it. Drop 3 test photos (2 of the same cat, 1 of a different cat) into `scripts/clip-test-photos/` and run:
```bash
node scripts/derisk-clip.mjs
```

## Project docs

| Doc | What's in it |
|---|---|
| [docs/SPEC.md](docs/SPEC.md) | Product spec, data model, API contract, feature list |
| [docs/architecture.md](docs/architecture.md) | Current architecture, what shipped vs. what was cut and why |
| [docs/security.md](docs/security.md) | Security measures + Aikido scan reference |
| [docs/design.md](docs/design.md) | Visual design system, tokens, component specs |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Milestone-by-milestone build plan |
| [docs/INITIAL_ISSUES_MILESTONES.md](docs/INITIAL_ISSUES_MILESTONES.md) | Issue/milestone breakdown, reconciled against the original architecture doc |
