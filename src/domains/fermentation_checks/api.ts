import { apiFetch } from "@/api/client";

export async function takeGravityReading(payload: {
  batchId: string;
  gravity: number;
  temperatureC?: number | null;
  checkType?: string | null;
}): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/api/fermentation-checks/gravity", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
