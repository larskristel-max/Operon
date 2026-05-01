import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { hasSelectedLanguage } from "@/contexts/LanguageContext";
import operonLogo from "../../../assets/Operonv1.png";

type AuthView = "login" | "signup" | "forgot";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.46a5.53 5.53 0 0 1-2.39 3.63v3.01h3.86c2.26-2.08 3.56-5.15 3.56-8.67Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.89l-3.86-3.01c-1.07.72-2.44 1.14-4.07 1.14-3.13 0-5.79-2.12-6.74-4.96H1.27v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.26 14.28A7.2 7.2 0 0 1 4.88 12c0-.79.14-1.55.38-2.28V6.62H1.27A12 12 0 0 0 0 12c0 1.93.46 3.76 1.27 5.38l3.99-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l3.99 3.1c.95-2.84 3.61-4.95 6.74-4.95Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M16.74 12.3c.02 2.2 1.94 2.94 1.96 2.95-.02.05-.31 1.06-1.02 2.1-.61.9-1.24 1.8-2.23 1.82-.98.02-1.3-.58-2.42-.58-1.13 0-1.48.57-2.4.6-.95.03-1.68-.95-2.29-1.85-1.25-1.81-2.2-5.12-.92-7.34.63-1.1 1.77-1.8 3.02-1.82.94-.02 1.82.63 2.42.63.59 0 1.7-.78 2.86-.66.49.02 1.86.2 2.74 1.49-.07.04-1.62.95-1.6 2.66Zm-2.35-5.05c.51-.62.85-1.48.75-2.34-.74.03-1.63.49-2.16 1.11-.47.55-.88 1.43-.77 2.27.83.06 1.67-.43 2.18-1.04Z"
      />
    </svg>
  );
}

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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [breweryName, setBreweryName] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const isForgot = view === "forgot";
  const isSignup = view === "signup";
  const title = isForgot ? "Reset password" : isSignup ? "Create account" : "Welcome back";
  const subtitle = isForgot
    ? "We’ll email you a secure reset link."
    : isSignup
      ? "Create your Operon workspace."
      : "Sign in to your Operon account.";
  const cta = isForgot ? "Send reset link" : isSignup ? "Create account" : "Sign In";

  const canSubmit = useMemo(
    () =>
      Boolean(
        email &&
          (isForgot || password) &&
          (!isSignup || (firstName.trim() && breweryName.trim()))
      ),
    [email, password, isForgot, isSignup, firstName, breweryName]
  );

  const submit = async () => {
    setBusy(true);
    setFormError(null);
    setNotice(null);
    try {
      if (view === "login") {
        await signIn(email, password);
      } else if (view === "signup") {
        const result = await signUp(email, password, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          breweryName: breweryName.trim(),
        });
        if (result.requiresEmailConfirmation) {
          setNotice("Account created. Check your email to confirm before logging in.");
        }
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
        <h1 className="auth-title">{title}</h1>
        <p className="screen-subtitle auth-subtitle">{subtitle}</p>

        {isSignup && (
          <>
            <label className="field-label auth-form-group">
              First name
              <span className="input-wrap input-wrap-plain auth-input">
                <input
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Lars"
                />
              </span>
            </label>
            <label className="field-label auth-form-group">
              Last name (optional)
              <span className="input-wrap input-wrap-plain auth-input">
                <input
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="M."
                />
              </span>
            </label>
            <label className="field-label auth-form-group">
              Brewery name
              <span className="input-wrap input-wrap-plain auth-input">
                <input
                  type="text"
                  autoComplete="organization"
                  value={breweryName}
                  onChange={(event) => setBreweryName(event.target.value)}
                  placeholder="Test Brewery"
                />
              </span>
            </label>
          </>
        )}

        <label className="field-label auth-form-group">
          Email
          <span className="input-wrap auth-input">
            <span aria-hidden="true" className="input-icon">
              @
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
          <label className="field-label auth-form-group">
            Password
            <span className="input-wrap auth-input">
              <span aria-hidden="true" className="input-icon">
                •
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

        <button type="button" className="gold-btn auth-primary-button auth-actions" onClick={submit} disabled={busy || !canSubmit}>
          {busy ? "Please wait…" : cta}
        </button>

        {view === "login" && (
          <>
            <div className="line-divider">or</div>
            <div className="auth-social-row">
              <button type="button" className="dark-btn auth-social-button auth-social-icon-button google" disabled aria-label="Continue with Google">
                <GoogleIcon />
              </button>
              <button type="button" className="dark-btn auth-social-button auth-social-icon-button apple" disabled aria-label="Continue with Apple">
                <AppleIcon />
              </button>
            </div>
            <button type="button" className="demo-card" onClick={() => void startDemo()} disabled={busy}>
              <strong className="demo-card-title">Explore Demo</strong>
              <span className="demo-card-subtitle">Try Operon with sample brewery data.</span>
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
