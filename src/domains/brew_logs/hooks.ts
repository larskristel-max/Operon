import { captureBrewTask, recordMashVolume, recordTransferVolume } from "@/domains/brew_logs/api";
import { writeDemoOverlay } from "@/domains/demo/api";
import { nowIso } from "@/lib/time";

export function useRecordMashVolume({ isDemoMode, breweryId }: { isDemoMode: boolean; breweryId: string | null }) {
  return async (input: { batchId: string; actualMashVolumeLiters: number; brewLogs?: Array<Record<string, unknown>> }) => {
    if (isDemoMode) {
      if (!breweryId) throw new Error("Demo brewery not available");
      const existingLog = (input.brewLogs ?? []).find((log) => String(log.batch_id ?? "") === input.batchId) ?? null;
      const id = existingLog ? String(existingLog.id ?? "") : crypto.randomUUID();
      const timestamp = nowIso();
      await writeDemoOverlay({
        table_name: "brew_logs",
        operation: existingLog ? "update" : "insert",
        record_id: id,
        payload: {
          id,
          brewery_id: breweryId,
          batch_id: input.batchId,
          actual_mash_volume_liters: input.actualMashVolumeLiters,
          log_status: "in_progress",
          ...(existingLog ? {} : { created_at: timestamp }),
          updated_at: timestamp,
        },
      });
      return;
    }

    await recordMashVolume({ batchId: input.batchId, actualMashVolumeLiters: input.actualMashVolumeLiters });
  };
}

export function useRecordTransferVolume({ isDemoMode, breweryId }: { isDemoMode: boolean; breweryId: string | null }) {
  return async (input: { batchId: string; actualFermenterVolumeLiters: number; brewLogs?: Array<Record<string, unknown>> }) => {
    if (isDemoMode) {
      if (!breweryId) throw new Error("Demo brewery not available");
      const existingLog = (input.brewLogs ?? []).find((log) => String(log.batch_id ?? "") === input.batchId) ?? null;
      const id = existingLog ? String(existingLog.id ?? "") : crypto.randomUUID();
      const timestamp = nowIso();
      await writeDemoOverlay({
        table_name: "brew_logs",
        operation: existingLog ? "update" : "insert",
        record_id: id,
        payload: {
          id,
          brewery_id: breweryId,
          batch_id: input.batchId,
          actual_fermenter_volume_liters: input.actualFermenterVolumeLiters,
          log_status: "in_progress",
          ...(existingLog ? {} : { created_at: timestamp }),
          updated_at: timestamp,
        },
      });
      return;
    }

    await recordTransferVolume(input);
  };
}

export function useCaptureBrewTask({ isDemoMode, breweryId, brewLogs }: { isDemoMode: boolean; breweryId: string | null; brewLogs?: Array<Record<string, unknown>> }) {
  return async (input: { taskType: string; batchId: string; value?: number | null; value2?: number | null; valueText?: string | null; unit?: string | null; timestamp?: string | null }) => {
    if (isDemoMode) {
      if (!breweryId) throw new Error("Demo brewery not available");
      const existingLog = (brewLogs ?? []).find((log) => String(log.batch_id ?? "") === input.batchId) ?? null;
      const brewLogId = existingLog ? String(existingLog.id ?? "") : crypto.randomUUID();
      const ts = nowIso();
      if (input.taskType === "record_hop_addition") {
        const additionId = crypto.randomUUID();
        await writeDemoOverlay({
          table_name: "boil_additions",
          operation: "insert",
          record_id: additionId,
          payload: { id: additionId, brew_log_id: brewLogId, addition_stage: "boil", duration_min: input.value ?? 60, ingredient_id: input.value2 ?? null, ingredient_name: input.valueText ?? null, quantity: input.value ?? null, unit: input.unit ?? "g", created_at: ts },
        });
        return;
      }
      const payload: Record<string, unknown> = { brewery_id: breweryId, batch_id: input.batchId, log_status: "in_progress", updated_at: ts };
      if (input.taskType === "record_mash_water") payload.actual_mash_water_liters = input.value;
      if (input.taskType === "record_strike_temp") payload.actual_strike_water_temp_c = input.value;
      if (input.taskType === "record_sparge_water") payload.actual_sparge_water_liters = input.value;
      if (input.taskType === "record_mash_ph") payload.actual_mash_ph = input.value;
      if (input.taskType === "record_pre_boil_gravity") payload.actual_pre_boil_gravity = input.value;
      if (input.taskType === "record_boil" || input.taskType === "record_original_gravity") payload.actual_original_gravity = input.value;
      if (input.taskType === "record_transfer") { payload.actual_transfer_temp_c = input.value; payload.transfer_started_at = ts; payload.transfer_finished_at = input.timestamp ?? ts; }
      if (input.taskType === "pitch_yeast") { payload.yeast_pitch_quantity = input.value; payload.yeast_pitch_time = input.timestamp ?? ts; }
      if (existingLog && brewLogId) {
        await writeDemoOverlay({ table_name: "brew_logs", operation: "update", record_id: brewLogId, payload });
      } else {
        await writeDemoOverlay({ table_name: "brew_logs", operation: "insert", record_id: brewLogId, payload: { ...payload, id: brewLogId, created_at: ts } });
      }
      return;
    }
    await captureBrewTask(input);
  };
}
