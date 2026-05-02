import { apiFetch } from "@/api/client";

export async function assignTank(payload: { tankId: string; batchId: string }): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/api/tanks/assign", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
