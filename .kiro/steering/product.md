---
inclusion: always
---

# CatWatch

A mobile-first PWA for finding and tracking community/stray cats. Register a
cat on a map, log sightings with a photo, get alerted when a cat hasn't been
seen in a while. A CLIP-based re-identification model confirms each photo
submission matches the right cat.

> Pitch: Every stray cat gets a digital heartbeat. If it flatlines, the
> neighbourhood knows.

Built for **#hackthekitty 2026**. Judged on a <5 min video demo + repo + docs
— no live stage demo. Full rubric and feature list: `docs/SPEC.md`.

## The three problems it solves
1. Cat lovers without cats who want to find community cats to visit.
2. Community cats that vanish from their usual spots and go uncared-for.
3. Community cats in accidents/distress that no one notices in time.

## Non-negotiables (read before proposing changes)
- **Mobile-first only.** ~390px width, one-handed, outdoors, in sunlight.
  Desktop is an explicit `[CUT]` — do not add responsive-desktop scope back in.
- **Two hero moments carry the whole pitch:** the CLIP re-ID match reveal, and
  the disappearance alert / missing-cat state. Protect these over anything else.
- **Auth is deferred.** Hardcoded demo user/device id for the hackathon window.
  Don't propose real OAuth work unless explicitly asked.
- **Temporal is a stretch goal, not core.** Disappearance detection is a
  Supabase cron + manual trigger endpoint by default — see `docs/SPEC.md` §API
  contract and `docs/INITIAL_ISSUES_MILESTONES.md` §1 for why this differs
  from the original architecture doc.
