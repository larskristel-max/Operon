import { computeTasks, isOperationallyActiveBatch } from "@/domains/tasks/rules";

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

export function computeOperationalSummary(input: {
  batches: Array<Record<string, unknown>>;
  tanks: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  lots: Array<Record<string, unknown>>;
  batchInputs: Array<Record<string, unknown>>;
  recipeIngredients?: Array<Record<string, unknown>>;
  ingredients?: Array<Record<string, unknown>>;
  brewLogs: Array<Record<string, unknown>>;
  boilAdditions?: Array<Record<string, unknown>>;
  fermentationChecks?: Array<Record<string, unknown>>;
}): OperationalSummary {
  try {
    const activeBatchCount = input.batches.filter(isOperationallyActiveBatch).length;

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
