# Kiro track write-up

CatWatch opts into the AWS/Kiro sponsor track.

## Why
Most of the hackathon's judgment calls so far weren't "what feature to build"
but "what to cut, and why" — Temporal demoted from core to stretch goal,
`next-pwa` dropped for Next 16's built-in manifest, auth deferred to a
hardcoded demo user, HF's hosted CLIP API swapped for a local model after it
turned out not to support raw embeddings. Kiro's steering + spec-driven
workflow is a natural fit for keeping those decisions legible as the team
executes fast under a 2-day deadline, rather than losing them to Slack/DM
history.

## How it's used here
- **Steering** (`.kiro/steering/`): `product.md` and `tech.md` capture the
  non-negotiables and current stack decisions so any agent-assisted work
  (Kiro or otherwise) starts from the same constraints instead of
  rediscovering them per session — mirrors `docs/SPEC.md`/`docs/design.md`
  but scoped for steering an agent specifically.
- **Specs** (`.kiro/specs/`): reserved for the two hero features (CLIP re-ID
  reveal, disappearance alert) and any other feature with a non-obvious
  design decision, written as requirements → design → tasks before
  implementation.

## Status
Scaffolded early per `docs/ROADMAP.md` Phase 0 ("decide Kiro opt-in now — it
changes your agent workflow"), rather than retrofitted after the fact. Specs
get filled in as Milestone 1/2 backend issues are picked up.
