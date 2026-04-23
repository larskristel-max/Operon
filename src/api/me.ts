import { apiFetch } from "@/api/client";

export interface MeResponse {
  user: {
    id: string;
    email: string | null;
    displayName: string | null;
  };
}

export function getMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>("/api/me");
}
