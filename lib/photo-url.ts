// photo_url is user-controlled but gets passed straight into a server-side
// fetch() (lib/clip.ts's generateClipEmbedding) to generate a CLIP
// embedding. Without this check, that's an SSRF hole - a client could point
// it at an internal URL (e.g. cloud metadata endpoints) or an oversized
// response. Per docs/SPEC.md's photo flow, the client always uploads to
// Supabase Storage first and sends the resulting URL - so anything else is
// invalid input, not just untrusted.
export function isSupabaseStorageUrl(url: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return false

  try {
    const allowedHost = new URL(supabaseUrl).host
    const parsed = new URL(url)
    return parsed.protocol === "https:" && parsed.host === allowedHost && parsed.pathname.startsWith("/storage/v1/object/")
  } catch {
    return false
  }
}
