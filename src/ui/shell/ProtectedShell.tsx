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
          <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
          <path d="M9 17a3 3 0 0 0 6 0" />
        </svg>
      );
    case "brew":
    case "tank":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M9 4h6v2H9z" />
          <path d="M8 6h8v9.5L13.5 19h-3L8 15.5Z" />
          <circle cx="12" cy="12" r="2.1" />
          <path d="M12 10.7v2.6M10.7 12h2.6" />
          <path d="m10.4 19-1.4 2M13.6 19l1.4 2" />
        </svg>
      );
    case "water":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M12 4.5s-5 5.4-5 8.9a5 5 0 0 0 10 0c0-3.5-5-8.9-5-8.9Z" />
          <path d="M10 14.2a2.3 2.3 0 0 0 2.2 1.6" />
        </svg>
      );
    case "orders":
    case "tasks":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <rect x="6" y="5.5" width="12" height="15" rx="2" />
          <path d="M9.5 3.5h5" />
          <path d="M9.5 10.5h5" />
          <path d="m9.5 14.5 1.1 1.1 2.1-2.1" />
          <path d="M9.5 18h5" />
        </svg>
      );
    case "inventory":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M8.5 5.5h7" />
          <path d="M7 9c0-1.9 2.2-3.5 5-3.5s5 1.6 5 3.5" />
          <path d="M7 15c0 1.9 2.2 3.5 5 3.5s5-1.6 5-3.5" />
          <path d="M7 9v6" />
          <path d="M17 9v6" />
          <path d="M9 11h6" />
          <path d="M9 13h6" />
          <path d="M12 11.2v1.6" />
        </svg>
      );
    case "fermentation":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M12 5v9" />
          <path d="M10 5h4" />
          <path d="M12 14a3.8 3.8 0 1 0 3.8 3.8A3.8 3.8 0 0 0 12 14Z" />
          <circle cx="12" cy="17.8" r="1.5" />
        </svg>
      );
    case "reports":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M5 19h14" />
          <path d="M8 16v-4" />
          <path d="M12 16V9" />
          <path d="M16 16v-7" />
        </svg>
      );
    case "home":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="m3.5 10 8.5-6.5 8.5 6.5" />
          <path d="M6.5 9.4V20h11V9.4" />
        </svg>
      );
    case "more":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <circle cx="6" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="18" cy="12" r="1" />
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
  quickActions: ["Start Brew", "Fermentation", "Add Inventory", "View Reports"],
};

export function ProtectedShell({ onChangeLanguage }: { onChangeLanguage: () => void }) {
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

      <section className="dashboard-section quick-actions">
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
          <button
            type="button"
            className="dark-btn more-action"
            onClick={() => {
              onChangeLanguage();
              setMoreOpen(false);
            }}
          >
            {copy.changeLanguage}
          </button>

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
