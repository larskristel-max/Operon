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
              <button type="button" className="dark-btn auth-social-button auth-social-icon-button" disabled aria-label="Continue with Google">
                <span aria-hidden="true">G</span>
              </button>
              <button type="button" className="dark-btn auth-social-button auth-social-icon-button" disabled aria-label="Continue with Apple">
                <span aria-hidden="true"></span>
              </button>
            </div>
            <button type="button" className="demo-card" onClick={() => void startDemo()} disabled={busy}>
              <div>
                <strong className="demo-card-title">Explore Demo</strong>
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
