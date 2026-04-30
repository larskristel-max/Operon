import operonLogo from "../../../assets/Operonv1.png";
import tankImage from "../../../assets/Tankimageasset.png";
import { type TouchEvent, useMemo, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { type DashboardData } from "@/data/demoData";
import type { DemoDashboardMerged } from "@/domains/demo/types";
import { mapDemoDashboardToViewModel } from "@/ui/shell/demoDashboardMapper";
import { getDashboardCopy } from "@/ui/shell/dashboardI18n";
import { useDemoDashboard } from "@/ui/shell/useDemoDashboard";
import { useRealDashboard } from "@/hooks/useRealDashboard";
import { mapRealDashboardToMerged } from "@/domains/dashboard/mappers";
import { useBottomNavHeight } from "@/ui/shell/useBottomNavHeight";
import { useBrewEntryFlow } from "@/domains/batches/hooks";

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
          <path d="M9 4h6" />
          <path d="M9 4v2" />
          <path d="M15 4v2" />
          <path d="M8 6h8v9l-2.4 3h-3.2L8 15Z" />
          <circle cx="12" cy="11.8" r="2.1" />
          <path d="M12 10.6v2.4" />
          <path d="M10.8 11.8h2.4" />
          <path d="m10.6 18-1.2 2" />
          <path d="m13.4 18 1.2 2" />
        </svg>
      );
    case "water":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M12 4.5C9.5 7.4 7.3 10 7.3 13.1a4.7 4.7 0 0 0 9.4 0C16.7 10 14.5 7.4 12 4.5Z" />
          <path d="M10.1 13.9a2.2 2.2 0 0 0 2.1 1.5" />
        </svg>
      );
    case "orders":
    case "tasks":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <rect x="6.2" y="5.2" width="11.6" height="14.6" rx="2.2" />
          <path d="M9.2 3.8h5.6" />
          <path d="M9.4 10h5.2" />
          <path d="m9.4 13.7 1.2 1.2 2.1-2.1" />
          <path d="M9.4 17.2h5.2" />
        </svg>
      );
    case "inventory":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M8 6.6h8" />
          <path d="M6.8 9.4c0-2 2.3-3.6 5.2-3.6s5.2 1.6 5.2 3.6" />
          <path d="M6.8 14.6c0 2 2.3 3.6 5.2 3.6s5.2-1.6 5.2-3.6" />
          <path d="M6.8 9.4v5.2" />
          <path d="M17.2 9.4v5.2" />
          <path d="M8.8 11.3h6.4" />
          <path d="M8.8 13h6.4" />
        </svg>
      );
    case "fermentation":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M12 5.2v8.4" />
          <path d="M10.2 5.2h3.6" />
          <path d="M12 13.6a4.2 4.2 0 1 0 4.2 4.2A4.2 4.2 0 0 0 12 13.6Z" />
          <circle cx="12" cy="17.8" r="1.4" />
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
  quickActions: ["Brew", "Ferment", "Stock", "Reports"],
};

export function ProtectedShell({ onChangeLanguage }: { onChangeLanguage: () => void }) {
  useBottomNavHeight();
  const { language } = useLanguage();
  const { me, profileError, refreshProfile, session, isDemoMode, exitDemoMode, signOut } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaY = useRef(0);
  const touchDeltaX = useRef(0);
  const copy = getDashboardCopy(language);
  const firstName =
    me?.firstName?.split(" ")[0] ??
    me?.displayName?.split(" ")[0] ??
    me?.email?.split("@")[0] ??
    session?.user.email?.split("@")[0] ??
    copy.greetingBrewer;
  const greetingName = isDemoMode ? copy.greetingBrewer : firstName;
  const greeting = `${copy.greetingHello}, ${greetingName}!`;
  const { data: demoMergedData, loading: demoLoading, error: demoError, refetch: refetchDemoDashboard } = useDemoDashboard(isDemoMode);
  const { data: realDashboardData, refetch: refetchRealDashboard } = useRealDashboard(!isDemoMode);

  const realMergedData = useMemo<DemoDashboardMerged | null>(() => {
    if (!realDashboardData) return null;
    return mapRealDashboardToMerged(realDashboardData);
  }, [realDashboardData]);

  const existingRecipes = useMemo(() => {
    const recipes = isDemoMode ? demoMergedData?.recipes : realMergedData?.recipes;

    return (recipes ?? [])
      .map((recipe) => ({
        id: String((recipe as { id?: unknown }).id ?? ""),
        name: String((recipe as { name?: unknown }).name ?? "").trim(),
      }))
      .filter((recipe) => recipe.id && recipe.name);
  }, [isDemoMode, demoMergedData?.recipes, realMergedData?.recipes]);

  const brewEntryFlow = useBrewEntryFlow({
    isDemoMode,
    existingRecipes,
    onConfirmed: isDemoMode ? refetchDemoDashboard : refetchRealDashboard,
  });

  const selectedRecipeName =
    existingRecipes.find((recipe) => recipe.id === brewEntryFlow.state.selectedRecipeId)?.name ?? copy.brewEntrySelectedRecipePrefix;

  const dashboardData = useMemo<DashboardData>(() => {
    if (isDemoMode) {
      if (demoMergedData) {
        return mapDemoDashboardToViewModel(demoMergedData, copy);
      }

      return {
        ...defaultDashboardData,
        hero: {
          ...defaultDashboardData.hero,
          subtitle: demoLoading ? copy.heroSubtitleDemo : copy.heroSubtitleDefault,
          greetingName: copy.greetingBrewer,
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
    }

    if (realMergedData) {
      return mapDemoDashboardToViewModel(realMergedData, copy);
    }

    return {
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
  }, [copy, demoLoading, demoMergedData, firstName, isDemoMode, realMergedData]);

  const progressLabel = dashboardData.brewCard.progressPercent > 0 ? `${dashboardData.brewCard.progressPercent}%` : "—";
  const glanceIcons: IconName[] = ["tank", "water", "orders", "inventory"];
  const quickActionIcons: IconName[] = ["brew", "fermentation", "inventory", "reports"];
  const isPreparingRecipeDraft = brewEntryFlow.state.isBusy && brewEntryFlow.state.step === "ready-to-confirm" && !brewEntryFlow.state.draftPreview;

  const handleSheetTouchStart = (event: TouchEvent<HTMLButtonElement>) => {
    const touch = event.touches[0];
    touchStartY.current = touch.clientY;
    touchStartX.current = touch.clientX;
    touchDeltaY.current = 0;
    touchDeltaX.current = 0;
  };

  const handleSheetTouchMove = (event: TouchEvent<HTMLButtonElement>) => {
    if (touchStartY.current === null || touchStartX.current === null) return;
    const touch = event.touches[0];
    touchDeltaY.current = touch.clientY - touchStartY.current;
    touchDeltaX.current = touch.clientX - touchStartX.current;
  };

  const handleSheetTouchEnd = () => {
    const verticalDrag = touchDeltaY.current;
    const horizontalDrift = Math.abs(touchDeltaX.current);
    if (verticalDrag > 60 && verticalDrag > horizontalDrift) {
      brewEntryFlow.close();
    }
    touchStartY.current = null;
    touchStartX.current = null;
    touchDeltaY.current = 0;
    touchDeltaX.current = 0;
  };

  return (
    <main className="operon-screen dashboard-screen screen-content">
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
            <button
              key={label}
              type="button"
              className="quick-action"
              onClick={() => {
                if (index === 0) {
                  brewEntryFlow.open();
                }
              }}
            >
              <span className="quick-action-icon">
                <Icon name={quickActionIcons[Math.min(quickActionIcons.length - 1, index)]} className="line-icon icon-md" />
              </span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {brewEntryFlow.state.isOpen && (
        <section className="brew-entry-backdrop" onClick={brewEntryFlow.close} aria-label={copy.quickActionStartBrew}>
          <div className="glass-panel brew-entry-sheet" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="brew-entry-handle"
              aria-label={copy.brewEntryClose}
              onTouchStart={handleSheetTouchStart}
              onTouchMove={handleSheetTouchMove}
              onTouchEnd={handleSheetTouchEnd}
              onClick={brewEntryFlow.close}
            />
          {brewEntryFlow.state.step === "select-existing-recipe" && (
            <>
              <p className="eyebrow">{copy.brewEntrySelectExistingRecipe}</p>
              {brewEntryFlow.hasConnectedRecipes ? (
                <div className="brew-entry-actions">
                  {brewEntryFlow.existingRecipeOptions.map((recipe) => (
                    <button
                      key={recipe.id}
                      type="button"
                      className="dark-btn"
                      onClick={() => brewEntryFlow.chooseExistingRecipe(recipe.id)}
                    >
                      {recipe.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="subtle">{copy.brewEntryNoRecipesConnected}</p>
              )}
              <div className="brew-entry-secondary-actions">
                <button type="button" className="dark-btn ghost" onClick={brewEntryFlow.chooseUploadPath}>
                  {copy.brewEntryUploadRecipe}
                </button>
                <button type="button" className="dark-btn ghost" onClick={() => brewEntryFlow.chooseSource("new-recipe")}>
                  {copy.brewEntryNewRecipe}
                </button>
              </div>
            </>
          )}

          {brewEntryFlow.state.step === "upload-recipe" && (
            <>
              <p className="eyebrow">{copy.brewEntryUploadRecipe}</p>
              <p className="subtle">{copy.brewEntryUploadHelp}</p>
              <label className="brew-entry-file-input">
                <span>{copy.brewEntrySelectFile}</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.csv,.xls,.xlsx,.ods,.txt,.xml,.beerxml,.json"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    brewEntryFlow.setUploadFile(file);
                  }}
                />
              </label>
              {brewEntryFlow.state.upload.file && (
                <p className="subtle">
                  {brewEntryFlow.state.upload.file.name} · {Math.max(1, Math.round(brewEntryFlow.state.upload.file.size / 1024))} KB
                </p>
              )}
              <label className="brew-entry-textarea">
                <span>{copy.brewEntryManualPaste}</span>
                <textarea
                  value={brewEntryFlow.state.upload.manualText}
                  onChange={(event) => brewEntryFlow.setManualText(event.target.value)}
                  rows={4}
                />
              </label>
              <div className="brew-entry-footer">
                <button
                  type="button"
                  className="dark-btn"
                  onClick={() => void brewEntryFlow.prepareDraft()}
                  disabled={!brewEntryFlow.canPrepareDraft || brewEntryFlow.state.isBusy}
                >
                  {copy.brewEntryPrepareDraft}
                </button>
                <button type="button" className="dark-btn ghost" onClick={brewEntryFlow.back}>
                  {copy.brewEntryBack}
                </button>
              </div>
            </>
          )}

          {brewEntryFlow.state.step === "new-recipe-placeholder" && (
            <>
              <p className="eyebrow">{copy.brewEntryNewRecipe}</p>
              <p className="subtle">{copy.brewEntryNewRecipeComingSoon}</p>
              <div className="brew-entry-footer">
                <button type="button" className="dark-btn ghost" onClick={brewEntryFlow.back}>
                  {copy.brewEntryBack}
                </button>
                <button type="button" className="dark-btn ghost" onClick={brewEntryFlow.close}>
                  {copy.brewEntryClose}
                </button>
              </div>
            </>
          )}

          {brewEntryFlow.state.step === "ready-to-confirm" && (
            <>
              <p className="eyebrow">{copy.brewEntryReadyBoundary}</p>
              {!brewEntryFlow.state.draftPreview && isPreparingRecipeDraft ? (
                <div className="brew-entry-loading" role="status" aria-live="polite">
                  <span className="brew-entry-spinner" aria-hidden="true" />
                  <span>{copy.brewEntryPreparing}</span>
                </div>
              ) : (
                <>
                  <p className="subtle">{copy.brewEntryDraftReadyDescription}</p>
                  <p className="subtle">{copy.brewEntryConfirmationRequired}</p>
                  <p className="subtle">
                    {copy.brewEntryRecipeLabel}: {selectedRecipeName}
                  </p>
                </>
              )}

              {brewEntryFlow.state.error && <p className="error">{brewEntryFlow.state.error}</p>}

              <div className="brew-entry-footer">
                <button type="button" className="dark-btn ghost" onClick={brewEntryFlow.back}>
                  {copy.brewEntryBack}
                </button>
                <button type="button" className="dark-btn ghost" onClick={brewEntryFlow.close}>
                  {copy.brewEntryClose}
                </button>
                {brewEntryFlow.state.draftPreview && (
                  <button
                    type="button"
                    className="dark-btn"
                    onClick={() => void brewEntryFlow.confirmDraft()}
                    disabled={brewEntryFlow.state.isConfirming}
                  >
                    {copy.brewEntryConfirm}
                  </button>
                )}
              </div>
            </>
          )}

          {brewEntryFlow.state.step === "confirming" && <p className="subtle">{copy.brewEntryConfirm}</p>}

          {brewEntryFlow.state.step === "confirmed" && (
            <>
              <p className="eyebrow">{copy.brewEntryCreatedTitle}</p>
              <p className="subtle">{copy.brewEntryCreatedDescription}</p>
              <div className="brew-entry-footer">
                <button type="button" className="dark-btn" onClick={brewEntryFlow.close}>
                  {copy.brewEntryClose}
                </button>
              </div>
            </>
          )}

          {brewEntryFlow.state.error && brewEntryFlow.state.step !== "ready-to-confirm" && (
            <p className="error">{brewEntryFlow.state.error}</p>
          )}
          </div>
        </section>
      )}

      {!isDemoMode && profileError && (
        <section className="glass-panel status-inline">
          <p className="error">{profileError}</p>
          <button type="button" className="dark-btn" onClick={() => void refreshProfile()}>
            {copy.retryProfileLoad}
          </button>
        </section>
      )}

      {isDemoMode && demoError && !demoLoading && (
        <section className="glass-panel status-inline">
          <p className="error">{demoError}</p>
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
                void exitDemoMode();
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
