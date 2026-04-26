import { verifySupabaseJwt, unauthorizedResponse, jsonResponse, type AuthEnv } from "../../_shared/auth";

interface Env extends AuthEnv {
  SUPABASE_SERVICE_ROLE_KEY: string;
}

interface ProvisionRequestBody {
  first_name: string;
  last_name?: string;
  brewery_name: string;
}

type JsonRecord = Record<string, unknown>;

function adminHeaders(env: Env): Record<string, string> {
  return {
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
  };
}

async function parseResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  const text = await res.text();
  const payload = text ? (JSON.parse(text) as T | { message?: string; error?: string; hint?: string }) : ({} as T);

  if (!res.ok) {
    const maybeError = payload as { message?: string; error?: string; hint?: string };
    throw new Error(maybeError.message ?? maybeError.error ?? maybeError.hint ?? `${fallbackMessage} (${res.status})`);
  }

  return payload as T;
}

async function findExistingMembership(env: Env, userId: string): Promise<{ brewery_id: string } | null> {
  const membershipRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/brewery_memberships?user_id=eq.${encodeURIComponent(
      userId
    )}&select=brewery_id&order=created_at.asc&limit=1`,
    { headers: adminHeaders(env) }
  );

  if (membershipRes.ok) {
    const memberships = await parseResponse<Array<{ brewery_id?: string | null }>>(
      membershipRes,
      "Failed to load brewery memberships"
    );
    const breweryId = memberships[0]?.brewery_id;
    if (breweryId) return { brewery_id: breweryId };
  }

  const userRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(userId)}&select=brewery_id&limit=1`,
    { headers: adminHeaders(env) }
  );

  if (!userRes.ok) return null;
  const users = await parseResponse<Array<{ brewery_id?: string | null }>>(userRes, "Failed to load users");
  const breweryId = users[0]?.brewery_id;
  if (!breweryId) return null;
  return { brewery_id: breweryId };
}

async function fetchBrewery(env: Env, breweryId: string): Promise<JsonRecord | null> {
  const breweriesRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/breweries?id=eq.${encodeURIComponent(breweryId)}&select=*&limit=1`,
    { headers: adminHeaders(env) }
  );
  if (breweriesRes.ok) {
    const rows = await parseResponse<JsonRecord[]>(breweriesRes, "Failed to load breweries");
    if (rows[0]) return rows[0];
  }

  const profilesRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/brewery_profiles?id=eq.${encodeURIComponent(breweryId)}&select=*&limit=1`,
    { headers: adminHeaders(env) }
  );
  if (!profilesRes.ok) return null;
  const rows = await parseResponse<JsonRecord[]>(profilesRes, "Failed to load brewery profile");
  return rows[0] ?? null;
}

async function fetchMembership(env: Env, userId: string, breweryId: string): Promise<JsonRecord | null> {
  const membershipsRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/brewery_memberships?user_id=eq.${encodeURIComponent(
      userId
    )}&brewery_id=eq.${encodeURIComponent(breweryId)}&select=*&order=created_at.asc&limit=1`,
    { headers: adminHeaders(env) }
  );
  if (membershipsRes.ok) {
    const rows = await parseResponse<JsonRecord[]>(membershipsRes, "Failed to load membership");
    if (rows[0]) return rows[0];
  }

  const usersRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/brewery_users?user_id=eq.${encodeURIComponent(
      userId
    )}&brewery_id=eq.${encodeURIComponent(breweryId)}&select=*&limit=1`,
    { headers: adminHeaders(env) }
  );
  if (!usersRes.ok) return null;
  const rows = await parseResponse<JsonRecord[]>(usersRes, "Failed to load brewery users");
  return rows[0] ?? null;
}

async function mergeUserMetadata(
  env: Env,
  userId: string,
  metadata: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const readRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "GET",
    headers: adminHeaders(env),
  });
  const readUser = readRes.ok
    ? ((await parseResponse<Record<string, unknown>>(readRes, "Failed to load auth user")) as {
        user_metadata?: Record<string, unknown>;
        user?: { user_metadata?: Record<string, unknown> };
      })
    : {};

  const existing = readUser.user_metadata ?? readUser.user?.user_metadata ?? {};
  const merged = { ...existing, ...metadata };

  const updateRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "PUT",
    headers: adminHeaders(env),
    body: JSON.stringify({ user_metadata: merged }),
  });
  await parseResponse<Record<string, unknown>>(updateRes, "Failed to update auth metadata");
  return merged;
}

async function callProvisionRpc(
  env: Env,
  userId: string,
  email: string,
  fullName: string,
  breweryName: string
): Promise<string> {
  const rpcRes = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/provision_brewery`, {
    method: "POST",
    headers: {
      ...adminHeaders(env),
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      p_auth_user_id: userId,
      p_user_name: fullName,
      p_user_email: email,
      p_brewery_name: breweryName,
      p_country: "",
      p_language: "en",
      p_timezone: "UTC",
      p_emcs_enabled: false,
      p_notion_source_id: null,
    }),
  });

  const payload = await parseResponse<{ brewery_id?: string }>(rpcRes, "Provisioning failed");
  if (!payload.brewery_id) throw new Error("Provisioning failed: missing brewery id");
  return payload.brewery_id;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const authUser = await verifySupabaseJwt(request.headers.get("Authorization"), env);
  if (!authUser) return unauthorizedResponse();

  let body: ProvisionRequestBody;
  try {
    body = (await request.json()) as ProvisionRequestBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const firstName = body.first_name?.trim();
  const lastName = body.last_name?.trim() ?? "";
  const breweryName = body.brewery_name?.trim();
  if (!firstName || !breweryName) {
    return jsonResponse({ error: "first_name and brewery_name are required" }, 400);
  }

  const displayName = [firstName, lastName].filter(Boolean).join(" ");

  try {
    const profileMetadata = await mergeUserMetadata(env, authUser.id, {
      first_name: firstName,
      last_name: lastName,
      display_name: displayName,
      full_name: displayName,
    });

    const existing = await findExistingMembership(env, authUser.id);
    const breweryId =
      existing?.brewery_id ?? (await callProvisionRpc(env, authUser.id, authUser.email ?? "", displayName, breweryName));

    const [brewery, membership] = await Promise.all([
      fetchBrewery(env, breweryId),
      fetchMembership(env, authUser.id, breweryId),
    ]);

    return jsonResponse({
      profile: {
        id: authUser.id,
        email: authUser.email ?? null,
        ...profileMetadata,
      },
      brewery: brewery ?? { id: breweryId },
      membership: membership ?? { user_id: authUser.id, brewery_id: breweryId },
    });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Provisioning failed" }, 500);
  }
}
