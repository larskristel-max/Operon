import { useState } from "react";
import { useApp } from "@/context/AppContext";

type AuthView = "login" | "signup" | "forgot";

export function AuthGate() {
  const { signIn, signUp, sendReset, enterDemoMode, error } = useApp();
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setFormError(null);
    setNotice(null);
    try {
      if (view === "login") {
        await signIn(email, password);
      } else if (view === "signup") {
        await signUp(email, password);
        setNotice("Account created. Check your inbox to confirm your email before first login.");
      } else {
        await sendReset(email);
        setNotice("Password reset link sent. Check your inbox.");
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const title = view === "login" ? "Welcome back" : view === "signup" ? "Create account" : "Reset password";
  const cta = view === "login" ? "Sign in" : view === "signup" ? "Create account" : "Send reset link";

  return (
    <section className="auth-shell">
      <article className="auth-card">
        <p className="eyebrow">Operon</p>
        <h1>{title}</h1>
        <p className="subtle">Secure access for your brewery workspace.</p>

        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@brewery.com"
          />
        </label>

        {view !== "forgot" && (
          <label>
            Password
            <input
              type="password"
              autoComplete={view === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </label>
        )}

        <button className="primary" onClick={submit} disabled={busy || !email || (view !== "forgot" && !password)}>
          {busy ? "Please wait…" : cta}
        </button>

        {formError && <p className="error">{formError}</p>}
        {error && <p className="error">{error}</p>}
        {notice && <p className="notice">{notice}</p>}

        <div className="auth-links">
          {view !== "login" && <button onClick={() => setView("login")}>Back to login</button>}
          {view === "login" && (
            <>
              <button onClick={() => setView("signup")}>Create account</button>
              <button onClick={() => setView("forgot")}>Forgot password?</button>
            </>
          )}
        </div>
      </article>

      <aside className="demo-island">
        <p>Demo environment</p>
        <button onClick={enterDemoMode}>Continue in demo mode</button>
      </aside>
    </section>
  );
}
