import { NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { MISSING_THRESHOLD_DAYS } from "@/lib/config"

// Demo/admin trigger for the disappearance check - the real schedule is
// pg_cron (see supabase/schema.sql), but a video demo can't wait 7 days,
// hence the configurable threshold_days here.
//
// No auth/rate limiting on this route - auth is broadly deferred for the
// hackathon (see docs/SPEC.md), and this only flips cats to 'missing'
// early, it doesn't destroy data. Worth a mention in the security writeup
// as an accepted risk, same as the public Storage upload policy.
const runCheckSchema = z.object({
  threshold_days: z.coerce.number().int().positive().optional().default(MISSING_THRESHOLD_DAYS),
})

type FlippedCat = {
  cat_id: string
  name: string | null
  last_seen_at: string
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const parsed = runCheckSchema.safeParse(body ?? {})
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase.rpc("run_disappearance_check", {
    threshold_days: parsed.data.threshold_days,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const flipped = (data ?? []) as FlippedCat[]
  return NextResponse.json({
    threshold_days: parsed.data.threshold_days,
    flipped_to_missing: flipped,
    count: flipped.length,
  })
}
