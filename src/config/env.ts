const env = import.meta.env;

export const SUPABASE_URL = env.VITE_SUPABASE_URL as string | undefined;
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function hasSupabaseEnv(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getMissingSupabaseEnvVars(): string[] {
  const missing: string[] = [];

  if (!SUPABASE_URL) missing.push("VITE_SUPABASE_URL");
  if (!SUPABASE_ANON_KEY) missing.push("VITE_SUPABASE_ANON_KEY");

  return missing;
}

export function requireSupabaseEnv(): { url: string; anonKey: string } {
  const missing = getMissingSupabaseEnvVars();

  if (missing.length > 0) {
    throw new Error(
      `[env] Missing required frontend Supabase environment variables: ${missing.join(", ")}. ` +
        "Configure these in Cloudflare Pages (Production + Preview) and local dev env before running the app."
    );
  }

  return {
    url: SUPABASE_URL as string,
    anonKey: SUPABASE_ANON_KEY as string,
  };
}
