import { jsonResponse, unauthorizedResponse, verifySupabaseJwt } from "../_shared/auth";
import { resolveBreweryId, type BreweryEnv } from "../_shared/brewery";

type Env = BreweryEnv;
type Source = "existing-recipe" | "upload-recipe";

interface Body {
  source?: Source;
  recipeId?: string;
  uploadIntakeId?: string;
  draftId?: string;
}

function adminHeaders(env: Env): Record<string, string> {
  return {
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function postInsert(env: Env, payload: Record<string, unknown>): Promise<Response> {
  return fetch(`${env.SUPABASE_URL}/rest/v1/batches`, {
    method: "POST",
    headers: adminHeaders(env),
    body: JSON.stringify(payload),
  });
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const user = await verifySupabaseJwt(context.request.headers.get("Authorization"), context.env);
  if (!user) return unauthorizedResponse();

  const breweryId = await resolveBreweryId(context.env, user.id);
  if (!breweryId) return jsonResponse({ error: "No brewery membership found" }, 403);

  let body: Body;
  try {
    body = (await context.request.json()) as Body;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!body.source || (body.source !== "existing-recipe" && body.source !== "upload-recipe")) {
    return jsonResponse({ error: "source must be existing-recipe or upload-recipe" }, 400);
  }

  if (body.source === "existing-recipe" && !body.recipeId) return jsonResponse({ error: "recipeId is required" }, 400);
  if (body.source === "upload-recipe" && !body.uploadIntakeId) return jsonResponse({ error: "uploadIntakeId is required" }, 400);

  const batchName = body.source === "upload-recipe" ? "Uploaded Recipe Batch" : "New Batch";
  const basePayload: Record<string, unknown> = {
    brewery_id: breweryId,
    recipe_id: body.recipeId ?? null,
    status: "planned",
    name: batchName,
  };

  let insertRes = await postInsert(context.env, basePayload);
  if (!insertRes.ok) {
    const text = await insertRes.text();
    if (text.toLowerCase().includes("column") && text.toLowerCase().includes("name")) {
      const { name: _ignored, ...withoutName } = basePayload;
      insertRes = await postInsert(context.env, withoutName);
    }
  }

  const responseText = await insertRes.text();
  const payload = responseText ? JSON.parse(responseText) : null;
  if (!insertRes.ok) {
    return jsonResponse({ error: "Failed to create batch", detail: payload }, 400);
  }

  const batch = Array.isArray(payload) ? payload[0] : payload;
  return jsonResponse({ batch }, 201);
}
