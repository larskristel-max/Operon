import { jsonResponse } from "./auth";

export interface DemoEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export interface DemoSessionRow {
  id: string;
  demo_brewery_id: string;
  created_at?: string;
  expires_at: string;
  status: string;
}

export type OverlayOperation = "insert" | "update" | "delete";

export interface OverlayRecordRow {
  id?: string;
  demo_session_id: string;
  table_name: string;
  record_id: string;
  operation: OverlayOperation;
  payload: Record<string, unknown> | null;
  created_at?: string;
}

export interface DemoDashboardData {
  brewery_profile: Record<string, unknown> | null;
  tanks: Array<Record<string, unknown>>;
  batches: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  ingredients: Array<Record<string, unknown>>;
  recipes: Array<Record<string, unknown>>;
  packaging_formats: Array<Record<string, unknown>>;
  lots: Array<Record<string, unknown>>;
  inventory_movements: Array<Record<string, unknown>>;
  sales: Array<Record<string, unknown>>;
}

export class DemoHttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function adminHeaders(env: DemoEnv): Record<string, string> {
  return {
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
  };
}

async function parseSupabaseResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  const text = await res.text();
  const payload = text ? (JSON.parse(text) as T | { message?: string; error?: string }) : ({} as T);

  if (!res.ok) {
    const maybeError = payload as { message?: string; error?: string };
    throw new DemoHttpError(maybeError.message ?? maybeError.error ?? `${fallbackMessage} (${res.status})`, res.status);
  }

  return payload as T;
}

function nowIso(): string {
  return new Date().toISOString();
}

function plusHoursIso(hours: number): string {
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  return expiresAt.toISOString();
}

export function mapDemoError(error: unknown, fallbackMessage: string): Response {
  if (error instanceof DemoHttpError) {
    return jsonResponse({ error: error.message }, error.status);
  }
  if (error instanceof Error) {
    return jsonResponse({ error: error.message }, 500);
  }
  return jsonResponse({ error: fallbackMessage }, 500);
}

export async function fetchDemoBrewery(env: DemoEnv): Promise<Record<string, unknown>> {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/brewery_profiles?is_demo=eq.true&select=id,name,display_name,timezone,currency,language&limit=1`,
    { headers: adminHeaders(env) }
  );

  const rows = await parseSupabaseResponse<Array<Record<string, unknown>>>(res, "Failed to load demo brewery");
  const brewery = rows[0];
  if (!brewery) throw new DemoHttpError("No demo brewery found", 404);
  return brewery;
}

export async function createDemoSession(env: DemoEnv, demoBreweryId: string): Promise<DemoSessionRow> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/demo_sessions`, {
    method: "POST",
    headers: {
      ...adminHeaders(env),
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      demo_brewery_id: demoBreweryId,
      expires_at: plusHoursIso(24),
      status: "active",
    }),
  });

  const rows = await parseSupabaseResponse<DemoSessionRow[]>(res, "Failed to create demo session");
  const session = rows[0];
  if (!session?.id) throw new DemoHttpError("Demo session create returned no id", 500);
  return session;
}

export async function fetchActiveDemoSession(env: DemoEnv, demoSessionId: string): Promise<DemoSessionRow> {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/demo_sessions?id=eq.${encodeURIComponent(
      demoSessionId
    )}&select=id,demo_brewery_id,created_at,expires_at,status&limit=1`,
    { headers: adminHeaders(env) }
  );

  const rows = await parseSupabaseResponse<DemoSessionRow[]>(res, "Failed to load demo session");
  const session = rows[0];
  if (!session?.id) throw new DemoHttpError("Demo session not found", 404);
  if (session.status !== "active") throw new DemoHttpError("Demo session is inactive", 410);
  if (session.expires_at <= nowIso()) throw new DemoHttpError("Demo session has expired", 410);
  return session;
}

export async function endDemoSession(env: DemoEnv, demoSessionId: string): Promise<void> {
  const session = await fetchActiveDemoSession(env, demoSessionId);

  const [overlayDeleteRes, sessionUpdateRes] = await Promise.all([
    fetch(`${env.SUPABASE_URL}/rest/v1/demo_overlay_records?demo_session_id=eq.${encodeURIComponent(demoSessionId)}`, {
      method: "DELETE",
      headers: {
        ...adminHeaders(env),
        Prefer: "return=minimal",
      },
    }),
    fetch(`${env.SUPABASE_URL}/rest/v1/demo_sessions?id=eq.${encodeURIComponent(session.id)}`, {
      method: "PATCH",
      headers: {
        ...adminHeaders(env),
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        status: "exited",
        expires_at: nowIso(),
      }),
    }),
  ]);

  await parseSupabaseResponse<Record<string, never>>(overlayDeleteRes, "Failed to clear overlay records");
  await parseSupabaseResponse<Record<string, never>>(sessionUpdateRes, "Failed to close demo session");
}

async function fetchTableRows(
  env: DemoEnv,
  tableName: string,
  breweryId: string,
  selectClause = "*",
  orderClause = "created_at.asc"
): Promise<Array<Record<string, unknown>>> {
  try {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/${tableName}?brewery_id=eq.${encodeURIComponent(
        breweryId
      )}&select=${encodeURIComponent(selectClause)}&order=${encodeURIComponent(orderClause)}`,
      { headers: adminHeaders(env) }
    );

    return await parseSupabaseResponse<Array<Record<string, unknown>>>(res, `Failed to load ${tableName}`);
  } catch (error) {
    if (!(error instanceof DemoHttpError)) throw error;

    const normalizedMessage = error.message.toLowerCase();
    const isSafeSkip =
      error.status === 400 &&
      (normalizedMessage.includes("brewery_id") ||
        normalizedMessage.includes("could not find the") ||
        normalizedMessage.includes("relation"));

    if (isSafeSkip) {
      return [];
    }

    throw error;
  }
}

export async function fetchDashboardBaseline(env: DemoEnv, demoBreweryId: string): Promise<DemoDashboardData> {
  const breweryRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/brewery_profiles?id=eq.${encodeURIComponent(
      demoBreweryId
    )}&select=*&limit=1`,
    { headers: adminHeaders(env) }
  );
  const breweryRows = await parseSupabaseResponse<Array<Record<string, unknown>>>(
    breweryRes,
    "Failed to load demo brewery profile"
  );

  const [tanks, batches, tasks, ingredients, recipes, packagingFormats, lots, inventoryMovements, sales] = await Promise.all([
    fetchTableRows(env, "tanks", demoBreweryId, "*", "name.asc"),
    fetchTableRows(env, "batches", demoBreweryId, "*", "created_at.desc"),
    fetchTableRows(env, "tasks", demoBreweryId, "*", "created_at.desc"),
    fetchTableRows(env, "ingredients", demoBreweryId, "*", "name.asc"),
    fetchTableRows(env, "recipes", demoBreweryId, "*", "name.asc"),
    fetchTableRows(env, "packaging_formats", demoBreweryId, "*", "name.asc"),
    fetchTableRows(env, "lots", demoBreweryId, "*", "created_at.desc"),
    fetchTableRows(env, "inventory_movements", demoBreweryId, "*", "created_at.desc"),
    fetchTableRows(env, "sales", demoBreweryId, "*", "created_at.desc"),
  ]);

  return {
    brewery_profile: breweryRows[0] ?? null,
    tanks,
    batches,
    tasks,
    ingredients,
    recipes,
    packaging_formats: packagingFormats,
    lots,
    inventory_movements: inventoryMovements,
    sales,
  };
}

export async function insertOverlayRecord(env: DemoEnv, overlay: OverlayRecordRow): Promise<OverlayRecordRow> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/demo_overlay_records`, {
    method: "POST",
    headers: {
      ...adminHeaders(env),
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      demo_session_id: overlay.demo_session_id,
      table_name: overlay.table_name,
      record_id: overlay.record_id,
      operation: overlay.operation,
      payload: overlay.payload,
    }),
  });

  const rows = await parseSupabaseResponse<OverlayRecordRow[]>(res, "Failed to persist overlay record");
  const row = rows[0];
  if (!row) throw new DemoHttpError("Overlay insert returned no row", 500);
  return row;
}

export async function fetchOverlayRecords(env: DemoEnv, demoSessionId: string): Promise<OverlayRecordRow[]> {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/demo_overlay_records?demo_session_id=eq.${encodeURIComponent(
      demoSessionId
    )}&select=id,demo_session_id,table_name,record_id,operation,payload,created_at&order=created_at.asc`,
    { headers: adminHeaders(env) }
  );

  return parseSupabaseResponse<OverlayRecordRow[]>(res, "Failed to load overlay records");
}

function applyOverlayToCollection(
  records: Array<Record<string, unknown>>,
  overlays: OverlayRecordRow[]
): Array<Record<string, unknown>> {
  const byId = new Map<string, Record<string, unknown>>();

  for (const record of records) {
    const id = record.id;
    if (typeof id === "string" && id.length > 0) byId.set(id, { ...record });
  }

  for (const overlay of overlays) {
    if (overlay.operation === "delete") {
      byId.delete(overlay.record_id);
      continue;
    }

    if (overlay.operation === "insert") {
      byId.set(overlay.record_id, { id: overlay.record_id, ...(overlay.payload ?? {}) });
      continue;
    }

    const existing = byId.get(overlay.record_id) ?? { id: overlay.record_id };
    byId.set(overlay.record_id, { ...existing, ...(overlay.payload ?? {}) });
  }

  return Array.from(byId.values());
}

const DASHBOARD_OVERLAY_TABLES: ReadonlyArray<keyof DemoDashboardData> = [
  "tanks",
  "batches",
  "tasks",
  "lots",
  "ingredients",
  "inventory_movements",
  "recipes",
  "packaging_formats",
  "sales",
];

export function applyDashboardOverlay(baseline: DemoDashboardData, overlays: OverlayRecordRow[]): DemoDashboardData {
  const merged: DemoDashboardData = {
    brewery_profile: baseline.brewery_profile,
    tanks: [...baseline.tanks],
    batches: [...baseline.batches],
    tasks: [...baseline.tasks],
    ingredients: [...baseline.ingredients],
    recipes: [...baseline.recipes],
    packaging_formats: [...baseline.packaging_formats],
    lots: [...baseline.lots],
    inventory_movements: [...baseline.inventory_movements],
    sales: [...baseline.sales],
  };

  for (const tableKey of DASHBOARD_OVERLAY_TABLES) {
    const tableOverlays = overlays.filter((record) => record.table_name === tableKey);
    merged[tableKey] = applyOverlayToCollection(merged[tableKey], tableOverlays);
  }

  return merged;
}

export async function buildDashboardPayload(env: DemoEnv, demoSessionId: string) {
  const session = await fetchActiveDemoSession(env, demoSessionId);
  const baseline = await fetchDashboardBaseline(env, session.demo_brewery_id);
  const overlays = await fetchOverlayRecords(env, demoSessionId);
  const merged = applyDashboardOverlay(baseline, overlays);

  return {
    demo_session_id: session.id,
    demo_brewery_id: session.demo_brewery_id,
    expires_at: session.expires_at,
    baseline,
    merged,
    overlay_count: overlays.length,
  };
}

export function missingSessionResponse(): Response {
  return jsonResponse({ error: "demo_session_id is required" }, 400);
}
