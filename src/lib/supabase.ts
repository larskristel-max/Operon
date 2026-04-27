import { createClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "@/config/env";

const { url, anonKey } = requireSupabaseEnv();

export const supabase = createClient(url, anonKey);
