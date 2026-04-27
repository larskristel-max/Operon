import { apiFetch, ApiError } from "@/api/client";
import type { DemoDashboardMerged, DemoOverlayInput } from "@/domains/demo/types";

export const DEMO_MODE_KEY = "operon_demo_mode";
export const DEMO_SESSION_ID_KEY = "operon_demo_session_id";

interface DemoDashboardResponse {
  demo_session_id: string;
  demo_brewery_id: string;
  expires_at: string;
  baseline: Record<string, unknown>;
  merged: DemoDashboardMerged;
  overlay_count: number;
}

interface DemoSessionResponse {
  demo_session_id: string;
}

interface EndDemoSessionResponse {
  ok: boolean;
  demo_session_id: string;
  status: "exited";
}

interface WriteDemoOverlayRequest extends DemoOverlayInput {
  demo_session_id: string;
}

interface WriteDemoOverlayResponse {
  ok: boolean;
  overlay_record_id: string;
  demo_session_id: string;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function getStoredDemoSessionId(): string | null {
  return asNonEmptyString(sessionStorage.getItem(DEMO_SESSION_ID_KEY));
}

export function setStoredDemoSessionId(demoSessionId: string): void {
  sessionStorage.setItem(DEMO_SESSION_ID_KEY, demoSessionId);
}

export function clearStoredDemoSessionId(): void {
  sessionStorage.removeItem(DEMO_SESSION_ID_KEY);
}

export function isDemoModeEnabled(): boolean {
  return sessionStorage.getItem(DEMO_MODE_KEY) === "1";
}

export async function createDemoSession(): Promise<string> {
  const payload = await apiFetch<DemoSessionResponse>("/api/demo/session", { method: "POST" });
  const demoSessionId = asNonEmptyString(payload.demo_session_id);
  if (!demoSessionId) {
    throw new Error("Demo session response missing demo_session_id");
  }
  return demoSessionId;
}

export async function loadDemoDashboard(demoSessionId: string): Promise<DemoDashboardMerged> {
  const query = new URLSearchParams({ demo_session_id: demoSessionId });
  const payload = await apiFetch<DemoDashboardResponse>(`/api/demo/dashboard?${query.toString()}`);
  return payload.merged;
}

export async function endDemoSession(demoSessionId: string): Promise<EndDemoSessionResponse> {
  const query = new URLSearchParams({ demo_session_id: demoSessionId });
  return apiFetch<EndDemoSessionResponse>(`/api/demo/session?${query.toString()}`, { method: "DELETE" });
}

export async function writeDemoOverlay(input: DemoOverlayInput): Promise<WriteDemoOverlayResponse> {
  if (!isDemoModeEnabled()) {
    throw new Error("Demo overlay writes are only available in demo mode");
  }

  const demoSessionId = getStoredDemoSessionId();
  if (!demoSessionId) {
    throw new Error("No active demo session");
  }

  return apiFetch<WriteDemoOverlayResponse>("/api/demo/overlay", {
    method: "POST",
    body: JSON.stringify({
      demo_session_id: demoSessionId,
      table_name: input.table_name,
      record_id: input.record_id,
      operation: input.operation,
      payload: input.payload,
    } satisfies WriteDemoOverlayRequest),
  });
}

export function isDemoSessionExpired(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 410);
}
