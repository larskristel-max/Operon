import { captureBrewTask, recordMashVolume, recordTransferVolume } from "@/domains/brew_logs/api";
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

export function useCaptureBrewTask({ isDemoMode, breweryId }: { isDemoMode: boolean; breweryId: string | null }) {
  return async (input: { taskType: string; batchId: string; value?: number | null; value2?: number | null; timestamp?: string | null }) => {
    if (isDemoMode) {
      if (!breweryId) throw new Error("Demo brewery not available");
      const id = crypto.randomUUID();
      const ts = nowIso();
      if (input.taskType === "record_hop_addition") {
        await writeDemoOverlay({
          table_name: "boil_additions",
          operation: "insert",
          record_id: id,
          payload: { id, batch_id: input.batchId, stage: "boil", duration_min: input.value ?? 60, created_at: ts, updated_at: ts },
        });
        return;
      }
      const payload: Record<string, unknown> = { id, brewery_id: breweryId, batch_id: input.batchId, log_status: "in_progress", created_at: ts, updated_at: ts };
      if (input.taskType === "record_mash_water") payload.actual_mash_water_liters = input.value;
      if (input.taskType === "record_strike_temp") payload.actual_strike_water_temp_c = input.value;
      if (input.taskType === "record_sparge_water") payload.actual_sparge_water_liters = input.value;
      if (input.taskType === "record_mash_ph") payload.actual_mash_ph = input.value;
      if (input.taskType === "record_pre_boil_gravity") payload.actual_pre_boil_gravity = input.value;
      if (input.taskType === "record_boil") payload.actual_original_gravity = input.value;
      if (input.taskType === "record_transfer") { payload.actual_transfer_temp_c = input.value; payload.transfer_started_at = ts; payload.transfer_finished_at = input.timestamp ?? ts; }
      if (input.taskType === "pitch_yeast") { payload.yeast_pitch_quantity = input.value; payload.yeast_pitch_time = input.timestamp ?? ts; }
      await writeDemoOverlay({ table_name: "brew_logs", operation: "insert", record_id: id, payload });
      return;
    }
    await captureBrewTask(input);
  };
}
