import { apiFetch } from "@/api/client";
import type { CreateBrewDraftInput } from "@/domains/batches/types";

interface CreateBrewDraftResponse {
  draft_id: string;
  status: "ready_to_confirm";
  source: "existing-recipe" | "new-recipe" | "upload-recipe";
  recipe_draft: {
    recipe_id: string | null;
    upload_intake_id: string | null;
    new_recipe_placeholder: boolean;
  };
  batch_draft: {
    proposed_name: string;
    stage: "planning";
  };
}

export async function createBrewDraft(payload: CreateBrewDraftInput): Promise<CreateBrewDraftResponse> {
  return apiFetch<CreateBrewDraftResponse>("/api/batches/draft", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
