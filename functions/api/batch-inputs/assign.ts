import { jsonResponse, unauthorizedResponse, verifySupabaseJwt } from "../../_shared/auth";
import { resolveBreweryId, type BreweryEnv } from "../../_shared/brewery";

interface Body { batchId?: string; ingredientId?: string; quantity?: number; unit?: string; stage?: string | null }

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
  const quantity = Number(body.quantity);
  if (!body.batchId || !body.ingredientId || !body.unit || !Number.isFinite(quantity) || quantity <= 0) {
    return jsonResponse({ error: "batchId, ingredientId, unit, and quantity > 0 are required" }, 400);
  }
  const batchRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/batches?id=eq.${encodeURIComponent(body.batchId)}&brewery_id=eq.${encodeURIComponent(breweryId)}&select=id&limit=1`, { headers: adminHeaders(context.env) });
  const batchRows = await batchRes.json() as Array<{id: string}>;
  if (!batchRes.ok || !Array.isArray(batchRows) || batchRows.length === 0) return jsonResponse({ error: "Batch not found for brewery" }, 404);
  const ingredientRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/ingredients?id=eq.${encodeURIComponent(body.ingredientId)}&brewery_id=eq.${encodeURIComponent(breweryId)}&select=id&limit=1`, { headers: adminHeaders(context.env) });
  const ingredientRows = await ingredientRes.json() as Array<{id: string}>;
  if (!ingredientRes.ok || !Array.isArray(ingredientRows) || ingredientRows.length === 0) return jsonResponse({ error: "Ingredient not found for brewery" }, 404);
  const payload: Record<string, unknown> = { brewery_id: breweryId, batch_id: body.batchId, ingredient_id: body.ingredientId, quantity, unit: body.unit };
  if (body.stage) payload.stage = body.stage;
  const insertRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/batch_inputs`, { method: "POST", headers: adminHeaders(context.env), body: JSON.stringify(payload) });
  const inserted = await insertRes.json();
  if (!insertRes.ok) return jsonResponse({ error: "Failed to assign ingredient lots", detail: inserted }, 400);
  return jsonResponse({ batch_input: Array.isArray(inserted) ? inserted[0] : inserted }, 201);
}
