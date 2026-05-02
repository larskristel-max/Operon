import { assignIngredientLots } from "@/domains/batch_inputs/api";
import { writeDemoOverlay } from "@/domains/demo/api";
import { nowIso } from "@/lib/time";

export function useAssignIngredientLots({ isDemoMode, breweryId }: { isDemoMode: boolean; breweryId: string | null }) {
  return async (input: { batchId: string; ingredientId: string; quantity: number; unit: string; stage?: string | null }) => {
    if (isDemoMode) {
      if (!breweryId) throw new Error("Demo brewery not available");
      const id = crypto.randomUUID();
      const timestamp = nowIso();
      await writeDemoOverlay({
        table_name: "batch_inputs",
        operation: "insert",
        record_id: id,
        payload: {
          id,
          brewery_id: breweryId,
          batch_id: input.batchId,
          ingredient_id: input.ingredientId,
          quantity: input.quantity,
          unit: input.unit,
          stage: input.stage ?? null,
          created_at: timestamp,
        },
      });
      return;
    }

    await assignIngredientLots(input);
  };
}
