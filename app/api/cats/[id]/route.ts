import { NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseAdminClient } from "@/lib/supabase"

type SightingRow = {
  id: string
  photo_url: string
  status_update: string | null
  notes: string | null
  match_score: number | null
  created_at: string
  users: { display_name: string | null } | null
}

const idSchema = z.uuid()

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const parsedId = idSchema.safeParse(id)
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid cat id" }, { status: 400 })
  }

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("cats")
    .select(
      `
      id, name, breed, estimated_age, vaccinated, tnr, status, last_seen_at, lat, lng,
      sightings (
        id, photo_url, status_update, notes, match_score, created_at,
        users ( display_name )
      )
    `
    )
    .eq("id", parsedId.data)
    .order("created_at", { referencedTable: "sightings", ascending: false })
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: "Cat not found" }, { status: 404 })
  }

  // No generated Database types (no `supabase gen types` run), so
  // supabase-js can't infer the embedded relation's cardinality - cast to
  // the actual runtime shape instead (PostgREST returns a single object for
  // this belongs-to relation, not an array).
  const { sightings, ...cat } = data as unknown as {
    id: string
    name: string | null
    breed: string | null
    estimated_age: string | null
    vaccinated: boolean
    tnr: boolean
    status: string
    last_seen_at: string | null
    lat: number
    lng: number
    sightings: SightingRow[]
  }

  return NextResponse.json({
    ...cat,
    sightings: sightings.map((s) => ({
      id: s.id,
      photo_url: s.photo_url,
      status_update: s.status_update,
      notes: s.notes,
      match_score: s.match_score,
      submitted_by_name: s.users?.display_name ?? null,
      created_at: s.created_at,
    })),
  })
}
