import { getSupabaseBrowserClient } from "@/lib/supabase";

/**
 * SPEC.md photo flow: the client uploads to Supabase Storage FIRST, then
 * calls the API with the resulting public URL (endpoints reject any
 * `photo_url` that isn't a Storage URL). Shared by the registration form
 * (#16) and the sighting submission flow (#15).
 */
export async function uploadCatPhoto(file: File): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  // Sanitise the client-controlled filename before it becomes part of the
  // Storage object key (Aikido: path traversal) - keep the tail so the
  // extension survives.
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-64);
  const path = `${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from("cat-photos").upload(path, file, {
    contentType: file.type || "image/jpeg",
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from("cat-photos").getPublicUrl(path).data.publicUrl;
}
