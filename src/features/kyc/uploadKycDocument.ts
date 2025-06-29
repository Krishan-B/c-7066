import { supabase } from "../../lib/supabaseClient";

export async function uploadKycDocument(file: File, userId: string) {
  const { data, error } = await supabase.storage
    .from("kyc-documents")
    .upload(`${userId}/${file.name}`, file, { upsert: true });
  if (error) throw error;
  return data;
}
