import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export async function getSession() {
  return supabase.auth.getSession();
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void | Promise<void>
) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function signInWithPassword(credentials: { email: string; password: string }) {
  return supabase.auth.signInWithPassword(credentials);
}

export async function signUp(credentials: { email: string; password: string }) {
  return supabase.auth.signUp(credentials);
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function resetPasswordForEmail(email: string, options: { redirectTo: string }) {
  return supabase.auth.resetPasswordForEmail(email, options);
}
