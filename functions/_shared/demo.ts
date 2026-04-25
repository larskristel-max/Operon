import { jsonResponse } from "./auth";

export interface DemoEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export interface DemoSessionRow {
  id: string;
  brewery_id: string;
  created_at?: string;
}

export interface OverlayRecordRow {
  id?: string;
  demo_session_id: string;
  target_table: string;
  target_id: string;
  action: "upsert" | "delete";
  payload: Record<string, unknown> | null;
  created_at?: string;
}

export interface DemoDashboardData {
  breweryProfile: Record<string, unknown> | null;
  tanks: Array<Record<string, unknown>>;
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
    throw new Error(maybeError.message ?? maybeError.error ?? `${fallbackMessage} (${res.status})`);
  }

  return payload as T;
}

export async function fetchDemoBrewery(env: DemoEnv): Promise<Record<string, unknown>> {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/brewery_profiles?is_demo=eq.true&select=id,name,display_name,timezone,currency,language&limit=1`,
    { headers: adminHeaders(env) }
  );

  const rows = await parseSupabaseResponse<Array<Record<string, unknown>>>(res, "Failed to load demo brewery");
  const brewery = rows[0];
  if (!brewery) throw new Error("No demo brewery found");
  return brewery;
}

export async function createDemoSession(env: DemoEnv, breweryId: string): Promise<DemoSessionRow> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/demo_sessions`, {
    method: "POST",
    headers: {
      ...adminHeaders(env),
      Prefer: "return=representation",
    },
    body: JSON.stringify({ brewery_id: breweryId }),
  });

  const rows = await parseSupabaseResponse<DemoSessionRow[]>(res, "Failed to create demo session");
  const session = rows[0];
  if (!session?.id) throw new Error("Demo session create returned no id");
  return session;
}

export async function fetchDemoSession(env: DemoEnv, demoSessionId: string): Promise<DemoSessionRow> {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/demo_sessions?id=eq.${encodeURIComponent(demoSessionId)}&select=id,brewery_id,created_at&limit=1`,
    { headers: adminHeaders(env) }
  );

  const rows = await parseSupabaseResponse<DemoSessionRow[]>(res, "Failed to load demo session");
  const session = rows[0];
  if (!session?.id) throw new Error("Demo session not found");
  return session;
}

export async function deleteDemoSession(env: DemoEnv, demoSessionId: string): Promise<void> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/demo_sessions?id=eq.${encodeURIComponent(demoSessionId)}`, {
    method: "DELETE",
    headers: {
      ...adminHeaders(env),
      Prefer: "return=minimal",
    },
  });

  await parseSupabaseResponse<Record<string, never>>(res, "Failed to delete demo session");
}

export async function fetchDashboardBaseline(env: DemoEnv, breweryId: string): Promise<DemoDashboardData> {
  const [breweryRes, tanksRes] = await Promise.all([
    fetch(
      `${env.SUPABASE_URL}/rest/v1/brewery_profiles?id=eq.${encodeURIComponent(
        breweryId
      )}&select=id,name,display_name,timezone,currency,language&limit=1`,
      { headers: adminHeaders(env) }
    ),
    fetch(
      `${env.SUPABASE_URL}/rest/v1/tanks?brewery_id=eq.${encodeURIComponent(
        breweryId
      )}&select=id,name,type,status,current_volume_liters,capacity_liters,updated_at&order=name.asc`,
      { headers: adminHeaders(env) }
    ),
  ]);

  const breweryRows = await parseSupabaseResponse<Array<Record<string, unknown>>>(
    breweryRes,
    "Failed to load demo brewery profile"
  );
  const tanks = await parseSupabaseResponse<Array<Record<string, unknown>>>(tanksRes, "Failed to load demo tanks");

  return {
    breweryProfile: breweryRows[0] ?? null,
    tanks,
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
      target_table: overlay.target_table,
      target_id: overlay.target_id,
      action: overlay.action,
      payload: overlay.payload,
    }),
  });

  const rows = await parseSupabaseResponse<OverlayRecordRow[]>(res, "Failed to persist overlay record");
  const row = rows[0];
  if (!row) throw new Error("Overlay insert returned no row");
  return row;
}

export async function fetchOverlayRecords(env: DemoEnv, demoSessionId: string): Promise<OverlayRecordRow[]> {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/demo_overlay_records?demo_session_id=eq.${encodeURIComponent(
      demoSessionId
    )}&select=id,demo_session_id,target_table,target_id,action,payload,created_at&order=created_at.asc`,
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
    if (overlay.action === "delete") {
      byId.delete(overlay.target_id);
      continue;
    }

    const existing = byId.get(overlay.target_id) ?? { id: overlay.target_id };
    byId.set(overlay.target_id, { ...existing, ...(overlay.payload ?? {}) });
  }

  return Array.from(byId.values());
}

export function applyDashboardOverlay(
  baseline: DemoDashboardData,
  overlays: OverlayRecordRow[]
): DemoDashboardData {
  const tankOverlays = overlays.filter((record) => record.target_table === "tanks");

  return {
    breweryProfile: baseline.breweryProfile,
    tanks: applyOverlayToCollection(baseline.tanks, tankOverlays),
  };
}

export function missingSessionResponse(): Response {
  return jsonResponse({ error: "demo_session_id is required" }, 400);
}
