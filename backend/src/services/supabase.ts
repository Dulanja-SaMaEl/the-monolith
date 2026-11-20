import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';

export const isBackendSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseSecretKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-supabase-project')
);

if (!isBackendSupabaseConfigured) {
  console.warn('⚠️ Monolith LK Server: SUPABASE_URL or SUPABASE_SECRET_KEY is not defined.');
}

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseSecretKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
