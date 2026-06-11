import { createClient } from "@supabase/supabase-js";

// =========================================================================
//                   SUPABASE CONFIGURATION AND CREDENTIALS
// =========================================================================
// To connect to your Supabase instance, you can either:
// 1. Create a ".env" file in the root of your project and populate it with:
//    VITE_SUPABASE_URL="https://your-actual-project-id.supabase.co"
//    VITE_SUPABASE_PUBLIC_KEY="your-actual-public-anon-key"
// 
// 2. Or, you can directly replace the fallback strings below:
// =========================================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://your-project-id.supabase.co";
const SUPABASE_PUBLIC_KEY = import.meta.env.VITE_SUPABASE_PUBLIC_KEY || "your-public-anon-key";

export const isSupabaseConfigured = 
  SUPABASE_URL && 
  !SUPABASE_URL.includes("your-project-id") && 
  SUPABASE_PUBLIC_KEY && 
  !SUPABASE_PUBLIC_KEY.includes("your-public-anon-key");

// Create and export a single Supabase client for the entire application
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
