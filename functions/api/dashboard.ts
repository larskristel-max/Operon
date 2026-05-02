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
  inventory_movements: JsonRecord[];
  sales: JsonRecord[];
  lots: JsonRecord[];
  batch_inputs: JsonRecord[];
  brew_logs: JsonRecord[];
  fermentation_checks: JsonRecord[];
  pending_movements: JsonRecord[];
}

const EMPTY_DASHBOARD: DashboardResponse = {
  tanks: [],
  batches: [],
  tasks: [],
  inventory: {},
  inventory_movements: [],
  sales: [],
  lots: [],
  batch_inputs: [],
  brew_logs: [],
  fermentation_checks: [],
  pending_movements: [],
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

async function fetchFermentationChecksByBrewLogs(env: Env, brewLogs: JsonRecord[]): Promise<JsonRecord[]> {
  const ids = brewLogs.map((l) => l.id).filter((id): id is string => typeof id === "string" && id.length > 0);
  if (ids.length === 0) return [];
  try {
    const idList = ids.join(",");
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/fermentation_checks?brew_log_id=in.(${encodeURIComponent(idList)})&select=*&order=created_at.desc`,
      { headers: adminHeaders(env) }
    );
    return parseSupabaseResponse<JsonRecord[]>(res, "Failed to load fermentation_checks");
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("relation") || message.includes("does not exist") || message.includes("could not find")) return [];
    throw error;
  }
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

    const [tanks, batches, tasks, ingredientRows, inventoryMovements, sales, lots, batchInputs, brewLogs, pendingMovements] = await Promise.all([
      fetchOptionalRows(env, "tanks", breweryId, "name.asc"),
      fetchRows(env, "batches", breweryId, "created_at.desc"),
      fetchRows(env, "tasks", breweryId, "created_at.desc"),
      fetchOptionalRows(env, "ingredients", breweryId, "created_at.desc"),
      fetchOptionalRows(env, "inventory_movements", breweryId, "created_at.desc"),
      fetchOptionalRows(env, "sales", breweryId, "created_at.desc"),
      fetchOptionalRows(env, "lots", breweryId, "created_at.desc"),
      fetchOptionalRows(env, "batch_inputs", breweryId, "created_at.desc"),
      fetchOptionalRows(env, "brew_logs", breweryId, "created_at.desc"),
      fetchOptionalRows(env, "pending_movements", breweryId, "created_at.desc"),
    ]);

    const fermentationChecks = await fetchFermentationChecksByBrewLogs(env, brewLogs);

    return jsonResponse({
      tanks,
      batches,
      tasks,
      inventory: summarizeInventory(ingredientRows),
      inventory_movements: inventoryMovements,
      sales,
      lots,
      batch_inputs: batchInputs,
      brew_logs: brewLogs,
      fermentation_checks: fermentationChecks,
      pending_movements: pendingMovements,
    });
  } catch {
    return jsonResponse(EMPTY_DASHBOARD);
  }
}
