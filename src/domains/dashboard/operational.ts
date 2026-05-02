export interface OperationalTask {
  id: string;
  label: string;
  batchLabel: string;
  batchId: string;
}

export interface OperationalSummary {
  activeBatchCount: number;
  openTaskCount: number;
  openTasks: OperationalTask[];
}

const ACTIVE_BATCH_STATUSES = new Set(["planned", "brewing", "fermenting", "conditioning", "ready"]);

function readString(record: Record<string, unknown> | null | undefined, keys: string[]): string | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return null;
}

function readNumber(record: Record<string, unknown> | null | undefined, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function readDateTimestamp(record: Record<string, unknown> | null | undefined, keys: string[]): number | null {
  const raw = readString(record, keys);
  if (!raw) return null;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function computeOperationalSummary(input: {
  batches: Array<Record<string, unknown>>;
  tanks: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  lots: Array<Record<string, unknown>>;
  batchInputs: Array<Record<string, unknown>>;
  brewLogs: Array<Record<string, unknown>>;
  fermentationChecks?: Array<Record<string, unknown>>;
}): OperationalSummary {
  try {
    const activeBatches = input.batches.filter((batch) => {
      const status = readString(batch, ["status", "stage", "batch_status"])?.toLowerCase();
      return status ? ACTIVE_BATCH_STATUSES.has(status) : false;
    });

    const openTasks: OperationalTask[] = [];

    for (const batch of activeBatches) {
      const batchId = readString(batch, ["id"]);
      if (!batchId) continue;

      const batchLabel = readString(batch, ["batch_number", "name", "batch_name"]) ?? batchId;
      const status = readString(batch, ["status", "stage", "batch_status"])?.toLowerCase() ?? "";

      const batchInputs = input.batchInputs.filter((row) => readString(row, ["batch_id"]) === batchId);
      const batchLogs = input.brewLogs.filter((row) => readString(row, ["batch_id"]) === batchId);
      const batchLots = input.lots.filter((row) => readString(row, ["batch_id", "source_batch_id", "origin_batch_id"]) === batchId);

      const hasMashVolume = readNumber(batch, ["actual_mash_volume_liters"]) !== null || batchLogs.some((log) => readNumber(log, ["actual_mash_volume_liters"]) !== null);
      const hasTransferVolume =
        readNumber(batch, ["actual_fermenter_volume_liters"]) !== null || batchLogs.some((log) => readNumber(log, ["actual_fermenter_volume_liters"]) !== null);

      const batchLogIds = new Set(batchLogs.map((log) => readString(log, ["id"])).filter((id): id is string => id !== null));
      const batchFermentationChecks = (input.fermentationChecks ?? []).filter((fc) => {
        const brewLogId = readString(fc, ["brew_log_id"]);
        return brewLogId !== null && batchLogIds.has(brewLogId);
      });

      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

      const hasRecentGravityFromChecks = batchFermentationChecks.some((fc) => {
        const gravity = readNumber(fc, ["gravity"]);
        if (gravity === null) return false;
        const ts = readDateTimestamp(fc, ["created_at", "check_date"]);
        return ts === null || ts >= oneDayAgo;
      });

      const hasRecentFermentationCheck =
        hasRecentGravityFromChecks ||
        batchLogs.some((log) => {
          const kind = readString(log, ["log_type", "entry_type", "type", "stage"]);
          if (kind && !kind.toLowerCase().includes("ferment")) return false;
          const gravity = readNumber(log, ["gravity", "specific_gravity", "actual_gravity"]);
          if (gravity === null) return false;
          const ts = readDateTimestamp(log, ["recorded_at", "logged_at", "created_at", "updated_at"]);
          return ts === null || ts >= oneDayAgo;
        });

      const hasTank = input.tanks.some((tank) => readString(tank, ["current_batch_id"]) === batchId);

      if (status === "planned" && batchInputs.length === 0) {
        openTasks.push({ id: `computed:batch:${batchId}:assign-input-lots`, label: "Assign ingredient lots", batchLabel, batchId });
      }
      if (status === "planned" && !hasTank) {
        openTasks.push({ id: `computed:batch:${batchId}:assign-tank`, label: "Assign tank", batchLabel, batchId });
      }
      if (status === "brewing" && !hasMashVolume) {
        openTasks.push({ id: `computed:batch:${batchId}:record-mash-volume`, label: "Record mash volume", batchLabel, batchId });
      }
      if (status === "brewing" && !hasTransferVolume) {
        openTasks.push({ id: `computed:batch:${batchId}:record-transfer-volume`, label: "Record transfer volume", batchLabel, batchId });
      }
      if (status === "fermenting" && !hasRecentFermentationCheck && input.brewLogs.length > 0) {
        openTasks.push({ id: `computed:batch:${batchId}:take-gravity-reading`, label: "Take gravity reading", batchLabel, batchId });
      }
      if (status === "packaged" && batchLots.length === 0 && input.lots.length > 0) {
        openTasks.push({ id: `computed:batch:${batchId}:create-output-lot`, label: "Create output lot", batchLabel, batchId });
      }
    }

    return { activeBatchCount: activeBatches.length, openTaskCount: openTasks.length, openTasks };
  } catch {
    return { activeBatchCount: 0, openTaskCount: 0, openTasks: [] };
  }
}
