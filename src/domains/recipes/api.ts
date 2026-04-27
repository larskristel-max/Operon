import { apiFetch } from "@/api/client";
import type { RecipeUploadIntakeRequest, RecipeUploadIntakeResponse } from "@/domains/recipes/types";

export async function createRecipeUploadIntake(payload: RecipeUploadIntakeRequest): Promise<RecipeUploadIntakeResponse> {
  return apiFetch<RecipeUploadIntakeResponse>("/api/recipes/upload-intake", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
