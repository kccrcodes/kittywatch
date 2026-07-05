---
inclusion: always
---

# Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack), Tailwind v4 (`@theme inline` in `globals.css`, no `tailwind.config.js`), shadcn/ui (new-york), Leaflet.js, React Hook Form |
| PWA | Built-in `app/manifest.ts`. **Not `next-pwa`** — it needs webpack and fights Turbopack in Next 16. Serwist only if offline caching is actually needed. |
| Backend | Next.js API routes, Supabase (Postgres + Storage + pgvector), Upstash Redis (rate limiting) |
| AI | Local CLIP via `@huggingface/transformers` (`Xenova/clip-vit-base-patch32`) — **not** HF's hosted Inference API, which doesn't support raw image embeddings for this model (see `scripts/derisk-clip.mjs`) |
| Fonts | Fredoka (display), Nunito Sans (body) |
| Deploy | Vercel (app + API routes), Supabase (managed DB/storage) |

## Conventions
- No semicolons, double quotes in `lib/*.ts` (match existing style).
- All Supabase table writes go through `lib/supabase.ts`'s `getSupabaseAdminClient()`
  (service role key, server-only) inside API routes — never the anon/browser
  client for table mutations. The browser client is for direct Storage
  uploads only.
- `docs/SPEC.md` is the live API contract. Don't change response shapes
  without updating it — the frontend is built against those exact shapes.
- Config constants (`STATUS`, `REID_THRESHOLD`, `COORD_FUZZ`, etc.) belong in
  one place — see `docs/SPEC.md` §Config constants — not scattered magic numbers.

## Commands
```bash
npm run dev            # Turbopack dev server
node scripts/derisk-clip.mjs       # CLIP same/different-cat discrimination check
node scripts/verify-supabase.mjs   # confirms tables/RPC/bucket are live
```
