import { supabase } from "@/lib/supabase";
import { ApiError } from "@/lib/errors";

type UnauthorizedHandler = () => Promise<void> | void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const headers = new Headers(init?.headers ?? {});
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(path, { ...init, headers });
  const payload = await res.json().catch(() => ({}));

  if (res.status === 401) {
    await onUnauthorized?.();
    throw new ApiError("Unauthorized", 401, payload);
  }

  if (!res.ok) {
    throw new ApiError(
      (payload as { error?: string }).error ?? `Request failed (${res.status})`,
      res.status,
      (payload as { detail?: unknown }).detail
    );
  }

  return payload as T;
}
