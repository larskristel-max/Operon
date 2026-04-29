import { jsonResponse, unauthorizedResponse, verifySupabaseJwt } from "../../_shared/auth";
import { resolveBreweryId, type BreweryEnv } from "../../_shared/brewery";

type Env = BreweryEnv;

type DraftSource = "existing-recipe" | "new-recipe" | "upload-recipe";

interface CreateDraftBody {
  source?: DraftSource;
  recipeId?: string | null;
  uploadIntakeId?: string | null;
}

const ALLOWED_SOURCES: DraftSource[] = ["existing-recipe", "new-recipe", "upload-recipe"];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const user = await verifySupabaseJwt(request.headers.get("Authorization"), env);
  if (!user) return unauthorizedResponse();

  const breweryId = await resolveBreweryId(env, user.id);
  if (!breweryId) {
    return jsonResponse({ error: "No brewery membership found" }, 403);
  }

  let body: CreateDraftBody;
  try {
    body = (await request.json()) as CreateDraftBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!body.source || !ALLOWED_SOURCES.includes(body.source)) {
    return jsonResponse({ error: "source is required" }, 400);
  }

  if (body.source === "existing-recipe" && !isNonEmptyString(body.recipeId)) {
    return jsonResponse({ error: "recipeId is required for existing-recipe source" }, 400);
  }

  if (body.source === "upload-recipe" && !isNonEmptyString(body.uploadIntakeId)) {
    return jsonResponse({ error: "uploadIntakeId is required for upload-recipe source" }, 400);
  }

  const draftId = crypto.randomUUID();
  const proposedName =
    body.source === "existing-recipe"
      ? `Draft from recipe ${body.recipeId}`
      : body.source === "upload-recipe"
      ? "Draft from uploaded recipe"
      : "Draft from new recipe";

  return jsonResponse(
    {
      draft_id: draftId,
      brewery_id: breweryId,
      status: "ready_to_confirm",
      source: body.source,
      non_persistent: true,
      contract_scaffold: "batch_draft_without_table",
      recipe_draft: {
        recipe_id: body.recipeId ?? null,
        upload_intake_id: body.uploadIntakeId ?? null,
        new_recipe_placeholder: body.source === "new-recipe",
      },
      batch_draft: {
        proposed_name: proposedName,
        stage: "planning",
      },
      confirmation_required: true,
      write_blocked_until_confirmation: true,
    },
    201
  );
}
