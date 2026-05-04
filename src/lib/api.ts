import { ApiError } from "@/lib/errors";

type UnauthorizedHandler = () => Promise<void> | void;
type AccessTokenProvider = () => string | null;

let onUnauthorized: UnauthorizedHandler | null = null;
let getAccessToken: AccessTokenProvider | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

export function setAccessTokenProvider(provider: AccessTokenProvider | null): void {
  getAccessToken = provider;
}

interface ApiFetchOptions {
  accessToken?: string;
}

export async function apiFetch<T>(path: string, init?: RequestInit, options?: ApiFetchOptions): Promise<T> {
  const token = options?.accessToken ?? getAccessToken?.() ?? undefined;

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
