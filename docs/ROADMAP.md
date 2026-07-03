# CatWatch — ROADMAP

Live checklist. Reorder as you learn — that's the point.

**Owners:** `[You]` design / frontend · `[Partner]` backend / AI · `[Both]`
**Priority:** `[MUST]` demo breaks without it · `[SHOULD]` do if on track · `[CUT]` first to drop if tight

> **Format reality:** #hackthekitty is judged on a **video demo (< 5 min) + repo + docs — not a live stage demo.** That's good news: the "venue network dies" risk is gone, and you can seed state, retake, and edit. But the two hero moments still have to *resolve on screen in the video*, not just in narration.
>
> **Timeline reality:** submissions close **July 7, 23:59 BST**. Work top to bottom, stop at your own cut-line, and if a `[MUST]` is slipping, drop a whole `[CUT]` elsewhere rather than half-finishing two things. Everything above the first `[CUT]` in each phase is the real MVP.

Each phase notes the **rubric** it feeds (T = Technical 25 · I = Innovation 20 · Th = Theme 15 · S = Security 15 · UX 15 · Doc 10).

---

## Phase 0 — Day one: agree the contract + de-risk the scary part
*Feeds: T, sets up everything*

- [ ] `[Both][MUST]` Freeze schema + API shapes (SPEC.md). The seam that lets you split cleanly.
- [ ] `[Partner][MUST]` **De-risk CLIP first, before anything else.** Throwaway script: score same-cat photo pairs vs different-cat pairs on the HF free tier. If it doesn't discriminate, pivot to Replicate or local CLIP *today* — everything downstream is wasted otherwise.
- [ ] `[Partner][MUST]` Supabase up: tables, `pgvector` enabled, Storage bucket ready.
- [ ] `[You][MUST]` **One person scaffolds** the shared Next.js repo, commits, pushes (see *Scaffold* at bottom). Partner clones.
- [ ] `[You][MUST]` Drop the pastel tokens from `design.md` into `globals.css` (`@theme`, Tailwind v4). This file *is* your STYLE.md-in-code.
- [ ] `[You][MUST]` Lock the app name + design the app icon — it's on the home screen and on screen the entire video.
- [ ] `[You][MUST]` Build the `CatWatchLoading` component (spec is fully in `design.md`) — your first proof the identity survives contact with code.
- [ ] `[You][SHOULD]` Low-fi the 4 hero screens, **mobile 390px**: map · profile · submit · missing state.
- [ ] `[Both][SHOULD]` Decide Kiro opt-in (changes your agent workflow) and deploy the empty shell to Vercel (HTTPS = geolocation + camera + install work from day one).

---

## Phase 1 — Core loop (both in parallel)
*Feeds: T · Goal: register a cat → photograph it → its profile updates, end to end. Working before pretty.*

- [ ] `[Partner][MUST]` `POST /api/cats` — fuzz coords, insert, generate founding embedding.
- [ ] `[Partner][MUST]` `GET /api/cats` (bounding box) + `GET /api/cats/[id]`.
- [ ] `[Partner][MUST]` `POST /api/sightings` — embedding, match, update cat. **Stub `match_score`** if CLIP isn't wired yet so you're not blocked.
- [ ] `[You][MUST]` Map screen: Leaflet + colour-coded pins + geolocation centring. Mobile-first, FAB in thumb reach.
- [ ] `[You][MUST]` Cat profile as a **bottom sheet** on pin tap: gallery + sighting history + status badge.
- [ ] `[You][MUST]` Camera submission: `capture="environment"`, upload to Storage, POST.
- [ ] `[You][MUST]` Register flow: drop pin + form + founding photo.
- [ ] `[Both][MUST]` **Don't let auth block this.** Hardcode a demo user / device id. Real auth only if ahead.

---

## Phase 2 — The two hooks, made demoable
*Feeds: I, Th, UX — this is your whole story*

- [ ] `[Partner][MUST]` `match_cat_embedding` RPC live; surface `match_score` in the sighting response.
- [ ] `[You][MUST]` **Re-ID reveal in the UI** — a ring filling to "92% match" on submit. Your single most demo-able animation; design it deliberately.
- [ ] `[Partner][MUST]` Disappearance cron **+ manual `POST /api/admin/run-check` + configurable threshold** — you can't wait 7 days in the video.
- [ ] `[You][MUST]` Missing-cat state: profile + pin + alert that lands *emotionally* (Theme + UX), not just informationally.
- [ ] `[You][SHOULD]` Optimistic update on submit — profile visibly changes the instant a photo is sent.
- [ ] `[Partner][MUST]` Rate limiting (Upstash Redis, 10 / user / hour). *(Feeds S.)*
- [ ] `[Partner][SHOULD]` Web Push — **or fall back fast** to Resend email / in-app banner. VAPID + iOS is a known afternoon-eater; don't lose one to it.

---

## Phase 3 — Seed + polish
*Feeds: UX, Th, S*

- [ ] `[Both][MUST]` **Seed 15–20 believable cats** — real photos, fuzzed Singapore coords, mixed statuses. An empty map demos terribly and this always gets forgotten until the last hour.
- [ ] `[You][MUST]` PWA: `app/manifest.ts` + icons + install prompt. Confirm "Add to Home Screen" on a **real phone**. (Serwist only if you actually need offline caching — don't add it for its own sake.)
- [ ] `[Partner][MUST]` Run **Aikido scan**, save report to `docs/`. *(Feeds S — bonus points.)*
- [ ] `[You][SHOULD]` States pass: loading (skeletons, not spinners), empty, offline, error, success. This is where mobile web feels janky if skipped — and it's a real chunk of the UX score.
- [ ] `[You][CUT]` Responsive desktop adaptation.
- [ ] `[You][CUT]` Cats-near-me radius filter.
- [ ] `[You][CUT]` Badges / gamification.

---

## Phase 4 — Video + docs (you direct this)
*Feeds: Doc, and it's how every other criterion actually gets seen*

- [ ] `[You][MUST]` **Script the < 5-min run.** Both hero moments — the **re-ID score** and the **disappearance alert** — must resolve *on screen*.
- [ ] `[Both][MUST]` Choose two photogenic, **distinctive** cats for the re-ID demo and **test the score on them early**. Two plain grey cats make CLIP look broken.
- [ ] `[You][MUST]` Record on a **phone with the PWA installed** — strongest story, and since it's recorded you can retake until it's clean.
- [ ] `[Both][MUST]` `README.md` (front door): what it is · stack · how to run · one-line pitch. Plus `docs/architecture.md` and the `docs/security.md` (fuzzing + rate limit + Aikido). *(Doc is 10% and you already have most of it in SPEC/ROADMAP — just land it.)*
- [ ] `[You][SHOULD]` If you opted into Kiro, add the `.kiro` folder + short write-up for the track.

---

## Standing rules

- Anything touching the `users` table can wait — identity is a time-sink judges don't reward.
- The re-ID demo is your entire technical story. Protect it: test on your actual demo cats before you build the pitch around it.
- Spend design boldness in one place (the re-ID reveal / loading screen); keep everything around it quiet.
- Docs aren't a last-hour afterthought here — they're a scored deliverable (10% + they're how judges see the other 90%).
- If a `[MUST]` in an early phase is slipping, cut a whole `[CUT]` item elsewhere rather than half-finishing two things.

---

## Scaffold (the exact sequence, once)

```bash
npx create-next-app@latest catwatch     # accept defaults: TS, Tailwind, App Router, Turbopack, @/*  (Node 20.9+)
cd catwatch
npx shadcn@latest init                    # run BEFORE customizing globals.css — it overwrites the file
npx shadcn@latest add button card badge sheet dialog input avatar skeleton sonner progress alert tabs textarea
npm i react-leaflet leaflet react-hook-form @supabase/supabase-js lucide-react
```

Then: paste `design.md` tokens into `globals.css`, add `app/manifest.ts`, deploy the empty shell to Vercel, commit, push. **Do not add `next-pwa`** — use built-in manifest, or Serwist later if you need offline.
