import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Загружает файл в Supabase Storage и возвращает public URL.
 * Используется в admin-actions для cover/logo загрузок.
 */
export async function uploadCover(
  supabase: SupabaseClient,
  bucket: string,
  folder: string,
  file: File,
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    console.error("upload error", error);
    return null;
  }
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
