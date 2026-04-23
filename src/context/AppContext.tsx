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
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  sendReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const DEMO_MODE_KEY = "operon_demo_mode";
const AppContext = createContext<AppContextValue | null>(null);

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
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => localStorage.getItem(DEMO_MODE_KEY) === "1");

  const enterDemoMode = useCallback(() => {
    localStorage.setItem(DEMO_MODE_KEY, "1");
    setIsDemoMode(true);
  }, []);

  const exitDemoMode = useCallback(() => {
    localStorage.removeItem(DEMO_MODE_KEY);
    setIsDemoMode(false);
    setAuthState((prev) => ({
      ...prev,
      status: "unauthenticated",
      session: null,
      me: null,
      error: null,
      profileError: null,
    }));
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const sendReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#auth=reset`,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(DEMO_MODE_KEY);
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
