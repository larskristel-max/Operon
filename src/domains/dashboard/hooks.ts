import { useCallback, useEffect, useState } from "react";
import { loadRealDashboard } from "@/domains/dashboard/api";
import type { RealDashboardData, UseRealDashboardResult } from "@/domains/dashboard/types";

const EMPTY_REAL_DASHBOARD: RealDashboardData = {
  tanks: [],
  batches: [],
  tasks: [],
  inventory: {},
  ingredient_receipts: [],
  inventory_movements: [],
  sales: [],
  lots: [],
  batch_inputs: [],
  ingredient_receipts: [],
  recipe_ingredients: [],
  brew_logs: [],
  mash_steps: [],
  boil_additions: [],
  fermentation_checks: [],
  pending_movements: [],
};

export function useRealDashboard(enabled: boolean): UseRealDashboardResult {
  const [data, setData] = useState<RealDashboardData | null>(enabled ? EMPTY_REAL_DASHBOARD : null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = await loadRealDashboard();
      const operational =
        payload.operational && typeof payload.operational === "object" ? payload.operational : undefined;

      setData({
        tanks: Array.isArray(payload.tanks) ? payload.tanks : [],
        batches: Array.isArray(payload.batches) ? payload.batches : [],
        tasks: Array.isArray(payload.tasks) ? payload.tasks : [],
        inventory: payload.inventory && typeof payload.inventory === "object" ? payload.inventory : {},
        ingredient_receipts: Array.isArray(payload.ingredient_receipts) ? payload.ingredient_receipts : [],
        inventory_movements: Array.isArray(payload.inventory_movements) ? payload.inventory_movements : [],
        sales: Array.isArray(payload.sales) ? payload.sales : [],
        lots: Array.isArray(payload.lots) ? payload.lots : [],
        batch_inputs: Array.isArray(payload.batch_inputs) ? payload.batch_inputs : [],
        ingredient_receipts: Array.isArray(payload.ingredient_receipts) ? payload.ingredient_receipts : [],
        recipe_ingredients: Array.isArray(payload.recipe_ingredients) ? payload.recipe_ingredients : [],
        brew_logs: Array.isArray(payload.brew_logs) ? payload.brew_logs : [],
        mash_steps: Array.isArray(payload.mash_steps) ? payload.mash_steps : [],
        boil_additions: Array.isArray(payload.boil_additions) ? payload.boil_additions : [],
        fermentation_checks: Array.isArray(payload.fermentation_checks) ? payload.fermentation_checks : [],
        pending_movements: Array.isArray(payload.pending_movements) ? payload.pending_movements : [],
        ...(operational ? { operational } : {}),
      });
    } catch (requestError) {
      setData(EMPTY_REAL_DASHBOARD);
      setError(requestError instanceof Error ? requestError.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
