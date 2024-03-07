import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "your-supabase-url";
const supabaseAnonKey = "your-supabase-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
