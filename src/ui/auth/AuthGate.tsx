import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { hasSelectedLanguage } from "@/contexts/LanguageContext";
import operonLogo from "../../../assets/Operonv1.png";

type AuthView = "login" | "signup" | "forgot";

export function AuthGate({
  onRequireLanguageSelection,
  demoStartError,
}: {
  onRequireLanguageSelection?: () => void;
  demoStartError?: string | null;
}) {
  const { signIn, signUp, sendReset, enterDemoMode, error } = useApp();
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const isForgot = view === "forgot";
  const isSignup = view === "signup";
  const title = isForgot ? "Reset password" : isSignup ? "Create account" : "Welcome back";
  const subtitle = isForgot
    ? "We’ll email you a secure reset link."
    : "Sign in to your Operon account.";
  const cta = isForgot ? "Send reset link" : isSignup ? "Create account" : "Sign In";

  const canSubmit = useMemo(
    () => Boolean(email && (isForgot || password)),
    [email, password, isForgot]
  );

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
  const startDemo = async () => {
    if (!hasSelectedLanguage()) {
      onRequireLanguageSelection?.();
      return;
    }

    setBusy(true);
    setFormError(null);
    setNotice(null);
    try {
      await enterDemoMode();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to start demo mode");
    } finally {
      setBusy(false);
    }
  };


  return (
    <main className="operon-screen auth-screen">
      <section className="auth-panel">
        <img src={operonLogo} alt="Operon brand mark" className="operon-mark" />
        <h1>{title}</h1>
        <p className="screen-subtitle">{subtitle}</p>

        <label className="field-label">
          Email
          <span className="input-wrap">
            <span aria-hidden="true" className="input-icon">
              ✉
            </span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@brewery.com"
            />
          </span>
        </label>

        {!isForgot && (
          <label className="field-label">
            Password
            <span className="input-wrap">
              <span aria-hidden="true" className="input-icon">
                🔒
              </span>
              <input
                type="password"
                autoComplete={view === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
              <span aria-hidden="true" className="input-icon right">
                ◉
              </span>
            </span>
          </label>
        )}

        {view === "login" && (
          <button type="button" className="inline-link" onClick={() => setView("forgot")}>
            Forgot password?
          </button>
        )}

        <button type="button" className="gold-btn" onClick={submit} disabled={busy || !canSubmit}>
          {busy ? "Please wait…" : cta}
        </button>

        {view === "login" && (
          <>
            <div className="line-divider">or</div>
            <button type="button" className="dark-btn" disabled>
              <span>G</span> Continue with Google
            </button>
            <button type="button" className="dark-btn" disabled>
              <span></span> Continue with Apple
            </button>
            <button type="button" className="demo-card" onClick={() => void startDemo()} disabled={busy}>
              <div>
                <strong>Explore Demo</strong>
                <p>See how Operon works with sample data</p>
              </div>
              <span aria-hidden="true">›</span>
            </button>
          </>
        )}

        {(formError || demoStartError || error || notice) && (
          <div className="auth-feedback">
            {formError && <p className="error">{formError}</p>}
            {demoStartError && <p className="error">{demoStartError}</p>}
            {error && <p className="error">{error}</p>}
            {notice && <p className="notice">{notice}</p>}
          </div>
        )}

        <div className="auth-footer-links">
          {view !== "login" ? (
            <button type="button" onClick={() => setView("login")}>
              Back to Sign In
            </button>
          ) : (
            <p>
              No account? <button type="button" onClick={() => setView("signup")}>Sign up</button>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
