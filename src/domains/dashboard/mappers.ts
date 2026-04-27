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
    lots: [],
    inventory_movements: data.inventory_movements,
    sales: data.sales,
  };
}
