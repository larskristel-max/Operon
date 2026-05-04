import type { DemoDashboardMerged } from "@/domains/demo/types";

import type { OperationalSummary } from "@/domains/dashboard/operational";

export interface RealDashboardData {
  tanks: Array<Record<string, unknown>>;
  batches: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  inventory: Record<string, unknown>;
  ingredient_receipts: Array<Record<string, unknown>>;
  inventory_movements: Array<Record<string, unknown>>;
  sales: Array<Record<string, unknown>>;
  lots: Array<Record<string, unknown>>;
  batch_inputs: Array<Record<string, unknown>>;
  recipe_ingredients: Array<Record<string, unknown>>;
  brew_logs: Array<Record<string, unknown>>;
  mash_steps: Array<Record<string, unknown>>;
  boil_additions: Array<Record<string, unknown>>;
  fermentation_checks: Array<Record<string, unknown>>;
  pending_movements: Array<Record<string, unknown>>;
  operational?: OperationalSummary;
}

export interface UseRealDashboardResult {
  data: RealDashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export type RealDashboardMerged = DemoDashboardMerged;
