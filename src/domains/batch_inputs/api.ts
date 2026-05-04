import { apiFetch } from "@/api/client";

export async function assignIngredientLots(payload: {
  batchId: string;
  ingredientId: string;
  inventoryLotId?: string | null;
  quantity: number;
  unit: string;
  stage?: string | null;
}): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/api/batch-inputs/assign", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
