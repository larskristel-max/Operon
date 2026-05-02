import { apiFetch } from "@/api/client";

export async function recordMashVolume(payload: { batchId: string; actualMashVolumeLiters: number }): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/api/brew-logs/mash-volume", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function recordTransferVolume(payload: { batchId: string; actualFermenterVolumeLiters: number }): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/api/brew-logs/transfer-volume", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
