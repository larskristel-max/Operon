import { computeTasks } from "@/domains/tasks/rules";

export interface OperationalTask {
  id: string;
  type: string;
  label: string;
  batchLabel: string;
  batchId: string;
  actionable: boolean;
}

export interface OperationalSummary {
  activeBatchCount: number;
  openTaskCount: number;
  openTasks: OperationalTask[];
}

const ACTIVE_BATCH_STATUSES = new Set(["planned", "brewing", "fermenting", "conditioning", "ready", "packaged"]);

function readString(record: Record<string, unknown> | null | undefined, keys: string[]): string | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return null;
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
    const activeBatchCount = input.batches.filter((batch) => {
      const status = readString(batch, ["status", "stage", "batch_status"])?.toLowerCase();
      return status ? ACTIVE_BATCH_STATUSES.has(status) : false;
    }).length;

    const computedTasks = computeTasks(input);
    const openTasks: OperationalTask[] = computedTasks.map((task) => ({
      id: task.id,
      type: task.type,
      label: task.label,
      batchLabel: task.batch_label,
      batchId: task.batch_id,
      actionable: task.actionable,
    }));
    return { activeBatchCount, openTaskCount: openTasks.length, openTasks };
  } catch {
    return { activeBatchCount: 0, openTaskCount: 0, openTasks: [] };
  }
}
