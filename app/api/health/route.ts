import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const { error } = await supabase.from("cats").select("id").limit(1)
    if (error) throw error

    return NextResponse.json({ ok: true, supabase: "connected" })
  } catch (err) {
    return NextResponse.json(
      { ok: false, supabase: "unreachable", error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
