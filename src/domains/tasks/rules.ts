export type TaskType =
  | "start_brewing"
  | "assign_tank"
  | "assign_inputs"
  | "record_mash_volume"
  | "record_mash_water"
  | "record_strike_temp"
  | "record_sparge_water"
  | "record_mash_ph"
  | "record_pre_boil_gravity"
  | "record_boil"
  | "record_hop_addition"
  | "record_transfer"
  | "pitch_yeast"
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
  recipeIngredients?: Array<Record<string, unknown>>;
  ingredients?: Array<Record<string, unknown>>;
  brewLogs: Array<Record<string, unknown>>;
  boilAdditions?: Array<Record<string, unknown>>;
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
    const hasMashWater = batchLogs.some((log) => readNumber(log, ["actual_mash_water_liters"]) !== null);
    const hasStrikeTemp = batchLogs.some((log) => readNumber(log, ["actual_strike_water_temp_c"]) !== null);
    const hasSpargeWater = batchLogs.some((log) => readNumber(log, ["actual_sparge_water_liters"]) !== null);
    const hasMashPh = batchLogs.some((log) => readNumber(log, ["actual_mash_ph"]) !== null);
    const hasPreBoilGravity = batchLogs.some((log) => readNumber(log, ["actual_pre_boil_gravity"]) !== null);
    const hasOriginalGravity = batchLogs.some((log) => readNumber(log, ["actual_original_gravity"]) !== null);
    const hasTransferVolume = readNumber(batch, ["actual_fermenter_volume_liters"]) !== null || batchLogs.some((log) => readNumber(log, ["actual_fermenter_volume_liters"]) !== null);
    const hasTransfer = batchLogs.some((log) => readString(log, ["transfer_finished_at"]) !== null);
    const hasYeastPitch = batchLogs.some((log) => readNumber(log, ["yeast_pitch_quantity"]) !== null && readString(log, ["yeast_pitch_time"]) !== null);
    const batchLogIds = new Set(batchLogs.map((log) => readString(log, ["id"])).filter((id): id is string => id !== null));
    const hasHopAddition = (input.boilAdditions ?? []).some((row) => {
      const brewLogId = readString(row, ["brew_log_id"]);
      return brewLogId !== null && batchLogIds.has(brewLogId);
    });
    const batchFermentationChecks = (input.fermentationChecks ?? []).filter((fc) => {
      const directBatchId = readString(fc, ["batch_id"]);
      if (directBatchId !== null) return directBatchId === batchId;
      const brewLogId = readString(fc, ["brew_log_id"]);
      return brewLogId !== null && batchLogIds.has(brewLogId);
    });
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const hasRecentGravityFromChecks = batchFermentationChecks.some((fc) => {
      const gravity = readNumber(fc, ["gravity"]);
      if (gravity === null) return false;
      const ts = readDateTimestamp(fc, ["measured_at", "created_at", "check_date"]);
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

    const recipeId = readString(batch, ["recipe_id"]);
    const requiredRecipeIngredients = (input.recipeIngredients ?? []).filter((row) => readString(row, ["recipe_id"]) === recipeId).filter((row) => {
      const ingredientType = readString(row, ["ingredient_type", "role", "type"])?.toLowerCase();
      const ingredientId = readString(row, ["ingredient_id"]);
      const ingredient = (input.ingredients ?? []).find((ing) => readString(ing, ["id"]) === ingredientId);
      const resolvedType = ingredientType ?? readString(ingredient, ["ingredient_type", "type", "category"])?.toLowerCase();
      return !resolvedType || !["packaging", "cleaning"].includes(resolvedType);
    });
    const hasRequiredRecipeIngredients = requiredRecipeIngredients.length > 0;
    const hasAllRequiredInputLots = hasRequiredRecipeIngredients && requiredRecipeIngredients.every((row) => {
      const ingredientId = readString(row, ["ingredient_id"]);
      if (!ingredientId) return false;
      return batchInputs.some((inputRow) => readString(inputRow, ["ingredient_id"]) === ingredientId && readString(inputRow, ["ingredient_receipt_id"]) !== null);
    });
    if (!hasAllRequiredInputLots) tasks.push({ id: taskId(batchId, "assign_inputs", `${status || "unknown"}:missing_required_lot_links`), type: "assign_inputs", batch_id: batchId, label: hasRequiredRecipeIngredients ? "Assign ingredient lots" : "No recipe ingredients configured", actionable: true, batch_label: batchLabel });
    if (status === "planned" && !hasTank) tasks.push({ id: taskId(batchId, "assign_tank", "planned:no_tank"), type: "assign_tank", batch_id: batchId, label: "Assign tank", actionable: true, batch_label: batchLabel });
    if (status === "planned" && hasTank && batchInputs.length > 0) tasks.push({ id: taskId(batchId, "start_brewing", "planned:ready_to_start"), type: "start_brewing", batch_id: batchId, label: "Start brewing", actionable: true, batch_label: batchLabel });
    if (status === "brewing" && !hasMashVolume) tasks.push({ id: taskId(batchId, "record_mash_volume", "brewing:no_mash_volume"), type: "record_mash_volume", batch_id: batchId, label: "Record mash volume", actionable: true, batch_label: batchLabel });
    if (status === "brewing" && !hasMashWater) tasks.push({ id: taskId(batchId, "record_mash_water", "brewing:no_mash_water"), type: "record_mash_water", batch_id: batchId, label: "Record mash water", actionable: true, batch_label: batchLabel });
    if (status === "brewing" && !hasStrikeTemp) tasks.push({ id: taskId(batchId, "record_strike_temp", "brewing:no_strike_temp"), type: "record_strike_temp", batch_id: batchId, label: "Record strike temp", actionable: true, batch_label: batchLabel });
    if (status === "brewing" && !hasSpargeWater) tasks.push({ id: taskId(batchId, "record_sparge_water", "brewing:no_sparge_water"), type: "record_sparge_water", batch_id: batchId, label: "Record sparge water", actionable: true, batch_label: batchLabel });
    if (status === "brewing" && !hasMashPh) tasks.push({ id: taskId(batchId, "record_mash_ph", "brewing:no_mash_ph"), type: "record_mash_ph", batch_id: batchId, label: "Record mash pH", actionable: true, batch_label: batchLabel });
    if (status === "brewing" && !hasPreBoilGravity) tasks.push({ id: taskId(batchId, "record_pre_boil_gravity", "brewing:no_pre_boil_gravity"), type: "record_pre_boil_gravity", batch_id: batchId, label: "Record pre-boil gravity", actionable: true, batch_label: batchLabel });
    if (status === "brewing" && !hasOriginalGravity) tasks.push({ id: taskId(batchId, "record_boil", "brewing:no_original_gravity"), type: "record_boil", batch_id: batchId, label: "Record original gravity", actionable: true, batch_label: batchLabel });
    if (status === "brewing" && !hasHopAddition) tasks.push({ id: taskId(batchId, "record_hop_addition", "brewing:no_hop_addition"), type: "record_hop_addition", batch_id: batchId, label: "Record hop addition", actionable: true, batch_label: batchLabel });
    if (status === "brewing" && !hasYeastPitch) tasks.push({ id: taskId(batchId, "pitch_yeast", "brewing:no_yeast_pitch"), type: "pitch_yeast", batch_id: batchId, label: "Pitch yeast", actionable: true, batch_label: batchLabel });
    if (status === "brewing" && !hasTransferVolume) tasks.push({ id: taskId(batchId, "record_transfer_volume", "brewing:no_transfer_volume"), type: "record_transfer_volume", batch_id: batchId, label: "Record transfer volume", actionable: true, batch_label: batchLabel });
    if (status === "fermenting" && !hasRecentFermentationCheck) tasks.push({ id: taskId(batchId, "take_gravity_reading", "fermenting:no_recent_gravity"), type: "take_gravity_reading", batch_id: batchId, label: "Take gravity reading", actionable: true, batch_label: batchLabel });
    if (status === "packaged" && batchLots.length === 0) tasks.push({ id: taskId(batchId, "create_output_lot", "packaged:no_lots"), type: "create_output_lot", batch_id: batchId, label: "Create output lot", actionable: true, batch_label: batchLabel });
  }

  return Array.from(new Map(tasks.map((task) => [task.id, task])).values());
}
