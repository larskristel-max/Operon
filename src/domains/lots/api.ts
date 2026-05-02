import { apiFetch } from "@/api/client";

export async function createOutputLot(payload: {
  batchId: string;
  lotNumber: string;
  volumeLiters?: number | null;
  unitsCount?: number | null;
  packagingFormatId?: string | null;
}): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/api/lots/create-output", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
