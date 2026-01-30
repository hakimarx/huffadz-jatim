import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Storage functionality might not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadToSupabase(
    file: Buffer,
    filename: string,
    contentType: string,
    bucket: string = 'huffadz-storage'
) {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, file, {
            contentType,
            upsert: true,
        });

    if (error) {
        throw error;
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filename);

    return publicUrl;
}
