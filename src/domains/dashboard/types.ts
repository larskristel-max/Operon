import type { DemoDashboardMerged } from "@/domains/demo/types";

export interface RealDashboardData {
  tanks: Array<Record<string, unknown>>;
  batches: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  inventory: Record<string, unknown>;
  inventory_movements: Array<Record<string, unknown>>;
  sales: Array<Record<string, unknown>>;
}

export interface UseRealDashboardResult {
  data: RealDashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export type RealDashboardMerged = DemoDashboardMerged;
