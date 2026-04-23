import { useApp } from "@/context/AppContext";
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
