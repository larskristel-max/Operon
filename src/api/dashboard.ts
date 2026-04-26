import { apiFetch } from "@/api/client";

export interface RealDashboardData {
  tanks: Array<Record<string, unknown>>;
  batches: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  inventory: Record<string, unknown>;
}

export async function loadRealDashboard(): Promise<RealDashboardData> {
  return apiFetch<RealDashboardData>("/api/dashboard");
}
