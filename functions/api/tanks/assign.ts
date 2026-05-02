import { jsonResponse, unauthorizedResponse, verifySupabaseJwt } from "../../_shared/auth";
import { resolveBreweryId, type BreweryEnv } from "../../_shared/brewery";

interface Body { tankId?: string; batchId?: string }

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
  if (!body.tankId || !body.batchId) return jsonResponse({ error: "tankId and batchId are required" }, 400);

  const batchRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/batches?id=eq.${encodeURIComponent(body.batchId)}&brewery_id=eq.${encodeURIComponent(breweryId)}&select=id&limit=1`, { headers: adminHeaders(context.env) });
  const batchRows = await batchRes.json() as Array<{id:string}>;
  if (!batchRes.ok || !Array.isArray(batchRows) || batchRows.length === 0) return jsonResponse({ error: "Batch not found for brewery" }, 404);

  const tankRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/tanks?id=eq.${encodeURIComponent(body.tankId)}&brewery_id=eq.${encodeURIComponent(breweryId)}&select=id,current_batch_id,status&limit=1`, { headers: adminHeaders(context.env) });
  const tanks = await tankRes.json() as Array<Record<string, unknown>>;
  if (!tankRes.ok || !Array.isArray(tanks) || tanks.length === 0) return jsonResponse({ error: "Tank not found for brewery" }, 404);
  if (tanks[0].current_batch_id && tanks[0].current_batch_id !== body.batchId) return jsonResponse({ error: "Tank is not available" }, 409);

  const patch = { current_batch_id: body.batchId, updated_at: new Date().toISOString() };
  const updateRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/tanks?id=eq.${encodeURIComponent(body.tankId)}`, { method: "PATCH", headers: adminHeaders(context.env), body: JSON.stringify(patch) });
  const updated = await updateRes.json();
  if (!updateRes.ok) return jsonResponse({ error: "Failed to assign tank", detail: updated }, 400);
  return jsonResponse({ tank: Array.isArray(updated) ? updated[0] : updated }, 200);
}
