import { createClient } from '@supabase/supabase-js';

import { env } from './config';

// Initialize Supabase client for storage
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// Storage service
export const storage = {
  /**
   * Upload file to storage bucket
   */
  uploadFile: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);

    if (error) throw error;
    return data;
  },

  /**
   * Get file URL from storage bucket
   */
  getFileUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Delete file from storage bucket
   */
  deleteFile: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;
    return data;
  },
};
