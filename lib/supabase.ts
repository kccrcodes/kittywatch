import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Browser-safe client (anon key). Used client-side only for the direct
 * Storage upload flow in SPEC.md's photo submission feature — never for
 * table reads/writes, those go through API routes + supabaseAdmin.
 */
export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }
  return createClient(supabaseUrl, anonKey)
}

/**
 * Server-only client (service role key, bypasses RLS). Use inside API
 * routes for every table read/write. Never import this from client
 * components — it would leak the service role key to the browser.
 */
export function getSupabaseAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}
