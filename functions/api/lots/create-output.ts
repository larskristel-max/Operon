import { jsonResponse, unauthorizedResponse, verifySupabaseJwt } from "../../_shared/auth";
import { resolveBreweryId, type BreweryEnv } from "../../_shared/brewery";

interface Body { batchId?: string; lotNumber?: string; volumeLiters?: number | null; unitsCount?: number | null; packagingFormatId?: string | null }

function adminHeaders(env: BreweryEnv): Record<string, string> {
  return { Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY, "Content-Type": "application/json", Prefer: "return=representation" };
}

export async function onRequestPost(context: { request: Request; env: BreweryEnv }): Promise<Response> {
  const user = await verifySupabaseJwt(context.request.headers.get("Authorization"), context.env);
  if (!user) return unauthorizedResponse();
  const breweryId = await resolveBreweryId(context.env, user.id);
  if (!breweryId) return jsonResponse({ error: "No brewery membership found" }, 403);
  let body: Body;
  try { body = await context.request.json() as Body; } catch { return jsonResponse({ error: "Invalid JSON body" }, 400); }
  if (!body.batchId || !body.lotNumber?.trim()) return jsonResponse({ error: "batchId and lotNumber are required" }, 400);
  const batchRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/batches?id=eq.${encodeURIComponent(body.batchId)}&brewery_id=eq.${encodeURIComponent(breweryId)}&select=id&limit=1`, { headers: adminHeaders(context.env) });
  const batchRows = await batchRes.json() as Array<{id: string}>;
  if (!batchRes.ok || !Array.isArray(batchRows) || batchRows.length === 0) return jsonResponse({ error: "Batch not found for brewery" }, 404);
  const ts = new Date().toISOString();
  const payload: Record<string, unknown> = { brewery_id: breweryId, batch_id: body.batchId, lot_number: body.lotNumber.trim(), lot_type: "batch_output", status: "active", packaging_state: "packaged", created_at: ts, updated_at: ts };
  if (body.volumeLiters != null) { const v = Number(body.volumeLiters); if (Number.isFinite(v) && v > 0) payload.volume_liters = v; }
  if (body.unitsCount != null) { const u = Number(body.unitsCount); if (Number.isFinite(u) && u > 0) payload.units_count = Math.round(u); }
  if (body.packagingFormatId) payload.packaging_format_id = body.packagingFormatId;
  const insertRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/lots`, { method: "POST", headers: adminHeaders(context.env), body: JSON.stringify(payload) });
  const inserted = await insertRes.json();
  if (!insertRes.ok) return jsonResponse({ error: "Failed to create output lot", detail: inserted }, 400);
  return jsonResponse({ lot: Array.isArray(inserted) ? inserted[0] : inserted }, 201);
}
