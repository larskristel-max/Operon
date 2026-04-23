import operonLogo from "../../../assets/Operonv1.png";
import tankImage from "../../../assets/Tankimageasset.png";
import { useApp } from "@/context/AppContext";
import { demoDashboardData, type DashboardData } from "@/data/demoData";

const defaultDashboardData: DashboardData = {
  breweryName: "OPERON",
  hero: {
    greetingName: "Brewer",
    subtitle: "Here's what's brewing today.",
  },
  brewCard: {
    batchName: "No active batch selected",
    batchStageLabel: "In Fermentation",
    stageCount: "—",
    progressLabel: "Awaiting brew execution",
    progressPercent: 0,
  },
  glanceCards: [
    { title: "Tanks", subtitle: "Active", accent: "green", value: "—" },
    { title: "Water Usage", subtitle: "Today", accent: "blue", value: "—" },
    { title: "Orders", subtitle: "To Fulfill", accent: "purple", value: "—" },
    { title: "Inventory", subtitle: "Low Stock", accent: "amber", value: "—" },
  ],
  quickActions: ["Start Brew", "Log Fermentation", "Add Inventory", "View Reports"],
  tasks: [
    { id: "task-empty-1", title: "No pending tasks", detail: "Task updates appear here during operations." },
  ],
  agenda: [
    { id: "agenda-empty-1", time: "—", title: "No upcoming events" },
  ],
  lowStock: [
    { id: "stock-empty-1", name: "No low stock alerts", level: "Inventory alerts will appear here." },
  ],
};

export function ProtectedShell() {
  const { me, signOut, authStatus, profileError, refreshProfile, session, isDemoMode, exitDemoMode } = useApp();
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

  return (
    <main className="operon-screen dashboard-screen">
      <section className="dashboard-hero">
        <img src={tankImage} alt="Brewery tanks" className="hero-bg" />
        <div className="hero-overlay" />
        <header className="hero-top">
          <div className="logo-lockup">
            <img src={operonLogo} alt="Operon logo" className="operon-mark small" />
            <span>{dashboardData.breweryName}</span>
            {isDemoMode && <span className="demo-pill">Demo</span>}
          </div>
          <button type="button" className="icon-pill" aria-label="Notifications">
            🔔
          </button>
        </header>
        <div className="hero-copy">
          <h1>Good Morning, {dashboardData.hero.greetingName}</h1>
          <p>{dashboardData.hero.subtitle}</p>
        </div>
      </section>

      <section className="glass-panel brewing-card">
        <div className="brew-main">
          <div className="brew-icon">⟐</div>
          <div>
            <p className="eyebrow gold">CURRENTLY BREWING</p>
            <h2>{dashboardData.brewCard.batchName}</h2>
            <p className="subtle">{dashboardData.brewCard.progressLabel}</p>
          </div>
        </div>
        <div className="brew-side">
          <strong>{dashboardData.brewCard.stageCount}</strong>
          <span>{dashboardData.brewCard.batchStageLabel}</span>
        </div>
        <div className="fermentation-row">
          <p>FERMENTATION PROGRESS</p>
          <span>{dashboardData.brewCard.progressPercent}%</span>
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
          {dashboardData.quickActions.map((label) => (
            <button key={label} type="button" className="quick-action">
              <span className="qa-icon">●</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="dashboard-section mini-grid">
        <article className="glass-panel mini-card">
          <div className="section-head compact">
            <h3>Tasks</h3>
            <button type="button">See more</button>
          </div>
          <ul className="mini-list">
            {dashboardData.tasks.map((task) => (
              <li key={task.id}>
                <strong>{task.title}</strong>
                <span>{task.detail}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="glass-panel mini-card">
          <div className="section-head compact">
            <h3>Agenda</h3>
            <button type="button">See more</button>
          </div>
          <ul className="mini-list">
            {dashboardData.agenda.map((item) => (
              <li key={item.id}>
                <strong>{item.time}</strong>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="glass-panel mini-card">
          <div className="section-head compact">
            <h3>Inventory</h3>
            <button type="button">See more</button>
          </div>
          <ul className="mini-list">
            {dashboardData.lowStock.map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong>
                <span>{item.level}</span>
              </li>
            ))}
          </ul>
        </article>
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
        <button type="button" className="active">Home</button>
        <button type="button">Brewery</button>
        <button type="button">Tasks</button>
        {isDemoMode ? (
          <button type="button" onClick={exitDemoMode}>Exit Demo</button>
        ) : (
          <button type="button" onClick={() => void signOut()}>
            {authStatus === "refreshing" ? "Refreshing" : "More"}
          </button>
        )}
      </nav>
    </main>
  );
}
