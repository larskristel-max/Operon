import { jsonResponse, unauthorizedResponse, verifySupabaseJwt } from "../../_shared/auth";
import { resolveBreweryId, type BreweryEnv } from "../../_shared/brewery";

type Env = BreweryEnv;

function adminHeaders(env: Env): Record<string, string> {
  return { Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY, "Content-Type": "application/json", Prefer: "return=representation" };
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const user = await verifySupabaseJwt(context.request.headers.get("Authorization"), context.env);
  if (!user) return unauthorizedResponse();
  const breweryId = await resolveBreweryId(context.env, user.id);
  if (!breweryId) return jsonResponse({ error: "No brewery membership found" }, 403);
  const body = (await context.request.json()) as { batchId?: string; status?: string };
  if (!body.batchId || body.status !== "brewing") return jsonResponse({ error: "Invalid payload" }, 400);
  const res = await fetch(`${context.env.SUPABASE_URL}/rest/v1/batches?id=eq.${encodeURIComponent(body.batchId)}&brewery_id=eq.${encodeURIComponent(breweryId)}&status=eq.planned`, {
    method: "PATCH",
    headers: adminHeaders(context.env),
    body: JSON.stringify({ status: "brewing", updated_at: new Date().toISOString() }),
  });
  const payload = await res.text();
  if (!res.ok) return jsonResponse({ error: "Failed to update batch status", detail: payload }, 400);
  let rows: unknown = null;
  try {
    rows = payload ? JSON.parse(payload) : null;
  } catch {
    rows = null;
  }
  if (!Array.isArray(rows) || rows.length !== 1) {
    return jsonResponse({ error: "Batch is not in planned status or not found" }, 409);
  }
  return jsonResponse({ ok: true });
}
