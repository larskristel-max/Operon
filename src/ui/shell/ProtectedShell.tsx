import operonLogo from "../../../assets/Operonv1.png";
import tankImage from "../../../assets/Tankimageasset.png";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { demoDashboardData, type DashboardData } from "@/data/demoData";
import { getDashboardCopy } from "@/ui/shell/dashboardI18n";

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
  const { language } = useLanguage();
  const { me, profileError, refreshProfile, session, isDemoMode, exitDemoMode, signOut } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);
  const copy = getDashboardCopy(language);
  const firstName =
    me?.firstName?.split(" ")[0] ??
    me?.displayName?.split(" ")[0] ??
    me?.email?.split("@")[0] ??
    session?.user.email?.split("@")[0] ??
    copy.greetingBrewer;
  const greetingName = isDemoMode ? copy.greetingBrewer : firstName;
  const greeting = `${copy.greetingHello}, ${greetingName}!`;

  const dashboardData = isDemoMode
    ? {
        ...demoDashboardData,
        hero: {
          ...demoDashboardData.hero,
          greetingName: copy.greetingBrewer,
          subtitle: copy.heroSubtitleDemo,
        },
        brewCard: {
          ...demoDashboardData.brewCard,
          batchId: `${copy.batchIdPrefix}${demoDashboardData.brewCard.batchId}`,
          batchStageLabel: copy.inFermentation,
        },
        glanceCards: [
          { title: copy.tanks, subtitle: copy.active, accent: "green", value: demoDashboardData.glanceCards[0]?.value ?? "—" },
          {
            title: copy.waterUsage,
            subtitle: copy.today,
            accent: "blue",
            value: demoDashboardData.glanceCards[1]?.value ?? "—",
          },
          {
            title: copy.orders,
            subtitle: copy.toFulfill,
            accent: "purple",
            value: demoDashboardData.glanceCards[2]?.value ?? "—",
          },
          {
            title: copy.inventory,
            subtitle: copy.lowStock,
            accent: "amber",
            value: demoDashboardData.glanceCards[3]?.value ?? "—",
          },
        ],
        quickActions: [
          copy.quickActionStartBrew,
          copy.quickActionLogFermentation,
          copy.quickActionAddInventory,
          copy.quickActionViewReports,
        ],
      }
      : {
        ...defaultDashboardData,
        hero: {
          ...defaultDashboardData.hero,
          subtitle: copy.heroSubtitleDefault,
          greetingName: firstName,
        },
        brewCard: {
          ...defaultDashboardData.brewCard,
          batchStageLabel: copy.waitingForData,
        },
        glanceCards: [
          { title: copy.tanks, subtitle: copy.active, accent: "green", value: "—" },
          { title: copy.waterUsage, subtitle: copy.today, accent: "blue", value: "—" },
          { title: copy.orders, subtitle: copy.toFulfill, accent: "purple", value: "—" },
          { title: copy.inventory, subtitle: copy.lowStock, accent: "amber", value: "—" },
        ],
        quickActions: [
          copy.quickActionStartBrew,
          copy.quickActionLogFermentation,
          copy.quickActionAddInventory,
          copy.quickActionViewReports,
        ],
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
          <h1>{greeting}</h1>
          <p>{dashboardData.hero.subtitle}</p>
        </div>
      </section>

      <section className="glass-panel brewing-card">
        <div className="brewing-top">
          <div className="brew-main">
            <div className="brew-icon">⛃</div>
            <div>
              <p className="eyebrow gold">{copy.currentlyBrewing}</p>
              <h2>{dashboardData.brewCard.batchName}</h2>
              <p className="subtle">{dashboardData.brewCard.batchId}</p>
            </div>
          </div>
          <div className="brew-side">
            <strong>{dashboardData.brewCard.stageCount}</strong>
            <small>{copy.days}</small>
            <span>{dashboardData.brewCard.batchStageLabel}</span>
          </div>
        </div>
        <div className="brew-divider" />
        <div className="fermentation-row">
          <p>{copy.fermentationProgress}</p>
          <span>{progressLabel}</span>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${dashboardData.brewCard.progressPercent}%` }} />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-head">
          <h3>{copy.atAGlance}</h3>
          <button type="button">{copy.viewAll}</button>
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
        <h3>{copy.quickActions}</h3>
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
            {copy.retryProfileLoad}
          </button>
        </section>
      )}

      <nav className="bottom-nav" aria-label="Primary">
        <button type="button" className="active">
          <span className="nav-icon">⌂</span>
          <span>{copy.navHome}</span>
        </button>
        <button type="button">
          <span className="nav-icon">⛃</span>
          <span>{copy.navBrewery}</span>
        </button>
        <button type="button">
          <span className="nav-icon">☑</span>
          <span>{copy.navTasks}</span>
        </button>
        <button type="button" onClick={() => setMoreOpen((prev) => !prev)} aria-expanded={moreOpen}>
          <span className="nav-icon">•••</span>
          <span>{copy.navMore}</span>
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
              {copy.exitDemoMode}
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
              {copy.signOut}
            </button>
          )}
        </section>
      )}
    </main>
  );
}
