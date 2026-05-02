import { recordMashVolume, recordTransferVolume } from "@/domains/brew_logs/api";
import { writeDemoOverlay } from "@/domains/demo/api";
import { nowIso } from "@/lib/time";

export function useRecordMashVolume({ isDemoMode, breweryId }: { isDemoMode: boolean; breweryId: string | null }) {
  return async (input: { batchId: string; actualMashVolumeLiters: number }) => {
    if (isDemoMode) {
      if (!breweryId) throw new Error("Demo brewery not available");
      const id = crypto.randomUUID();
      const timestamp = nowIso();
      await writeDemoOverlay({
        table_name: "brew_logs",
        operation: "insert",
        record_id: id,
        payload: {
          id,
          brewery_id: breweryId,
          batch_id: input.batchId,
          actual_mash_volume_liters: input.actualMashVolumeLiters,
          log_status: "in_progress",
          created_at: timestamp,
          updated_at: timestamp,
        },
      });
      return;
    }

    await recordMashVolume(input);
  };
}

export function useRecordTransferVolume({ isDemoMode, breweryId }: { isDemoMode: boolean; breweryId: string | null }) {
  return async (input: { batchId: string; actualFermenterVolumeLiters: number }) => {
    if (isDemoMode) {
      if (!breweryId) throw new Error("Demo brewery not available");
      const id = crypto.randomUUID();
      const timestamp = nowIso();
      await writeDemoOverlay({
        table_name: "brew_logs",
        operation: "insert",
        record_id: id,
        payload: {
          id,
          brewery_id: breweryId,
          batch_id: input.batchId,
          actual_fermenter_volume_liters: input.actualFermenterVolumeLiters,
          log_status: "in_progress",
          created_at: timestamp,
          updated_at: timestamp,
        },
      });
      return;
    }

    await recordTransferVolume(input);
  };
}
