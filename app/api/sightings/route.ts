import { NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { generateClipEmbedding, embeddingToPgVector } from "@/lib/clip"
import { REID_THRESHOLD, SIGHTING_STATUS } from "@/lib/config"
import { isSupabaseStorageUrl } from "@/lib/photo-url"

// CLIP model load + inference on a cold start can take a while - give this
// route more headroom than Vercel's default.
export const maxDuration = 60

// Rate limiting (Upstash, 10/user/hour) is deliberately not in this route -
// tracked separately as Milestone 2 issue #23, since it needs its own
// Upstash account setup and applies to every mutation endpoint, not just
// this one.

const sightingStatusValues = Object.values(SIGHTING_STATUS) as [string, ...string[]]

// No generated Database types (no `supabase gen types` run) - supabase-js
// can't infer a SQL function's return row shape, so cast to the actual
// runtime shape (the sightings table's columns) instead.
type SightingResultRow = {
  id: string
  cat_id: string
  match_score: number | null
  status_update: string
  created_at: string
}

const submitSightingSchema = z.object({
  cat_id: z.uuid(),
  photo_url: z.string().url(),
  status_update: z.enum(sightingStatusValues),
  notes: z.string().trim().min(1).optional(),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = submitSightingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const input = parsed.data
  if (!isSupabaseStorageUrl(input.photo_url)) {
    return NextResponse.json({ error: "photo_url must be a Supabase Storage URL" }, { status: 400 })
  }

  const supabase = getSupabaseAdminClient()

  const { data: cat, error: catLookupError } = await supabase
    .from("cats")
    .select("id")
    .eq("id", input.cat_id)
    .maybeSingle()
  if (catLookupError) {
    return NextResponse.json({ error: catLookupError.message }, { status: 500 })
  }
  if (!cat) {
    return NextResponse.json({ error: "Cat not found" }, { status: 404 })
  }

  let embedding: number[] | null = null
  try {
    embedding = await generateClipEmbedding(input.photo_url)
  } catch (err) {
    // Sighting still gets recorded without a confidence score rather than
    // rejecting the submission outright - see match_score handling below.
    console.error("CLIP embedding failed for sighting:", err)
  }

  let matchScore: number | null = null
  if (embedding) {
    const { data: matchRows, error: matchError } = await supabase.rpc("match_cat_embedding", {
      cat_id: input.cat_id,
      query_embedding: embeddingToPgVector(embedding),
      threshold: REID_THRESHOLD,
    })
    if (matchError) {
      return NextResponse.json({ error: matchError.message }, { status: 500 })
    }
    // No rows if this cat has no prior embeddings to compare against yet.
    matchScore = matchRows?.[0]?.similarity ?? null
  }

  const flagged = matchScore !== null && matchScore < REID_THRESHOLD

  const { data: sighting, error: submitError } = await supabase
    .rpc("submit_sighting", {
      p_cat_id: input.cat_id,
      p_photo_url: input.photo_url,
      p_status_update: input.status_update,
      p_notes: input.notes ?? null,
      p_embedding: embedding ? embeddingToPgVector(embedding) : null,
      p_match_score: matchScore,
    })
    .single()

  if (submitError || !sighting) {
    return NextResponse.json({ error: submitError?.message ?? "Failed to submit sighting" }, { status: 500 })
  }
  const result = sighting as unknown as SightingResultRow

  return NextResponse.json(
    {
      id: result.id,
      cat_id: result.cat_id,
      match_score: result.match_score,
      flagged,
      status_update: result.status_update,
      created_at: result.created_at,
    },
    { status: 201 }
  )
}
