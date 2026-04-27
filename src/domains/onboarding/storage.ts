import type { PendingOnboardingMap, PendingOnboardingPayload } from "@/domains/onboarding/types";

export const PENDING_ONBOARDING_KEY = "operon.pendingOnboarding";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readPendingOnboarding(): PendingOnboardingMap {
  const raw = localStorage.getItem(PENDING_ONBOARDING_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as PendingOnboardingMap;
  } catch {
    return {};
  }
}

function writePendingOnboarding(next: PendingOnboardingMap): void {
  localStorage.setItem(PENDING_ONBOARDING_KEY, JSON.stringify(next));
}

export function setPendingOnboarding(payload: PendingOnboardingPayload): void {
  const current = readPendingOnboarding();
  current[normalizeEmail(payload.email)] = payload;
  writePendingOnboarding(current);
}

export function getPendingOnboarding(email: string): PendingOnboardingPayload | null {
  const current = readPendingOnboarding();
  return current[normalizeEmail(email)] ?? null;
}

export function clearPendingOnboarding(email: string): void {
  const key = normalizeEmail(email);
  const current = readPendingOnboarding();
  if (!(key in current)) return;
  delete current[key];
  writePendingOnboarding(current);
}
