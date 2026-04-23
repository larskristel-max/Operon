import operonLogo from "../../../assets/Operonv1.png";
import tankImage from "../../../assets/Tankimageasset.png";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { demoDashboardData, type DashboardData } from "@/data/demoData";

const defaultDashboardData: DashboardData = {
  breweryName: "OPERON",
  hero: {
    greetingName: "Brewer",
    subtitle: "Connect live brewery data to populate this dashboard.",
  },
  brewCard: {
    batchName: "No active batch",
    batchId: "Live operations data pending",
    batchStageLabel: "Waiting for data",
    stageCount: "—",
    progressPercent: 0,
  },
  glanceCards: [
    { title: "TANKS", subtitle: "Active", accent: "green", value: "—" },
    { title: "WATER USAGE", subtitle: "Today", accent: "blue", value: "—" },
    { title: "ORDERS", subtitle: "To Fulfill", accent: "purple", value: "—" },
    { title: "INVENTORY", subtitle: "Low Stock", accent: "amber", value: "—" },
  ],
  quickActions: ["Start Brew", "Log Fermentation", "Add Inventory", "View Reports"],
};

export function ProtectedShell() {
  const { me, profileError, refreshProfile, session, isDemoMode, exitDemoMode, signOut } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);
  const firstName =
    me?.displayName?.split(" ")[0] ??
    me?.email?.split("@")[0] ??
    session?.user.email?.split("@")[0] ??
    defaultDashboardData.hero.greetingName;

  const dashboardData = isDemoMode
    ? demoDashboardData
    : {
        ...defaultDashboardData,
        hero: {
          ...defaultDashboardData.hero,
          greetingName: firstName,
        },
      };
  const progressLabel = isDemoMode ? `${dashboardData.brewCard.progressPercent}%` : "—";

  return (
    <main className="operon-screen dashboard-screen">
      <section className="dashboard-hero">
        <img src={tankImage} alt="Brewery tanks" className="hero-bg" />
        <div className="hero-overlay" />
        <header className="hero-top">
          <div className="logo-lockup">
            <img src={operonLogo} alt="Operon logo" className="operon-mark small" />
            <span>{dashboardData.breweryName}</span>
          </div>
          <button type="button" className="icon-pill bell-btn" aria-label="Notifications">
            <span aria-hidden="true">◠</span>
          </button>
        </header>
        <div className="hero-copy">
          <h1>Good Morning, {dashboardData.hero.greetingName}</h1>
          <p>{dashboardData.hero.subtitle}</p>
        </div>
      </section>

      <section className="glass-panel brewing-card">
        <div className="brewing-top">
          <div className="brew-main">
            <div className="brew-icon">⛃</div>
            <div>
              <p className="eyebrow gold">CURRENTLY BREWING</p>
              <h2>{dashboardData.brewCard.batchName}</h2>
              <p className="subtle">{dashboardData.brewCard.batchId}</p>
            </div>
          </div>
          <div className="brew-side">
            <strong>{dashboardData.brewCard.stageCount}</strong>
            <small>DAYS</small>
            <span>{dashboardData.brewCard.batchStageLabel}</span>
          </div>
        </div>
        <div className="brew-divider" />
        <div className="fermentation-row">
          <p>FERMENTATION PROGRESS</p>
          <span>{progressLabel}</span>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${dashboardData.brewCard.progressPercent}%` }} />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-head">
          <h3>At a Glance</h3>
          <button type="button">View All</button>
        </div>
        <div className="glance-grid">
          {dashboardData.glanceCards.map((card) => (
            <article key={card.title} className={`glance-card ${card.accent}`}>
              <div className="glance-icon" />
              <div className="glance-copy">
                <p className="eyebrow">{card.title}</p>
                <strong>{card.value}</strong>
                <span>{card.subtitle}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          {dashboardData.quickActions.map((label) => (
            <button key={label} type="button" className="quick-action">
              <span className="qa-icon">●</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {!isDemoMode && profileError && (
        <section className="glass-panel status-inline">
          <p className="error">{profileError}</p>
          <button type="button" className="dark-btn" onClick={() => void refreshProfile()}>
            Retry profile load
          </button>
        </section>
      )}

      <nav className="bottom-nav" aria-label="Primary">
        <button type="button" className="active">
          <span className="nav-icon">⌂</span>
          <span>Home</span>
        </button>
        <button type="button">
          <span className="nav-icon">⛃</span>
          <span>Brewery</span>
        </button>
        <button type="button">
          <span className="nav-icon">☑</span>
          <span>Tasks</span>
        </button>
        <button type="button" onClick={() => setMoreOpen((prev) => !prev)} aria-expanded={moreOpen}>
          <span className="nav-icon">•••</span>
          <span>More</span>
        </button>
      </nav>

      {moreOpen && (
        <section className="glass-panel more-menu" aria-label="More options">
          {isDemoMode ? (
            <button
              type="button"
              className="dark-btn more-action"
              onClick={() => {
                exitDemoMode();
                setMoreOpen(false);
              }}
            >
              Exit Demo Mode
            </button>
          ) : (
            <button
              type="button"
              className="dark-btn more-action"
              onClick={() => {
                void signOut();
                setMoreOpen(false);
              }}
            >
              Sign Out
            </button>
          )}
        </section>
      )}
    </main>
  );
}
