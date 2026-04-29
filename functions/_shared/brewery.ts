import type { AuthEnv } from "./auth";

export interface BreweryEnv extends AuthEnv {
  SUPABASE_SERVICE_ROLE_KEY: string;
}

function adminHeaders(env: BreweryEnv): Record<string, string> {
  return {
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
  };
}

async function parseSupabaseResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  const text = await res.text();
  const payload = text ? (JSON.parse(text) as T | { message?: string; error?: string; hint?: string }) : ({} as T);

  if (!res.ok) {
    const maybeError = payload as { message?: string; error?: string; hint?: string };
    throw new Error(maybeError.message ?? maybeError.error ?? maybeError.hint ?? `${fallbackMessage} (${res.status})`);
  }

  return payload as T;
}

export async function resolveBreweryId(env: BreweryEnv, userId: string): Promise<string | null> {
  const membershipRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/brewery_memberships?user_id=eq.${encodeURIComponent(
      userId
    )}&select=brewery_id&order=created_at.asc&limit=1`,
    { headers: adminHeaders(env) }
  );

  if (membershipRes.ok) {
    const memberships = await parseSupabaseResponse<Array<{ brewery_id?: string | null }>>(
      membershipRes,
      "Failed to load brewery membership"
    );
    const breweryId = memberships[0]?.brewery_id;
    if (breweryId) return breweryId;
  }

  const usersViewRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/brewery_users?user_id=eq.${encodeURIComponent(
      userId
    )}&select=brewery_id&order=created_at.asc&limit=1`,
    { headers: adminHeaders(env) }
  );

  if (!usersViewRes.ok) {
    return null;
  }

  const memberships = await parseSupabaseResponse<Array<{ brewery_id?: string | null }>>(
    usersViewRes,
    "Failed to load brewery users"
  );

  return memberships[0]?.brewery_id ?? null;
}
