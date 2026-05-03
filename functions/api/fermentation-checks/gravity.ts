import { jsonResponse, unauthorizedResponse, verifySupabaseJwt } from "../../_shared/auth";
import { resolveBreweryId, type BreweryEnv } from "../../_shared/brewery";

interface Body { batchId?: string; gravity?: number; temperatureC?: number | null; checkType?: string | null }

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
  const gravity = Number(body.gravity);
  if (!body.batchId || !Number.isFinite(gravity) || gravity <= 0) return jsonResponse({ error: "Valid batchId and gravity > 0 are required" }, 400);
  const batchRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/batches?id=eq.${encodeURIComponent(body.batchId)}&brewery_id=eq.${encodeURIComponent(breweryId)}&select=id&limit=1`, { headers: adminHeaders(context.env) });
  const batchRows = await batchRes.json() as Array<{id: string}>;
  if (!batchRes.ok || !Array.isArray(batchRows) || batchRows.length === 0) return jsonResponse({ error: "Batch not found for brewery" }, 404);
  const logRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/brew_logs?batch_id=eq.${encodeURIComponent(body.batchId)}&brewery_id=eq.${encodeURIComponent(breweryId)}&select=id&order=created_at.asc&limit=1`, { headers: adminHeaders(context.env) });
  const logRows = await logRes.json() as Array<{id: string}>;
  let brewLogId: string;
  if (logRes.ok && Array.isArray(logRows) && logRows.length > 0 && logRows[0].id) {
    brewLogId = logRows[0].id;
  } else {
    const ts = new Date().toISOString();
    const newLogRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/brew_logs`, { method: "POST", headers: adminHeaders(context.env), body: JSON.stringify({ brewery_id: breweryId, batch_id: body.batchId, log_status: "in_progress", created_at: ts, updated_at: ts }) });
    const newLogRows = await newLogRes.json() as Array<{id: string}>;
    if (!newLogRes.ok || !Array.isArray(newLogRows) || !newLogRows[0]?.id) return jsonResponse({ error: "Failed to create brew log for gravity reading" }, 400);
    brewLogId = newLogRows[0].id;
  }
  const today = new Date().toISOString().split("T")[0];
  const measuredAt = new Date().toISOString();
  const resolvedReadingType = body.checkType ?? "gravity";
  const checkPayload: Record<string, unknown> = { brew_log_id: brewLogId, batch_id: body.batchId, check_date: today, gravity, check_type: resolvedReadingType, measured_at: measuredAt, reading_type: resolvedReadingType, is_stable_fg_check: false };
  if (body.temperatureC != null && Number.isFinite(Number(body.temperatureC))) checkPayload.temperature_c = Number(body.temperatureC);
  const checkRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/fermentation_checks`, { method: "POST", headers: adminHeaders(context.env), body: JSON.stringify(checkPayload) });
  const inserted = await checkRes.json();
  if (!checkRes.ok) return jsonResponse({ error: "Failed to record gravity reading", detail: inserted }, 400);
  return jsonResponse({ fermentation_check: Array.isArray(inserted) ? inserted[0] : inserted }, 201);
}
