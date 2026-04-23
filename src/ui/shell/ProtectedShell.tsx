import operonLogo from "../../../assets/Operonv1.png";
import tankImage from "../../../assets/Tankimageasset.png";
import { useApp } from "@/context/AppContext";

const atGlanceCards = [
  { title: "Tanks", subtitle: "Active", accent: "green", value: "—" },
  { title: "Water Usage", subtitle: "Today", accent: "blue", value: "—" },
  { title: "Orders", subtitle: "To Fulfill", accent: "purple", value: "—" },
  { title: "Inventory", subtitle: "Low Stock", accent: "amber", value: "—" },
];

const quickActions = ["Start Brew", "Log Fermentation", "Add Inventory", "View Reports"];

export function ProtectedShell() {
  const { me, signOut, authStatus, profileError, refreshProfile, session } = useApp();
  const firstName =
    me?.displayName?.split(" ")[0] ??
    me?.email?.split("@")[0] ??
    session?.user.email?.split("@")[0] ??
    "Brewer";

  return (
    <main className="operon-screen dashboard-screen">
      <section className="dashboard-hero">
        <img src={tankImage} alt="Brewery tanks" className="hero-bg" />
        <div className="hero-overlay" />
        <header className="hero-top">
          <div className="logo-lockup">
            <img src={operonLogo} alt="Operon logo" className="operon-mark small" />
            <span>OPERON</span>
          </div>
          <button type="button" className="icon-pill" aria-label="Notifications">
            🔔
          </button>
        </header>
        <div className="hero-copy">
          <h1>Good Morning, {firstName}</h1>
          <p>Here&apos;s what&apos;s brewing today.</p>
        </div>
      </section>

      <section className="glass-panel brewing-card">
        <div className="brew-main">
          <div className="brew-icon">⟐</div>
          <div>
            <p className="eyebrow gold">CURRENTLY BREWING</p>
            <h2>No active batch selected</h2>
            <p className="subtle">Batch details will appear here.</p>
          </div>
        </div>
        <div className="brew-side">
          <strong>—</strong>
          <span>In Fermentation</span>
        </div>
        <div className="fermentation-row">
          <p>FERMENTATION PROGRESS</p>
          <span>—</span>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: "0%" }} />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-head">
          <h3>At a Glance</h3>
          <button type="button">View All</button>
        </div>
        <div className="glance-grid">
          {atGlanceCards.map((card) => (
            <article key={card.title} className={`glance-card ${card.accent}`}>
              <p className="eyebrow">{card.title}</p>
              <strong>{card.value}</strong>
              <span>{card.subtitle}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          {quickActions.map((label) => (
            <button key={label} type="button" className="quick-action">
              <span className="qa-icon">●</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {profileError && (
        <section className="glass-panel status-inline">
          <p className="error">{profileError}</p>
          <button type="button" className="dark-btn" onClick={() => void refreshProfile()}>
            Retry profile load
          </button>
        </section>
      )}

      <nav className="bottom-nav" aria-label="Primary">
        <button type="button" className="active">Home</button>
        <button type="button">Brewery</button>
        <button type="button">Tasks</button>
        <button type="button" onClick={() => void signOut()}>
          {authStatus === "refreshing" ? "Refreshing" : "More"}
        </button>
      </nav>
    </main>
  );
}
