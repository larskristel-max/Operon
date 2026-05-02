import { takeGravityReading } from "@/domains/fermentation_checks/api";
import { writeDemoOverlay } from "@/domains/demo/api";
import { nowIso } from "@/lib/time";

export function useTakeGravityReading({
  isDemoMode,
  breweryId,
  brewLogs,
}: {
  isDemoMode: boolean;
  breweryId: string | null;
  brewLogs: Array<Record<string, unknown>>;
}) {
  return async (input: { batchId: string; gravity: number; temperatureC?: number | null }) => {
    if (isDemoMode) {
      if (!breweryId) throw new Error("Demo brewery not available");

      const existingLog = brewLogs.find((log) => {
        const logBatchId = typeof log.batch_id === "string" ? log.batch_id : null;
        return logBatchId === input.batchId;
      });

      let brewLogId: string;

      if (existingLog && typeof existingLog.id === "string") {
        brewLogId = existingLog.id;
      } else {
        brewLogId = crypto.randomUUID();
        const ts = nowIso();
        await writeDemoOverlay({
          table_name: "brew_logs",
          operation: "insert",
          record_id: brewLogId,
          payload: {
            id: brewLogId,
            brewery_id: breweryId,
            batch_id: input.batchId,
            log_status: "in_progress",
            created_at: ts,
            updated_at: ts,
          },
        });
      }

      const checkId = crypto.randomUUID();
      const today = new Date().toISOString().split("T")[0];
      await writeDemoOverlay({
        table_name: "fermentation_checks",
        operation: "insert",
        record_id: checkId,
        payload: {
          id: checkId,
          brew_log_id: brewLogId,
          check_date: today,
          gravity: input.gravity,
          temperature_c: input.temperatureC ?? null,
          check_type: "gravity",
          created_at: nowIso(),
        },
      });
      return;
    }

    await takeGravityReading(input);
  };
}
