import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_MODE_KEY,
  clearStoredDemoSessionId,
  createDemoSession,
  endDemoSession,
  getStoredDemoSessionId,
  setStoredDemoSessionId,
} from "@/api/demo";
import { getMe, type MeResponse } from "@/api/me";
import { ApiError, setAccessTokenProvider, setUnauthorizedHandler } from "@/api/client";
import {
  getSession,
  onAuthStateChange,
  resetPasswordForEmail,
  signInWithPassword,
  signOut as signOutSession,
  signUp as signUpSession,
  type AuthSession,
  type AuthState,
  type AuthStatus,
} from "@/domains/auth";
import { provisionOnboarding } from "@/domains/onboarding/api";
import {
  clearPendingOnboarding,
  getPendingOnboarding,
  normalizeEmail,
  setPendingOnboarding,
} from "@/domains/onboarding/storage";
import type { OnboardingProvisionPayload } from "@/domains/onboarding/types";

interface AppContextValue {
  authStatus: AuthStatus;
  session: AuthSession | null;
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
    onboarding: OnboardingProvisionPayload
  ) => Promise<{ requiresEmailConfirmation: boolean }>;
  sendReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

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

async function resolveProfile(): Promise<MeResponse["user"] | null> {
  const { user } = await getMe();
  return user;
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
    await signOutSession();
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

  useEffect(() => {
    setAccessTokenProvider(() => authState.session?.access_token ?? null);
    return () => setAccessTokenProvider(null);
  }, [authState.session]);

  const hydrateSession = useCallback(async (session: AuthSession | null) => {
    setAccessTokenProvider(() => session?.access_token ?? null);
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
        await signOutSession();
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

    getSession().then(async ({ data }) => {
      if (!mounted) return;
      await hydrateSession(data.session);
    });

    const {
      data: { subscription },
    } = onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      await hydrateSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [hydrateSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await signInWithPassword({ email, password });
    if (error) throw error;

    const session = data.session ?? (await getSession()).data.session;
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
    onboarding: OnboardingProvisionPayload
  ) => {
    const { data, error } = await signUpSession({ email, password });
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
    const latestSession = (await getSession()).data.session ?? session;
    await hydrateSession(latestSession);
    return { requiresEmailConfirmation: false };
  }, [hydrateSession]);

  const sendReset = useCallback(async (email: string) => {
    const { error } = await resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#auth=reset`,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    clearDemoModeFlag();
    clearStoredDemoSessionId();
    setIsDemoMode(false);
    const { error } = await signOutSession();
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
        await signOutSession();
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
