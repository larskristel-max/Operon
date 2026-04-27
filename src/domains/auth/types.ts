import type { Session } from "@supabase/supabase-js";
import type { MeResponse } from "@/api/me";

export type AuthStatus = "booting" | "unauthenticated" | "authenticated" | "refreshing";

export type AuthSession = Session;

export interface AuthState {
  status: AuthStatus;
  session: AuthSession | null;
  me: MeResponse["user"] | null;
  error: string | null;
  profileError: string | null;
}
