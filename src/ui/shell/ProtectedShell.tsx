import { useApp } from "@/context/AppContext";

export function ProtectedShell() {
  const { me, signOut, authStatus, profileError, refreshProfile, session } = useApp();

  return (
    <main className="app-shell">
      <header>
        <p className="eyebrow">Operon • Let&apos;s Brew</p>
        <button onClick={() => void signOut()}>Sign out</button>
      </header>

      <section className="panel">
        <h1>Operations workspace</h1>
        <p>Authenticated and connected to protected APIs.</p>
        <p>User: {me?.displayName ?? me?.email ?? session?.user.email ?? "Unknown"}</p>
        {authStatus === "refreshing" && <p className="subtle">Refreshing session…</p>}
        {profileError && (
          <div>
            <p className="error">{profileError}</p>
            <button onClick={() => void refreshProfile()}>Retry profile load</button>
          </div>
        )}
      </section>
    </main>
  );
}
