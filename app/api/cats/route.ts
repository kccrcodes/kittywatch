import { NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { generateClipEmbedding, embeddingToPgVector } from "@/lib/clip"
import { fuzzCoordinate } from "@/lib/geo"

// CLIP model load + inference on a cold start can take a while - give this
// route more headroom than Vercel's default.
export const maxDuration = 60

const registerCatSchema = z.object({
  name: z.string().trim().min(1).optional(),
  breed: z.string().trim().min(1).optional(),
  estimated_age: z.string().trim().min(1).optional(),
  vaccinated: z.boolean().optional().default(false),
  tnr: z.boolean().optional().default(false),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  photo_url: z.string().url(),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = registerCatSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const input = parsed.data
  const fuzzed = fuzzCoordinate(input.lat, input.lng)

  let embedding: number[] | null = null
  try {
    embedding = await generateClipEmbedding(input.photo_url)
  } catch (err) {
    // Founding embedding failing shouldn't block registration - the cat
    // still gets created; later sightings just have nothing to compare
    // against yet, so match_cat_embedding returns no rows until one does.
    console.error("CLIP embedding failed for founding sighting:", err)
  }

  const supabase = getSupabaseAdminClient()
  const { data: cat, error } = await supabase
    .rpc("register_cat", {
      p_name: input.name ?? null,
      p_breed: input.breed ?? null,
      p_estimated_age: input.estimated_age ?? null,
      p_vaccinated: input.vaccinated,
      p_tnr: input.tnr,
      p_lat: fuzzed.lat,
      p_lng: fuzzed.lng,
      p_photo_url: input.photo_url,
      p_embedding: embedding ? embeddingToPgVector(embedding) : null,
    })
    .single()

  if (error || !cat) {
    return NextResponse.json({ error: error?.message ?? "Failed to register cat" }, { status: 500 })
  }

  return NextResponse.json(cat, { status: 201 })
}
