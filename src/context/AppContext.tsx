import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  DEMO_MODE_KEY,
  clearStoredDemoSessionId,
  createDemoSession,
  endDemoSession,
  getStoredDemoSessionId,
  setStoredDemoSessionId,
} from "@/api/demo";
import { getMe, type MeResponse } from "@/api/me";
import { ApiError, setUnauthorizedHandler } from "@/api/client";

export type AuthStatus = "booting" | "unauthenticated" | "authenticated" | "refreshing";

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  me: MeResponse["user"] | null;
  error: string | null;
  profileError: string | null;
}

interface AppContextValue {
  authStatus: AuthStatus;
  session: Session | null;
  me: MeResponse["user"] | null;
  error: string | null;
  profileError: string | null;
  isDemoMode: boolean;
  enterDemoMode: () => Promise<void>;
  exitDemoMode: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    onboarding: { firstName: string; lastName?: string; breweryName: string }
  ) => Promise<{ requiresEmailConfirmation: boolean }>;
  sendReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);
const PENDING_ONBOARDING_KEY = "operon.pendingOnboarding";

interface PendingOnboardingPayload {
  firstName: string;
  lastName?: string;
  breweryName: string;
  email: string;
  createdAt: string;
}

function readDemoModeFlag(): boolean {
  const raw = sessionStorage.getItem(DEMO_MODE_KEY);
  if (raw !== "1") return false;
  return Boolean(getStoredDemoSessionId());
}

function setDemoModeFlag(): void {
  sessionStorage.setItem(DEMO_MODE_KEY, "1");
}

function clearDemoModeFlag(): void {
  sessionStorage.removeItem(DEMO_MODE_KEY);
  // Cleanup legacy persisted demo flag from previous builds.
  localStorage.removeItem(DEMO_MODE_KEY);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readPendingOnboarding(): Record<string, PendingOnboardingPayload> {
  const raw = localStorage.getItem(PENDING_ONBOARDING_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, PendingOnboardingPayload>;
  } catch {
    return {};
  }
}

function writePendingOnboarding(next: Record<string, PendingOnboardingPayload>): void {
  localStorage.setItem(PENDING_ONBOARDING_KEY, JSON.stringify(next));
}

function setPendingOnboarding(payload: PendingOnboardingPayload): void {
  const current = readPendingOnboarding();
  current[normalizeEmail(payload.email)] = payload;
  writePendingOnboarding(current);
}

function getPendingOnboarding(email: string): PendingOnboardingPayload | null {
  const current = readPendingOnboarding();
  return current[normalizeEmail(email)] ?? null;
}

function clearPendingOnboarding(email: string): void {
  const key = normalizeEmail(email);
  const current = readPendingOnboarding();
  if (!(key in current)) return;
  delete current[key];
  writePendingOnboarding(current);
}

async function resolveProfile(): Promise<MeResponse["user"] | null> {
  const { user } = await getMe();
  return user;
}

async function provisionOnboarding(
  accessToken: string,
  payload: { firstName: string; lastName?: string; breweryName: string }
): Promise<void> {
  const res = await fetch("/api/onboarding/provision", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      first_name: payload.firstName,
      last_name: payload.lastName ?? "",
      brewery_name: payload.breweryName,
    }),
  });

  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new Error(body.error ?? "Failed to provision brewery workspace");
  }
}

function isAuthFailure(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    status: "booting",
    session: null,
    me: null,
    error: null,
    profileError: null,
  });
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => readDemoModeFlag());

  const enterDemoMode = useCallback(async () => {
    const demoSessionId = await createDemoSession();
    setStoredDemoSessionId(demoSessionId);
    setDemoModeFlag();
    setIsDemoMode(true);
  }, []);

  const exitDemoMode = useCallback(async () => {
    const demoSessionId = getStoredDemoSessionId();

    try {
      if (demoSessionId) {
        await endDemoSession(demoSessionId);
      }
    } catch {
      // Local cleanup still runs even if API exit fails.
    } finally {
      clearStoredDemoSessionId();
      clearDemoModeFlag();
      setIsDemoMode(false);
      setAuthState((prev) => ({
        ...prev,
        status: "unauthenticated",
        session: null,
        me: null,
        error: null,
        profileError: null,
      }));
    }
  }, []);

  const handleUnauthorized = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthState({
      status: "unauthenticated",
      session: null,
      me: null,
      error: "Session expired. Please sign in again.",
      profileError: null,
    });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);
    return () => setUnauthorizedHandler(null);
  }, [handleUnauthorized]);

  const hydrateSession = useCallback(async (session: Session | null) => {
    if (isDemoMode) {
      setAuthState((prev) => ({
        ...prev,
        status: session ? "authenticated" : "unauthenticated",
        session,
        me: session ? prev.me : null,
        error: null,
        profileError: null,
      }));
      return;
    }

    if (!session) {
      setAuthState({
        status: "unauthenticated",
        session: null,
        me: null,
        error: null,
        profileError: null,
      });
      return;
    }

    setAuthState((prev) => ({ ...prev, status: "refreshing", session, error: null, profileError: null }));

    try {
      const me = await resolveProfile();
      setAuthState({ status: "authenticated", session, me, error: null, profileError: null });
    } catch (error) {
      if (isAuthFailure(error)) {
        await supabase.auth.signOut();
        setAuthState({
          status: "unauthenticated",
          session: null,
          me: null,
          error: "Session expired. Please sign in again.",
          profileError: null,
        });
        return;
      }

      setAuthState((prev) => ({
        ...prev,
        status: "authenticated",
        session,
        profileError:
          error instanceof Error
            ? `Profile temporarily unavailable: ${error.message}`
            : "Profile temporarily unavailable",
      }));
    }
  }, [isDemoMode]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      await hydrateSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      await hydrateSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [hydrateSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const session = data.session ?? (await supabase.auth.getSession()).data.session;
    if (!session?.access_token) return;

    const pending = getPendingOnboarding(email);
    if (!pending) return;

    try {
      await provisionOnboarding(session.access_token, pending);
      clearPendingOnboarding(email);
      await hydrateSession(session);
    } catch (provisionError) {
      throw new Error(
        provisionError instanceof Error
          ? `Signed in, but we could not finish workspace setup yet: ${provisionError.message}`
          : "Signed in, but we could not finish workspace setup yet. Please try again."
      );
    }
  }, [hydrateSession]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    onboarding: { firstName: string; lastName?: string; breweryName: string }
  ) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    const session = data.session;
    if (!session?.access_token) {
      setPendingOnboarding({
        firstName: onboarding.firstName,
        lastName: onboarding.lastName ?? "",
        breweryName: onboarding.breweryName,
        email: normalizeEmail(email),
        createdAt: new Date().toISOString(),
      });
      return { requiresEmailConfirmation: true };
    }

    await provisionOnboarding(session.access_token, onboarding);
    const latestSession = (await supabase.auth.getSession()).data.session ?? session;
    await hydrateSession(latestSession);
    return { requiresEmailConfirmation: false };
  }, [hydrateSession]);

  const sendReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#auth=reset`,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    clearDemoModeFlag();
    clearStoredDemoSessionId();
    setIsDemoMode(false);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setAuthState({
      status: "unauthenticated",
      session: null,
      me: null,
      error: null,
      profileError: null,
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!authState.session || isDemoMode) return;
    try {
      const me = await resolveProfile();
      setAuthState((prev) => ({ ...prev, me, error: null, profileError: null }));
    } catch (error) {
      if (isAuthFailure(error)) {
        await supabase.auth.signOut();
        setAuthState({
          status: "unauthenticated",
          session: null,
          me: null,
          error: "Session expired. Please sign in again.",
          profileError: null,
        });
        return;
      }

      setAuthState((prev) => ({
        ...prev,
        profileError:
          error instanceof Error
            ? `Profile temporarily unavailable: ${error.message}`
            : "Profile temporarily unavailable",
      }));
    }
  }, [authState.session, isDemoMode]);

  const value = useMemo<AppContextValue>(
    () => ({
      authStatus: authState.status,
      session: authState.session,
      me: authState.me,
      error: authState.error,
      profileError: authState.profileError,
      isDemoMode,
      enterDemoMode,
      exitDemoMode,
      signIn,
      signUp,
      sendReset,
      signOut,
      refreshProfile,
    }),
    [authState, isDemoMode, enterDemoMode, exitDemoMode, signIn, signUp, sendReset, signOut, refreshProfile]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}
