import { assignTank } from "@/domains/tanks/api";
import { writeDemoOverlay } from "@/domains/demo/api";
import { nowIso } from "@/lib/time";

export function useAssignTank({ isDemoMode }: { isDemoMode: boolean }) {
  return async (input: { tankId: string; batchId: string }) => {
    if (isDemoMode) {
      await writeDemoOverlay({
        table_name: "tanks",
        operation: "update",
        record_id: input.tankId,
        payload: { id: input.tankId, current_batch_id: input.batchId, status: "fermenting", updated_at: nowIso() },
      });
      return;
    }

    await assignTank(input);
  };
}
