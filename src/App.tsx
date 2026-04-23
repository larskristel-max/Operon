import { useApp } from "@/context/AppContext";
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
        <p className="eyebrow">Operon • Demo</p>
        <h2>Demo mode</h2>
        <p>This environment is intentionally separated from real authenticated operations.</p>
        <div className="action-row">
          <button type="button" className="primary-btn" onClick={exitDemoMode}>
            Exit demo
          </button>
        </div>
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
