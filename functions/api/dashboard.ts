import { verifySupabaseJwt, unauthorizedResponse, jsonResponse, type AuthEnv } from "../_shared/auth";

interface Env extends AuthEnv {
  SUPABASE_SERVICE_ROLE_KEY: string;
}

type JsonRecord = Record<string, unknown>;

interface DashboardResponse {
  tanks: JsonRecord[];
  batches: JsonRecord[];
  tasks: JsonRecord[];
  inventory: JsonRecord;
}

const EMPTY_DASHBOARD: DashboardResponse = {
  tanks: [],
  batches: [],
  tasks: [],
  inventory: {},
};

function adminHeaders(env: Env): Record<string, string> {
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

async function fetchRows(
  env: Env,
  tableName: string,
  breweryId: string,
  orderClause = "created_at.desc"
): Promise<JsonRecord[]> {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/${tableName}?brewery_id=eq.${encodeURIComponent(
      breweryId
    )}&select=*&order=${encodeURIComponent(orderClause)}`,
    { headers: adminHeaders(env) }
  );

  return parseSupabaseResponse<JsonRecord[]>(res, `Failed to load ${tableName}`);
}

async function fetchOptionalRows(
  env: Env,
  tableName: string,
  breweryId: string,
  orderClause = "created_at.desc"
): Promise<JsonRecord[]> {
  try {
    return await fetchRows(env, tableName, breweryId, orderClause);
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    const isMissingRelation = message.includes("relation") || message.includes("could not find") || message.includes("does not exist");
    const isMissingColumn = message.includes("brewery_id");

    if (isMissingRelation || isMissingColumn) {
      return [];
    }

    throw error;
  }
}

async function resolveBreweryId(env: Env, userId: string): Promise<string | null> {
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

function summarizeInventory(items: JsonRecord[]): JsonRecord {
  const byCategory: Record<string, number> = {};

  for (const item of items) {
    const categoryRaw = item.category;
    const category = typeof categoryRaw === "string" && categoryRaw.trim().length > 0 ? categoryRaw.trim() : "uncategorized";
    byCategory[category] = (byCategory[category] ?? 0) + 1;
  }

  return {
    total_items: items.length,
    by_category: byCategory,
    items,
  };
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const user = await verifySupabaseJwt(request.headers.get("Authorization"), env);
  if (!user) return unauthorizedResponse();

  try {
    const breweryId = await resolveBreweryId(env, user.id);
    if (!breweryId) {
      return jsonResponse(EMPTY_DASHBOARD);
    }

    const [tanks, batches, tasks, inventoryItems] = await Promise.all([
      fetchOptionalRows(env, "tanks", breweryId, "name.asc"),
      fetchRows(env, "batches", breweryId, "created_at.desc"),
      fetchRows(env, "tasks", breweryId, "created_at.desc"),
      fetchOptionalRows(env, "inventory_items", breweryId, "created_at.desc"),
    ]);

    return jsonResponse({
      tanks,
      batches,
      tasks,
      inventory: summarizeInventory(inventoryItems),
    });
  } catch {
    return jsonResponse(EMPTY_DASHBOARD);
  }
}
