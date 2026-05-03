import { jsonResponse, unauthorizedResponse, verifySupabaseJwt } from "../_shared/auth";
import { resolveBreweryId, type BreweryEnv } from "../_shared/brewery";

type Env = BreweryEnv;
type Source = "existing-recipe" | "upload-recipe";

interface Body {
  source?: Source;
  recipeId?: string;
  uploadIntakeId?: string;
  draftId?: string;
  batchNumber?: string;
}
async function nextBatchNumber(env: Env, breweryId: string): Promise<string> {
  const yy = new Date().getUTCFullYear().toString().slice(-2);
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/batches?brewery_id=eq.${encodeURIComponent(breweryId)}&select=batch_number&limit=10000`, { headers: adminHeaders(env) });
  const rows = (await parseResponseBody(res)) as Array<Record<string, unknown>>;
  const re = new RegExp(`^${yy}-(\\d+)$`);
  let max = 0;
  for (const row of rows ?? []) {
    const n = typeof row.batch_number === "string" ? row.batch_number : "";
    const m = n.match(re);
    if (m) max = Math.max(max, Number.parseInt(m[1], 10));
  }
  const next = max + 1;
  return `${yy}-${String(next).padStart(3, "0")}`;
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

async function parseResponseBody(response: Response): Promise<unknown> {
  const raw = await response.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return { raw };
  }
}

async function verifyRecipeBelongsToBrewery(env: Env, recipeId: string, breweryId: string): Promise<boolean> {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/recipes?id=eq.${encodeURIComponent(recipeId)}&brewery_id=eq.${encodeURIComponent(
      breweryId
    )}&select=id&limit=1`,
    { headers: adminHeaders(env) }
  );

  if (!res.ok) {
    throw new Error("Failed to verify recipe ownership");
  }

  const rows = (await parseResponseBody(res)) as unknown;
  return Array.isArray(rows) && rows.length > 0;
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

  if (body.recipeId) {
    try {
      const recipeMatchesBrewery = await verifyRecipeBelongsToBrewery(context.env, body.recipeId, breweryId);
      if (!recipeMatchesBrewery) {
        return jsonResponse({ error: "Recipe not found for brewery" }, 404);
      }
    } catch {
      return jsonResponse({ error: "Failed to verify recipe ownership" }, 500);
    }
  }

  const batchName = body.source === "upload-recipe" ? "Uploaded Recipe Batch" : "New Batch";
  const basePayload: Record<string, unknown> = {
    brewery_id: breweryId,
    recipe_id: body.recipeId ?? null,
    status: "planned",
    name: batchName,
    batch_number: body.batchNumber?.trim() || (await nextBatchNumber(context.env, breweryId)),
  };

  const firstInsertRes = await postInsert(context.env, basePayload);
  const firstPayload = await parseResponseBody(firstInsertRes);

  const firstErrorText =
    !firstInsertRes.ok && typeof firstPayload === "object" && firstPayload
      ? JSON.stringify(firstPayload).toLowerCase()
      : "";
  const missingNameColumn = firstErrorText.includes("column") && firstErrorText.includes("name");

  let finalRes = firstInsertRes;
  let finalPayload: unknown = firstPayload;

  if (!firstInsertRes.ok && missingNameColumn) {
    const { name: _ignored, ...withoutName } = basePayload;
    finalRes = await postInsert(context.env, withoutName);
    finalPayload = await parseResponseBody(finalRes);
  }

  if (!finalRes.ok) {
    return jsonResponse({ error: "Failed to create batch", detail: finalPayload }, 400);
  }

  const batch = Array.isArray(finalPayload) ? finalPayload[0] : finalPayload;
  return jsonResponse({ batch }, 201);
}
