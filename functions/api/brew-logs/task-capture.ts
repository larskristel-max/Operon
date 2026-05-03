import { jsonResponse, unauthorizedResponse, verifySupabaseJwt } from "../../_shared/auth";
import { resolveBreweryId, type BreweryEnv } from "../../_shared/brewery";

interface Body { taskType?: string; batchId?: string; value?: number | null; value2?: number | null; timestamp?: string | null }

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
  if (!body.batchId || !body.taskType) return jsonResponse({ error: "batchId and taskType are required" }, 400);

  const now = new Date().toISOString();
  const brewLogPayload: Record<string, unknown> = { brewery_id: breweryId, batch_id: body.batchId, log_status: "in_progress", updated_at: now };
  let value = body.value == null ? null : Number(body.value);
  if (body.taskType !== "record_hop_addition" && (value === null || !Number.isFinite(value))) return jsonResponse({ error: "value is required" }, 400);
  if (body.taskType === "record_boil" && value !== null) {
    if (Number.isInteger(value) && value >= 980 && value <= 1200) value = value / 1000;
    if (value < 0.98 || value > 1.20) return jsonResponse({ error: "Original gravity must be between 0.98 and 1.20 (e.g. 1.050 or 1050)" }, 422);
  }

  if (body.taskType === "record_mash_water") brewLogPayload.actual_mash_water_liters = value;
  else if (body.taskType === "record_strike_temp") brewLogPayload.actual_strike_water_temp_c = value;
  else if (body.taskType === "record_sparge_water") brewLogPayload.actual_sparge_water_liters = value;
  else if (body.taskType === "record_mash_ph") brewLogPayload.actual_mash_ph = value;
  else if (body.taskType === "record_pre_boil_gravity") brewLogPayload.actual_pre_boil_gravity = value;
  else if (body.taskType === "record_boil") brewLogPayload.actual_original_gravity = value;
  else if (body.taskType === "record_transfer") { brewLogPayload.actual_transfer_temp_c = value; brewLogPayload.transfer_started_at = now; brewLogPayload.transfer_finished_at = body.timestamp ?? now; }
  else if (body.taskType === "pitch_yeast") { brewLogPayload.yeast_pitch_quantity = value; brewLogPayload.yeast_pitch_time = body.timestamp ?? now; }

  const existingLogRes = await fetch(
    `${context.env.SUPABASE_URL}/rest/v1/brew_logs?batch_id=eq.${encodeURIComponent(body.batchId)}&brewery_id=eq.${encodeURIComponent(breweryId)}&select=id&order=created_at.asc&limit=1`,
    { headers: adminHeaders(context.env) }
  );
  const existingLogRows = await existingLogRes.json() as Array<{ id?: string }>;
  const existingBrewLogId = existingLogRes.ok && Array.isArray(existingLogRows) ? existingLogRows[0]?.id ?? null : null;

  if (body.taskType === "record_hop_addition") {
    const durationMin = value == null || !Number.isFinite(value) ? 60 : value;
    let brewLogId = existingBrewLogId;
    if (!brewLogId) {
      const createLogRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/brew_logs`, { method: "POST", headers: adminHeaders(context.env), body: JSON.stringify({ ...brewLogPayload, created_at: now }) });
      const createdLog = await createLogRes.json() as Array<{ id?: string }>;
      brewLogId = createLogRes.ok && Array.isArray(createdLog) ? createdLog[0]?.id ?? null : null;
      if (!brewLogId) return jsonResponse({ error: "Failed to create brew log for hop addition", detail: createdLog }, 400);
    }
    const res = await fetch(`${context.env.SUPABASE_URL}/rest/v1/boil_additions`, { method: "POST", headers: adminHeaders(context.env), body: JSON.stringify({ brew_log_id: brewLogId, addition_stage: "boil", duration_min: durationMin, ingredient_id: body.value2 ?? null, created_at: now }) });
    const inserted = await res.json();
    if (!res.ok) return jsonResponse({ error: "Failed to record hop addition", detail: inserted }, 400);
    return jsonResponse({ boil_addition: Array.isArray(inserted) ? inserted[0] : inserted }, 201);
  }

  if (existingBrewLogId) {
    const patchRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/brew_logs?id=eq.${encodeURIComponent(existingBrewLogId)}`, { method: "PATCH", headers: adminHeaders(context.env), body: JSON.stringify(brewLogPayload) });
    const patched = await patchRes.json();
    if (!patchRes.ok) return jsonResponse({ error: "Failed to update brew task", detail: patched }, 400);
    return jsonResponse({ brew_log: Array.isArray(patched) ? patched[0] : patched }, 200);
  }

  const insertRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/brew_logs`, { method: "POST", headers: adminHeaders(context.env), body: JSON.stringify({ ...brewLogPayload, created_at: now }) });
  const inserted = await insertRes.json();
  if (!insertRes.ok) return jsonResponse({ error: "Failed to record brew task", detail: inserted }, 400);
  return jsonResponse({ brew_log: Array.isArray(inserted) ? inserted[0] : inserted }, 201);
}
