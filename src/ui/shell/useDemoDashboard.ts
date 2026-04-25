import { useCallback, useEffect, useState } from "react";
import {
  createDemoSession,
  getStoredDemoSessionId,
  isDemoSessionExpired,
  loadDemoDashboard,
  setStoredDemoSessionId,
  type DemoDashboardMerged,
} from "@/api/demo";

interface UseDemoDashboardResult {
  data: DemoDashboardMerged | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDemoDashboard(enabled: boolean): UseDemoDashboardResult {
  const [data, setData] = useState<DemoDashboardMerged | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const currentDemoSessionId = getStoredDemoSessionId();
    if (!currentDemoSessionId) {
      setData(null);
      setError("No demo session found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      try {
        const merged = await loadDemoDashboard(currentDemoSessionId);
        setData(merged);
        return;
      } catch (error) {
        if (!isDemoSessionExpired(error)) {
          setData(null);
          setError(error instanceof Error ? error.message : "Failed to load demo dashboard");
          return;
        }
      }

      const renewedDemoSessionId = await createDemoSession();
      setStoredDemoSessionId(renewedDemoSessionId);
      const merged = await loadDemoDashboard(renewedDemoSessionId);
      setData(merged);
      setError(null);
    } catch (error) {
      setData(null);
      setError(error instanceof Error ? error.message : "Failed to recover demo session");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
