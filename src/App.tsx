import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import operonLogo from "@/assets/operon-logo.svg";
import { AuthGate } from "@/ui/auth/AuthGate";
import { ProtectedShell } from "@/ui/shell/ProtectedShell";

function BootScreen() {
  return (
    <main className="boot-screen">
      <p className="eyebrow">Operon</p>
      <h1>Restoring secure session…</h1>
    </main>
  );
}

function DemoShell() {
  const { exitDemoMode } = useApp();
  return (
    <main className="app-shell">
      <section className="auth-card">
        <img className="brand-logo" src={operonLogo} alt="Operon logo" />
        <div className="heading-wrap">
          <h1>Operon Core Foundation</h1>
          <p>Auth and data layers are wired for Supabase + Cloudflare semantic endpoints.</p>
        </div>

        <div className="status-grid">
          <p>
            Session: <strong>{session ? "authenticated" : "not authenticated"}</strong>
          </p>
          <p>
            Brewery: <strong>{breweryContext?.name ?? "not resolved"}</strong>
          </p>
          <p>
            Language: <strong>{language}</strong>
          </p>
        </div>

        <div className="action-row">
          <button type="button" className="secondary-btn" onClick={() => setLanguage("en")}>
            EN
          </button>
          <button type="button" className="secondary-btn" onClick={() => setLanguage("fr")}>
            FR
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={() => (isDemoMode ? exitDemoMode() : enterDemoMode())}
          >
            {isDemoMode ? "Exit demo mode" : "Enter demo mode"}
          </button>
        </div>

        {isLoading && <p className="loading-text">Loading session…</p>}
      <header>
        <p className="eyebrow">Operon • Demo</p>
        <button onClick={exitDemoMode}>Exit demo</button>
      </header>
      <section className="panel">
        <h1>Demo mode</h1>
        <p>This environment is intentionally separated from real authenticated operations.</p>
      </section>
    </main>
  );
}

export default function App() {
  const { authStatus, isDemoMode } = useApp();

  if (authStatus === "booting") return <BootScreen />;
  if (isDemoMode && authStatus !== "authenticated") return <DemoShell />;
  if (authStatus === "unauthenticated") return <AuthGate />;
  return <ProtectedShell />;
}
