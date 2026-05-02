import { createOutputLot } from "@/domains/lots/api";
import { writeDemoOverlay } from "@/domains/demo/api";
import { nowIso } from "@/lib/time";

export function useCreateOutputLot({ isDemoMode, breweryId }: { isDemoMode: boolean; breweryId: string | null }) {
  return async (input: { batchId: string; lotNumber: string; volumeLiters?: number | null; unitsCount?: number | null }) => {
    if (isDemoMode) {
      if (!breweryId) throw new Error("Demo brewery not available");
      const id = crypto.randomUUID();
      const timestamp = nowIso();
      await writeDemoOverlay({
        table_name: "lots",
        operation: "insert",
        record_id: id,
        payload: {
          id,
          brewery_id: breweryId,
          batch_id: input.batchId,
          lot_number: input.lotNumber,
          lot_type: "batch_output",
          status: "active",
          packaging_state: "packaged",
          volume_liters: input.volumeLiters ?? null,
          units_count: input.unitsCount ?? null,
          created_at: timestamp,
          updated_at: timestamp,
        },
      });
      return;
    }

    await createOutputLot(input);
  };
}
