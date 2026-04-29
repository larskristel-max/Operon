import { apiFetch } from "@/api/client";
import type { ConfirmBrewDraftInput, CreateBrewDraftInput } from "@/domains/batches/types";

interface CreateBrewDraftResponse {
  draft_id: string;
  status: "ready_to_confirm";
  source: "existing-recipe" | "new-recipe" | "upload-recipe";
  non_persistent: boolean;
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

interface CreateBatchResponse {
  batch: Record<string, unknown>;
}

export async function createBatchAfterConfirmation(payload: ConfirmBrewDraftInput): Promise<CreateBatchResponse> {
  return apiFetch<CreateBatchResponse>("/api/batches", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
