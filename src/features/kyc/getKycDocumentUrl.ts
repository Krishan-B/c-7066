import { supabase } from "../../lib/supabaseClient";

export function getKycDocumentUrl(userId: string, fileName: string) {
  const { data } = supabase.storage
    .from("kyc-documents")
    .getPublicUrl(`${userId}/${fileName}`);
  return data.publicUrl;
}
