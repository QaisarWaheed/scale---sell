import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Supabase is optional - only used for auth in hybrid setup
export const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

// Helper to check if supabase is configured
export const isSupabaseConfigured = () => supabase !== null;
