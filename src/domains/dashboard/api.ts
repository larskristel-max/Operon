import { apiFetch } from "@/api/client";
import type { RealDashboardData } from "@/domains/dashboard/types";

export async function loadRealDashboard(): Promise<RealDashboardData> {
  return apiFetch<RealDashboardData>("/api/dashboard");
}
