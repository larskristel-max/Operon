import { computeOperationalSummary } from "@/domains/dashboard/operational";
import type { RealDashboardMerged, RealDashboardData } from "@/domains/dashboard/types";

export function mapRealDashboardToMerged(data: RealDashboardData): RealDashboardMerged {
  const inventoryItems = Array.isArray(data.inventory.items)
    ? (data.inventory.items as Array<Record<string, unknown>>)
    : [];

  return {
    brewery_profile: null,
    tanks: data.tanks,
    batches: data.batches,
    tasks: data.tasks,
    ingredients: inventoryItems,
    recipes: [],
    packaging_formats: [],
    lots: data.lots,
    inventory_movements: data.inventory_movements,
    sales: data.sales,
    batch_inputs: data.batch_inputs,
    brew_logs: data.brew_logs,
    pending_movements: data.pending_movements,
    operational:
      data.operational ??
      computeOperationalSummary({
        batches: data.batches,
        tanks: data.tanks,
        tasks: data.tasks,
        lots: data.lots,
        batchInputs: data.batch_inputs,
        brewLogs: data.brew_logs,
      }),
  };
}
