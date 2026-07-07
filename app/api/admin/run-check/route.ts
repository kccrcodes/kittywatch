import { NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { MISSING_THRESHOLD_DAYS } from "@/lib/config"

// Demo/admin trigger for the disappearance check - the real schedule is
// pg_cron (see supabase/schema.sql), but a video demo can't wait 7 days,
// hence the configurable threshold_days here.
//
// Gated by a shared-secret bearer token (ADMIN_RUN_CHECK_TOKEN) rather than
// left open - this is a publicly reachable Vercel URL that can flip every
// cat to 'missing' with threshold_days: 0, which could wreck a live demo
// if anyone found the endpoint. Not full auth (still deferred per
// docs/SPEC.md), just enough to stop anonymous abuse of this one route.
const runCheckSchema = z.object({
  threshold_days: z.coerce.number().int().positive().optional().default(MISSING_THRESHOLD_DAYS),
})

type FlippedCat = {
  cat_id: string
  name: string | null
  last_seen_at: string
}

export async function POST(request: Request) {
  const adminToken = process.env.ADMIN_RUN_CHECK_TOKEN
  if (!adminToken) {
    // Fail closed - an unset token should never mean "no auth required".
    return NextResponse.json({ error: "ADMIN_RUN_CHECK_TOKEN is not configured" }, { status: 500 })
  }
  if (request.headers.get("authorization") !== `Bearer ${adminToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
