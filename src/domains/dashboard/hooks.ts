import { useCallback, useEffect, useState } from "react";
import { loadRealDashboard } from "@/domains/dashboard/api";
import type { RealDashboardData, UseRealDashboardResult } from "@/domains/dashboard/types";

const EMPTY_REAL_DASHBOARD: RealDashboardData = {
  tanks: [],
  batches: [],
  tasks: [],
  inventory: {},
  inventory_movements: [],
  sales: [],
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
      setData({
        tanks: Array.isArray(payload.tanks) ? payload.tanks : [],
        batches: Array.isArray(payload.batches) ? payload.batches : [],
        tasks: Array.isArray(payload.tasks) ? payload.tasks : [],
        inventory: payload.inventory && typeof payload.inventory === "object" ? payload.inventory : {},
        inventory_movements: Array.isArray(payload.inventory_movements) ? payload.inventory_movements : [],
        sales: Array.isArray(payload.sales) ? payload.sales : [],
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
