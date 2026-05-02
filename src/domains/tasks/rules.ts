export type TaskType =
  | "assign_tank"
  | "assign_inputs"
  | "record_mash_volume"
  | "record_transfer_volume"
  | "take_gravity_reading"
  | "create_output_lot";

export interface Task {
  id: string;
  type: TaskType;
  batch_id: string;
  label: string;
  actionable: boolean;
  batch_label: string;
}

const OPERATIONAL_ACTIVE_BATCH_STATUSES = new Set(["planned", "brewing", "fermenting", "conditioning", "ready"]);
const TASK_ELIGIBLE_BATCH_STATUSES = new Set(["planned", "brewing", "fermenting", "conditioning", "ready", "packaged"]);

function readString(record: Record<string, unknown> | null | undefined, keys: string[]): string | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return null;
}

export function isOperationallyActiveBatch(batch: Record<string, unknown>): boolean {
  const status = readString(batch, ["status", "stage", "batch_status"])?.toLowerCase();
  return status ? OPERATIONAL_ACTIVE_BATCH_STATUSES.has(status) : false;
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

function taskId(batchId: string, type: TaskType, context: string): string {
  const input = `${batchId}:${type}:${context}`;
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `task_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function computeTasks(input: {
  batches: Array<Record<string, unknown>>;
  tanks: Array<Record<string, unknown>>;
  lots: Array<Record<string, unknown>>;
  batchInputs: Array<Record<string, unknown>>;
  brewLogs: Array<Record<string, unknown>>;
  fermentationChecks?: Array<Record<string, unknown>>;
}): Task[] {
  const tasks: Task[] = [];
  const taskEligibleBatches = input.batches.filter((batch) => {
    const status = readString(batch, ["status", "stage", "batch_status"])?.toLowerCase();
    return status ? TASK_ELIGIBLE_BATCH_STATUSES.has(status) : false;
  });

  for (const batch of taskEligibleBatches) {
    const batchId = readString(batch, ["id"]);
    if (!batchId) continue;
    const batchLabel = readString(batch, ["batch_number", "name", "batch_name"]) ?? batchId;
    const status = readString(batch, ["status", "stage", "batch_status"])?.toLowerCase() ?? "";

    const batchInputs = input.batchInputs.filter((row) => readString(row, ["batch_id"]) === batchId);
    const batchLogs = input.brewLogs.filter((row) => readString(row, ["batch_id"]) === batchId);
    const batchLots = input.lots.filter((row) => readString(row, ["batch_id", "source_batch_id", "origin_batch_id"]) === batchId);
    const hasMashVolume = readNumber(batch, ["actual_mash_volume_liters"]) !== null || batchLogs.some((log) => readNumber(log, ["actual_mash_volume_liters"]) !== null);
    const hasTransferVolume = readNumber(batch, ["actual_fermenter_volume_liters"]) !== null || batchLogs.some((log) => readNumber(log, ["actual_fermenter_volume_liters"]) !== null);
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
    const hasRecentFermentationCheck = hasRecentGravityFromChecks || batchLogs.some((log) => {
      const kind = readString(log, ["log_type", "entry_type", "type", "stage"]);
      if (kind && !kind.toLowerCase().includes("ferment")) return false;
      const gravity = readNumber(log, ["gravity", "specific_gravity", "actual_gravity"]);
      if (gravity === null) return false;
      const ts = readDateTimestamp(log, ["recorded_at", "logged_at", "created_at", "updated_at"]);
      return ts === null || ts >= oneDayAgo;
    });
    const hasTank = input.tanks.some((tank) => readString(tank, ["current_batch_id"]) === batchId);

    if (status === "planned" && batchInputs.length === 0) tasks.push({ id: taskId(batchId, "assign_inputs", "planned:no_batch_inputs"), type: "assign_inputs", batch_id: batchId, label: "Assign ingredient lots", actionable: true, batch_label: batchLabel });
    if (status === "planned" && !hasTank) tasks.push({ id: taskId(batchId, "assign_tank", "planned:no_tank"), type: "assign_tank", batch_id: batchId, label: "Assign tank", actionable: true, batch_label: batchLabel });
    if (status === "brewing" && !hasMashVolume) tasks.push({ id: taskId(batchId, "record_mash_volume", "brewing:no_mash_volume"), type: "record_mash_volume", batch_id: batchId, label: "Record mash volume", actionable: true, batch_label: batchLabel });
    if (status === "brewing" && !hasTransferVolume) tasks.push({ id: taskId(batchId, "record_transfer_volume", "brewing:no_transfer_volume"), type: "record_transfer_volume", batch_id: batchId, label: "Record transfer volume", actionable: true, batch_label: batchLabel });
    if (status === "fermenting" && !hasRecentFermentationCheck && input.brewLogs.length > 0) tasks.push({ id: taskId(batchId, "take_gravity_reading", "fermenting:no_recent_gravity"), type: "take_gravity_reading", batch_id: batchId, label: "Take gravity reading", actionable: true, batch_label: batchLabel });
    if (status === "packaged" && batchLots.length === 0 && input.lots.length > 0) tasks.push({ id: taskId(batchId, "create_output_lot", "packaged:no_lots"), type: "create_output_lot", batch_id: batchId, label: "Create output lot", actionable: true, batch_label: batchLabel });
  }

  return Array.from(new Map(tasks.map((task) => [task.id, task])).values());
}
