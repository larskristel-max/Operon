import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import operonLogo from "@/assets/operon-logo.svg";

export default function App() {
  const { session, breweryContext, isLoading, isDemoMode, enterDemoMode, exitDemoMode } = useApp();
  const { language, setLanguage } = useLanguage();

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
      </section>
    </main>
  );
}
