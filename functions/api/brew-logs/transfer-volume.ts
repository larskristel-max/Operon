import { jsonResponse, unauthorizedResponse, verifySupabaseJwt } from "../../_shared/auth";
import { resolveBreweryId, type BreweryEnv } from "../../_shared/brewery";

interface Body { batchId?: string; actualFermenterVolumeLiters?: number }

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
  const liters = Number(body.actualFermenterVolumeLiters);
  if (!body.batchId || !Number.isFinite(liters) || liters <= 0) return jsonResponse({ error: "Valid batchId and actualFermenterVolumeLiters > 0 are required" }, 400);
  const batchRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/batches?id=eq.${encodeURIComponent(body.batchId)}&brewery_id=eq.${encodeURIComponent(breweryId)}&select=id&limit=1`, { headers: adminHeaders(context.env) });
  const rows = await batchRes.json() as Array<{id: string}>;
  if (!batchRes.ok || !Array.isArray(rows) || rows.length === 0) return jsonResponse({ error: "Batch not found for brewery" }, 404);

  const now = new Date().toISOString();

  const existingRes = await fetch(
    `${context.env.SUPABASE_URL}/rest/v1/brew_logs?batch_id=eq.${encodeURIComponent(body.batchId)}&brewery_id=eq.${encodeURIComponent(breweryId)}&select=id&order=created_at.asc&limit=1`,
    { headers: adminHeaders(context.env) }
  );
  const existingRows = await existingRes.json() as Array<{ id?: string }>;
  const existingId = existingRes.ok && Array.isArray(existingRows) ? existingRows[0]?.id ?? null : null;

  if (existingId) {
    const patchRes = await fetch(
      `${context.env.SUPABASE_URL}/rest/v1/brew_logs?id=eq.${encodeURIComponent(existingId)}`,
      { method: "PATCH", headers: adminHeaders(context.env), body: JSON.stringify({ actual_fermenter_volume_liters: liters, log_status: "in_progress", updated_at: now }) }
    );
    const patched = await patchRes.json();
    if (!patchRes.ok) return jsonResponse({ error: "Failed to update transfer volume", detail: patched }, 400);
    return jsonResponse({ brew_log: Array.isArray(patched) ? patched[0] : patched }, 200);
  }

  const insertRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/brew_logs`, {
    method: "POST",
    headers: adminHeaders(context.env),
    body: JSON.stringify({ brewery_id: breweryId, batch_id: body.batchId, actual_fermenter_volume_liters: liters, log_status: "in_progress", created_at: now, updated_at: now }),
  });
  const inserted = await insertRes.json();
  if (!insertRes.ok) return jsonResponse({ error: "Failed to record transfer volume", detail: inserted }, 400);
  return jsonResponse({ brew_log: Array.isArray(inserted) ? inserted[0] : inserted }, 201);
}
