import operonLogo from "../../../assets/Operonv1.png";
import tankImage from "../../../assets/Tankimageasset.png";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { demoDashboardData, type DashboardData } from "@/data/demoData";
import { getDashboardCopy } from "@/ui/shell/dashboardI18n";

type IconName =
  | "bell"
  | "brew"
  | "tank"
  | "water"
  | "orders"
  | "inventory"
  | "fermentation"
  | "reports"
  | "home"
  | "tasks"
  | "more";

function Icon({ name, className }: { name: IconName; className?: string }) {
  switch (name) {
    case "bell":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M8 18h8M10.5 21h3M6 17.5h12l-1.8-2.2V10a4.2 4.2 0 1 0-8.4 0v5.3L6 17.5Z" />
        </svg>
      );
    case "brew":
    case "tank":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M8 4h8v2H8zM7.5 6h9v10.2l-1.9 2.8h-5.2l-1.9-2.8zM9.8 14h4.4M12 9.2v6.8" />
        </svg>
      );
    case "water":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M12 4s-4.5 5-4.5 8.3A4.5 4.5 0 0 0 12 16.8a4.5 4.5 0 0 0 4.5-4.5C16.5 9 12 4 12 4Z" />
        </svg>
      );
    case "orders":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M8 5h8M7 7h10v12H7zM10 11h4M10 14h4M10 17h2" />
        </svg>
      );
    case "inventory":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M7 9h10l-1 9H8zm1-3h8v3H8zM12 12v3" />
        </svg>
      );
    case "fermentation":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M12 5v8m0 0a3 3 0 1 1-3 3 3 3 0 0 1 3-3Zm0 0a3 3 0 1 0 3 3 3 3 0 0 0-3-3ZM10 5h4" />
        </svg>
      );
    case "reports":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M7 16v3M12 12v7M17 8v11" />
        </svg>
      );
    case "home":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="m4 11.5 8-6.5 8 6.5M7.2 10.2V19h9.6v-8.8" />
        </svg>
      );
    case "tasks":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M8 5h8M7 7h10v12H7zM10 11h4M10 14h4M10 17h2" />
        </svg>
      );
    case "more":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M6.5 12h.01M12 12h.01M17.5 12h.01" />
        </svg>
      );
    default:
      return null;
  }
}

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
  const glanceIcons: IconName[] = ["tank", "water", "orders", "inventory"];
  const quickActionIcons: IconName[] = ["brew", "fermentation", "inventory", "reports"];

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
            <Icon name="bell" className="line-icon icon-lg" />
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
            <div className="brew-icon">
              <Icon name="brew" className="line-icon icon-xl gold-icon" />
            </div>
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
          {dashboardData.glanceCards.map((card, index) => (
            <article key={card.title} className={`glance-card ${card.accent}`}>
              <div className="glance-icon">
                <Icon name={glanceIcons[Math.min(glanceIcons.length - 1, index)]} className="line-icon icon-md" />
              </div>
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
          {dashboardData.quickActions.map((label, index) => (
            <button key={label} type="button" className="quick-action">
              <span className="qa-icon">
                <Icon name={quickActionIcons[Math.min(quickActionIcons.length - 1, index)]} className="line-icon icon-md" />
              </span>
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
          <span className="nav-icon">
            <Icon name="home" className="line-icon icon-md" />
          </span>
          <span>{copy.navHome}</span>
        </button>
        <button type="button">
          <span className="nav-icon">
            <Icon name="brew" className="line-icon icon-md" />
          </span>
          <span>{copy.navBrewery}</span>
        </button>
        <button type="button">
          <span className="nav-icon">
            <Icon name="tasks" className="line-icon icon-md" />
          </span>
          <span>{copy.navTasks}</span>
        </button>
        <button type="button" onClick={() => setMoreOpen((prev) => !prev)} aria-expanded={moreOpen}>
          <span className="nav-icon">
            <Icon name="more" className="line-icon icon-md" />
          </span>
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
