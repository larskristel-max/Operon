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
import { computeOperationalSummary } from "@/domains/dashboard/operational";
import { useAssignTank } from "@/domains/tanks/hooks";
import { useRecordMashVolume, useRecordTransferVolume } from "@/domains/brew_logs/hooks";
import { useAssignIngredientLots } from "@/domains/batch_inputs/hooks";
import { useTakeGravityReading } from "@/domains/fermentation_checks/hooks";
import { useCreateOutputLot } from "@/domains/lots/hooks";

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
  | "more"
  | "plus"
  | "package";

function isBrewInputIngredient(ingredient: Record<string, unknown>): boolean {
  const type = typeof ingredient.ingredient_type === "string" ? ingredient.ingredient_type.trim().toLowerCase() : "";
  return ["malt", "hops", "yeast", "adjunct", "sugar", "water_additive", "processing_aid"].includes(type);
}

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
    case "plus":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
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
    case "package":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="M3.27 6.96 12 12.01 20.73 6.96" />
          <path d="M12 22.08V12" />
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
  const [tasksOpen, setTasksOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [selectedTankId, setSelectedTankId] = useState<string>("");
  const [mashVolumeInput, setMashVolumeInput] = useState<string>("");
  const [transferVolumeInput, setTransferVolumeInput] = useState<string>("");
  const [ingredientIdInput, setIngredientIdInput] = useState<string>("");
  const [ingredientQuantityInput, setIngredientQuantityInput] = useState<string>("");
  const [ingredientUnitInput, setIngredientUnitInput] = useState<string>("");
  const [gravityInput, setGravityInput] = useState<string>("");
  const [tempInput, setTempInput] = useState<string>("");
  const [lotNumberInput, setLotNumberInput] = useState<string>("");
  const [lotVolumeInput, setLotVolumeInput] = useState<string>("");
  const [lotUnitsInput, setLotUnitsInput] = useState<string>("");
  const [taskError, setTaskError] = useState<string | null>(null);
  const [taskBusy, setTaskBusy] = useState(false);
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
      .map((r) => {
        const rec = r as Record<string, unknown>;
        const rawVolume = rec.postboilVolumeL ?? rec.target_post_boil_volume_liters ?? rec.default_batch_size_liters ?? null;
        const rawOg = rec.targetOg ?? rec.target_og ?? null;
        const rawYeast = rec.default_yeast_notes ?? null;
        return {
          id: String(rec.id ?? ""),
          name: String(rec.name ?? "").trim(),
          volumeL: rawVolume != null ? Number(rawVolume) : null,
          targetOg: rawOg != null ? Number(rawOg) : null,
          yeast: rawYeast != null && String(rawYeast).trim() ? String(rawYeast).trim() : null,
        };
      })
      .filter((recipe) => recipe.id && recipe.name);
  }, [isDemoMode, demoMergedData?.recipes, realMergedData?.recipes]);

  const brewEntryFlow = useBrewEntryFlow({
    isDemoMode,
    existingRecipes,
    onConfirmed: isDemoMode ? refetchDemoDashboard : refetchRealDashboard,
  });
  const assignTank = useAssignTank({ isDemoMode });
  const activeBreweryId = useMemo(() => {
    const data = isDemoMode ? demoMergedData : realMergedData;
    const firstBatch = (data?.batches?.[0] ?? null) as Record<string, unknown> | null;
    const raw = firstBatch?.brewery_id;
    return typeof raw === "string" && raw.length > 0 ? raw : null;
  }, [demoMergedData, isDemoMode, realMergedData]);
  const recordMashVolume = useRecordMashVolume({ isDemoMode, breweryId: activeBreweryId ?? null });
  const recordTransferVolume = useRecordTransferVolume({ isDemoMode, breweryId: activeBreweryId ?? null });
  const assignIngredientLots = useAssignIngredientLots({ isDemoMode, breweryId: activeBreweryId ?? null });
  const currentBrewLogs = useMemo(
    () => ((isDemoMode ? demoMergedData : realMergedData)?.brew_logs ?? []) as Array<Record<string, unknown>>,
    [isDemoMode, demoMergedData, realMergedData]
  );
  const takeGravityReading = useTakeGravityReading({ isDemoMode, breweryId: activeBreweryId ?? null, brewLogs: currentBrewLogs });
  const createOutputLot = useCreateOutputLot({ isDemoMode, breweryId: activeBreweryId ?? null });

  const selectedRecipe = existingRecipes.find((recipe) => recipe.id === brewEntryFlow.state.selectedRecipeId) ?? null;
  const selectedRecipeName = selectedRecipe?.name ?? copy.brewEntrySelectedRecipePrefix;

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


  const operational = useMemo(() => {
    const merged = isDemoMode ? demoMergedData : realMergedData;
    if (!merged) return { activeBatchCount: 0, openTaskCount: 0, openTasks: [] };
    if (merged.operational) return merged.operational;

    return computeOperationalSummary({
      batches: merged.batches,
      tanks: merged.tanks,
      tasks: merged.tasks,
      lots: merged.lots,
      batchInputs: merged.batch_inputs ?? [],
      brewLogs: merged.brew_logs ?? [],
      fermentationChecks: merged.fermentation_checks ?? [],
    });
  }, [demoMergedData, isDemoMode, realMergedData]);

  const progressLabel = dashboardData.brewCard.progressPercent > 0 ? `${dashboardData.brewCard.progressPercent}%` : null;
  const isPlaceholderValue = (value: string | number | null | undefined): boolean => {
    const text = String(value ?? "").trim();
    return text === "" || ["-", "–", "—"].includes(text);
  };
  const stageCountValue = String(dashboardData.brewCard.stageCount ?? "").trim();
  const brewDayLabel = !isPlaceholderValue(stageCountValue) ? `${copy.days} ${stageCountValue}` : null;
  const batchStageValue = String(dashboardData.brewCard.batchStageLabel ?? "").trim();
  const brewStatusLabel = !isPlaceholderValue(batchStageValue) ? batchStageValue : copy.waitingForData;
  const glanceIcons: IconName[] = ["tank", "water", "package", "inventory"];
  const quickActionIcons: IconName[] = ["brew", "fermentation", "inventory", "reports"];
  const merged = isDemoMode ? demoMergedData : realMergedData;
  const availableTanks = ((merged?.tanks ?? []) as Array<Record<string, unknown>>).filter((tank) => {
    const currentBatchId = typeof tank.current_batch_id === "string" ? tank.current_batch_id : null;
    return currentBatchId === null;
  });
  const executableTasks = operational.openTasks.filter(
    (task) =>
      task.type === "assign_tank" ||
      task.type === "record_mash_volume" ||
      task.type === "assign_inputs" ||
      task.type === "record_transfer_volume" ||
      task.type === "take_gravity_reading" ||
      task.type === "create_output_lot"
  );
  const availableIngredients = ((merged?.ingredients ?? []) as Array<Record<string, unknown>>).filter((ing) => {
    const id = typeof ing.id === "string" ? ing.id : null;
    return id !== null && isBrewInputIngredient(ing);
  });
  const isPreparingRecipeDraft = brewEntryFlow.state.isBusy && brewEntryFlow.state.step === "ready-to-confirm" && !brewEntryFlow.state.draftPreview;
  const canRetryRecipeDraft = Boolean(brewEntryFlow.state.selectedRecipeId);

  const retryExistingRecipeDraft = () => {
    if (!brewEntryFlow.state.selectedRecipeId) return;
    void brewEntryFlow.prepareDraft({
      source: "existing-recipe",
      recipeId: brewEntryFlow.state.selectedRecipeId,
    });
  };

  const handleSheetTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartY.current = touch.clientY;
    touchStartX.current = touch.clientX;
    touchDeltaY.current = 0;
    touchDeltaX.current = 0;
  };

  const handleSheetTouchMove = (event: TouchEvent<HTMLDivElement>) => {
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
              <h2 className="brew-card-title">{dashboardData.brewCard.batchName}</h2>
              <p className="subtle brew-card-lot">{dashboardData.brewCard.batchId}</p>
            </div>
          </div>
          <div className="brew-side">
            {brewDayLabel ? <strong>{brewDayLabel}</strong> : null}
            <small className="batch-status">{brewStatusLabel}</small>
          </div>
        </div>
        <div className="fermentation-row">
          <p>{copy.fermentationProgress}</p>
          {progressLabel ? <span>{progressLabel}</span> : null}
        </div>
        <div className="progress-track" aria-hidden="true">
          <span className="progress-fill" style={{ width: `${dashboardData.brewCard.progressPercent}%` }} />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-head">
          <h3>{copy.atAGlance}</h3>
          <button type="button">{copy.viewAll}</button>
        </div>
        <div className="glance-grid">
          {dashboardData.glanceCards.map((card, index) => {
            if (index === 1) {
              const hasOpenTasks = operational.openTaskCount > 0;
              const firstTaskLabel = operational.openTasks[0]?.label ?? null;
              const secondaryText =
                hasOpenTasks && firstTaskLabel && firstTaskLabel.length <= 22
                  ? firstTaskLabel
                  : `Active batches: ${operational.activeBatchCount}`;
              return (
                <article key="needs-action" className="glance-card blue" role="button" tabIndex={0} onClick={() => setTasksOpen(true)} onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") setTasksOpen(true);
                }}>
                  <div className="glance-icon">
                    <Icon name="tasks" className="line-icon icon-md" />
                  </div>
                  <div className="glance-copy">
                    <p className="eyebrow">{hasOpenTasks ? "NEEDS ACTION" : "ALL CLEAR"}</p>
                    <strong>{operational.openTaskCount} tasks</strong>
                    <span>{secondaryText}</span>
                  </div>
                </article>
              );
            }
            return (
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
            );
          })}
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
            <div
              className="brew-entry-grab-zone"
              role="button"
              tabIndex={0}
              aria-label={copy.brewEntryClose}
              onTouchStart={handleSheetTouchStart}
              onTouchMove={handleSheetTouchMove}
              onTouchEnd={handleSheetTouchEnd}
              onClick={brewEntryFlow.close}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  brewEntryFlow.close();
                }
              }}
            >
              <span className="brew-entry-handle" aria-hidden="true" />
            </div>
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
              {!brewEntryFlow.state.draftPreview && isPreparingRecipeDraft && (
                <div className="brew-entry-loading" role="status" aria-live="polite">
                  <span className="brew-entry-spinner" aria-hidden="true" />
                  <span>{copy.brewEntryPreparing}</span>
                </div>
              )}

              {!brewEntryFlow.state.draftPreview && !isPreparingRecipeDraft && (
                <>
                  <p className="subtle">{copy.brewEntryPrepareFailed}</p>
                  {brewEntryFlow.state.error && <p className="error">{brewEntryFlow.state.error}</p>}
                  <div className="brew-entry-footer">
                    {canRetryRecipeDraft ? (
                      <button type="button" className="dark-btn" onClick={retryExistingRecipeDraft} disabled={brewEntryFlow.state.isBusy}>
                        {copy.brewEntryRetry}
                      </button>
                    ) : (
                      <button type="button" className="dark-btn ghost" onClick={brewEntryFlow.back}>
                        {copy.brewEntryBack}
                      </button>
                    )}
                  </div>
                </>
              )}

              {brewEntryFlow.state.draftPreview && (
                <>
                  <p className="eyebrow">{copy.brewEntryReadyToBrew}</p>
                  <p className="brew-confirm-title">{selectedRecipeName}</p>
                  <p className="brew-confirm-status">{copy.brewEntryDraftReadyStatus}</p>
                  <div className="brew-confirm-summary task-item">
                    <div className="brew-confirm-row">
                      <span className="brew-confirm-label">{copy.brewEntryRecipeLabel}</span>
                      <span className="brew-confirm-value">{selectedRecipeName}</span>
                    </div>
                    <div className="brew-confirm-row">
                      <span className="brew-confirm-label">{copy.brewEntryVolumeLabel}</span>
                      <span className="brew-confirm-value">
                        {selectedRecipe?.volumeL != null ? `${selectedRecipe.volumeL} L` : copy.brewEntryMissingValue}
                      </span>
                    </div>
                    <div className="brew-confirm-row">
                      <span className="brew-confirm-label">{copy.brewEntryOgLabel}</span>
                      <span className="brew-confirm-value">
                        {selectedRecipe?.targetOg != null ? String(selectedRecipe.targetOg) : copy.brewEntryMissingValue}
                      </span>
                    </div>
                    <div className="brew-confirm-row">
                      <span className="brew-confirm-label">{copy.brewEntryYeastLabel}</span>
                      <span className="brew-confirm-value">
                        {selectedRecipe?.yeast ?? copy.brewEntryMissingValue}
                      </span>
                    </div>
                  </div>
                  {brewEntryFlow.state.error && <p className="error">{brewEntryFlow.state.error}</p>}
                  <div className="brew-confirm-actions">
                    <button
                      type="button"
                      className="dark-btn brew-confirm-primary"
                      onClick={() => void brewEntryFlow.confirmDraft()}
                      disabled={brewEntryFlow.state.isConfirming}
                    >
                      {copy.brewEntryConfirmBrew}
                    </button>
                    <button type="button" className="dark-btn ghost" onClick={brewEntryFlow.back}>
                      {copy.brewEntryBack}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {brewEntryFlow.state.step === "confirming" && <p className="subtle">{copy.brewEntryConfirm}</p>}

          {brewEntryFlow.state.step === "confirmed" && (
            <>
              <p className="eyebrow">{copy.brewEntryLaunchedTitle}</p>
              <p className="brew-confirm-title">{brewEntryFlow.state.confirmedBatchName}</p>
              <p className="brew-confirm-status">{copy.brewEntryBatchCreated}</p>
              <div className="brew-confirm-actions">
                <button type="button" className="dark-btn brew-confirm-primary" onClick={brewEntryFlow.close}>
                  {copy.brewEntryContinue}
                </button>
                <button type="button" className="dark-btn ghost" onClick={brewEntryFlow.close}>
                  {copy.brewEntryBackToDashboard}
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
      {tasksOpen && (
        <section className="brew-entry-backdrop" onClick={() => setTasksOpen(false)} aria-label="Tasks">
          <div className="glass-panel brew-entry-sheet" onClick={(event) => event.stopPropagation()}>
            <p className="eyebrow">NEEDS ACTION</p>
            <button type="button" className="dark-btn ghost tasks-back-btn" onClick={() => setTasksOpen(false)}>Back</button>
            {executableTasks.length === 0 ? (
              <article className="task-empty-state" aria-live="polite">
                <div className="task-empty-icon" aria-hidden="true">
                  <Icon name="tasks" className="line-icon icon-md" />
                </div>
                <h4>No executable tasks</h4>
                <p className="subtle">Remaining suggestions are not wired to actions yet.</p>
              </article>
            ) : null}
            {executableTasks.map((task) => (
              <div key={task.id} className="brew-confirm-summary task-item">
                <div className="brew-confirm-row"><span className="brew-confirm-label">{task.batchLabel}</span><span className="brew-confirm-value">{task.label}</span></div>
                <button type="button" className="dark-btn task-toggle-btn" onClick={() => { setActiveTaskId((prev) => (prev === task.id ? null : task.id)); setTaskError(null); }}>Start</button>
                {activeTaskId === task.id && task.type === "assign_tank" && (
                  <div className="task-action-panel">
                    <div className="task-field-group"><label className="task-select-wrap"><span className="task-field-label">Tank</span><select className="task-select" value={selectedTankId} onChange={(event) => setSelectedTankId(event.target.value)}>
                      <option value="">Select tank</option>
                      {availableTanks.map((tank) => <option key={String(tank.id ?? "")} value={String(tank.id ?? "")}>{String(tank.name ?? tank.id ?? "Tank")}</option>)}
                    </select><span className="task-select-chevron" aria-hidden="true">⌄</span></label></div>
                    {availableTanks.length === 0 ? <p className="subtle">No available tanks.</p> : null}
                    <button type="button" className="dark-btn brew-confirm-primary task-confirm-btn" disabled={taskBusy || !selectedTankId} onClick={async () => {
                      try { setTaskBusy(true); await assignTank({ tankId: selectedTankId, batchId: task.batchId }); await (isDemoMode ? refetchDemoDashboard() : refetchRealDashboard()); setActiveTaskId(null); setSelectedTankId(""); }
                      catch (error) { setTaskError(error instanceof Error ? error.message : "Failed to assign tank"); }
                      finally { setTaskBusy(false); }
                    }}>Confirm</button>
                  </div>
                )}
                {activeTaskId === task.id && task.type === "record_mash_volume" && (
                  <div className="task-action-panel">
                    <div className="task-inline-row">
                      <input className="task-input" type="number" inputMode="decimal" min="0" step="0.1" value={mashVolumeInput} onChange={(event) => setMashVolumeInput(event.target.value)} placeholder="10" />
                      <input type="text" className="task-input task-input-unit" value="L" readOnly aria-label="Unit liters" />
                    </div>
                    <button type="button" className="dark-btn brew-confirm-primary task-confirm-btn" disabled={taskBusy} onClick={async () => {
                      const liters = Number(mashVolumeInput);
                      if (!Number.isFinite(liters) || liters <= 0) { setTaskError("Enter a valid volume in liters."); return; }
                      try { setTaskBusy(true); await recordMashVolume({ batchId: task.batchId, actualMashVolumeLiters: liters }); await (isDemoMode ? refetchDemoDashboard() : refetchRealDashboard()); setActiveTaskId(null); setMashVolumeInput(""); }
                      catch (error) { setTaskError(error instanceof Error ? error.message : "Failed to record mash volume"); }
                      finally { setTaskBusy(false); }
                    }}>Confirm</button>
                  </div>
                )}
                {activeTaskId === task.id && task.type === "assign_inputs" && (
                  <div className="task-action-panel">
                    <div className="task-field-group"><label className="task-select-wrap"><span className="task-field-label">Ingredient</span><select className="task-select" value={ingredientIdInput} onChange={(event) => {
                      const id = event.target.value;
                      setIngredientIdInput(id);
                      const ing = availableIngredients.find((i) => String(i.id ?? "") === id);
                      const defaultUnit = ing && typeof ing.default_unit === "string" ? ing.default_unit : "";
                      if (defaultUnit) setIngredientUnitInput(defaultUnit);
                    }}>
                      <option value="">Select ingredient</option>
                      {availableIngredients.map((ing) => <option key={String(ing.id ?? "")} value={String(ing.id ?? "")}>{String(ing.name ?? ing.id ?? "Ingredient")}</option>)}
                    </select><span className="task-select-chevron" aria-hidden="true">⌄</span></label></div>
                    {availableIngredients.length === 0 ? <p className="subtle">No ingredients available.</p> : null}
                    <div className="task-inline-row"><input className="task-input" type="number" inputMode="decimal" min="0" step="0.01" value={ingredientQuantityInput} onChange={(event) => setIngredientQuantityInput(event.target.value)} placeholder="10" />
                    <input className="task-input task-input-unit" type="text" value={ingredientUnitInput} onChange={(event) => setIngredientUnitInput(event.target.value)} placeholder="kg" /></div>
                    <button type="button" className="dark-btn brew-confirm-primary task-confirm-btn" disabled={taskBusy || !ingredientIdInput} onClick={async () => {
                      const qty = Number(ingredientQuantityInput);
                      if (!ingredientIdInput) { setTaskError("Select an ingredient."); return; }
                      if (!Number.isFinite(qty) || qty <= 0) { setTaskError("Enter a valid quantity."); return; }
                      if (!ingredientUnitInput.trim()) { setTaskError("Enter a unit."); return; }
                      try { setTaskBusy(true); await assignIngredientLots({ batchId: task.batchId, ingredientId: ingredientIdInput, quantity: qty, unit: ingredientUnitInput.trim() }); await (isDemoMode ? refetchDemoDashboard() : refetchRealDashboard()); setActiveTaskId(null); setIngredientIdInput(""); setIngredientQuantityInput(""); setIngredientUnitInput(""); }
                      catch (error) { setTaskError(error instanceof Error ? error.message : "Failed to assign ingredient lots"); }
                      finally { setTaskBusy(false); }
                    }}>Confirm</button>
                  </div>
                )}
                {activeTaskId === task.id && task.type === "record_transfer_volume" && (
                  <div className="task-action-panel">
                    <div className="task-inline-row">
                      <input className="task-input" type="number" inputMode="decimal" min="0" step="0.1" value={transferVolumeInput} onChange={(event) => setTransferVolumeInput(event.target.value)} placeholder="10" />
                      <input type="text" className="task-input task-input-unit" value="L" readOnly aria-label="Unit liters" />
                    </div>
                    <button type="button" className="dark-btn brew-confirm-primary task-confirm-btn" disabled={taskBusy} onClick={async () => {
                      const liters = Number(transferVolumeInput);
                      if (!Number.isFinite(liters) || liters <= 0) { setTaskError("Enter a valid volume in liters."); return; }
                      try { setTaskBusy(true); await recordTransferVolume({ batchId: task.batchId, actualFermenterVolumeLiters: liters }); await (isDemoMode ? refetchDemoDashboard() : refetchRealDashboard()); setActiveTaskId(null); setTransferVolumeInput(""); }
                      catch (error) { setTaskError(error instanceof Error ? error.message : "Failed to record transfer volume"); }
                      finally { setTaskBusy(false); }
                    }}>Confirm</button>
                  </div>
                )}
                {activeTaskId === task.id && task.type === "take_gravity_reading" && (
                  <div className="task-action-panel">
                    <input className="task-input" type="number" inputMode="decimal" min="0" step="0.001" value={gravityInput} onChange={(event) => setGravityInput(event.target.value)} placeholder="Gravity (e.g. 1.050)" />
                    <input className="task-input" type="number" inputMode="decimal" step="0.1" value={tempInput} onChange={(event) => setTempInput(event.target.value)} placeholder="Temp °C (optional)" />
                    <button type="button" className="dark-btn brew-confirm-primary task-confirm-btn" disabled={taskBusy} onClick={async () => {
                      const gravity = Number(gravityInput);
                      if (!Number.isFinite(gravity) || gravity <= 0) { setTaskError("Enter a valid gravity value."); return; }
                      const tempC = tempInput.trim() ? Number(tempInput) : null;
                      if (tempC !== null && !Number.isFinite(tempC)) { setTaskError("Enter a valid temperature or leave blank."); return; }
                      try { setTaskBusy(true); await takeGravityReading({ batchId: task.batchId, gravity, temperatureC: tempC }); await (isDemoMode ? refetchDemoDashboard() : refetchRealDashboard()); setActiveTaskId(null); setGravityInput(""); setTempInput(""); }
                      catch (error) { setTaskError(error instanceof Error ? error.message : "Failed to record gravity reading"); }
                      finally { setTaskBusy(false); }
                    }}>Confirm</button>
                  </div>
                )}
                {activeTaskId === task.id && task.type === "create_output_lot" && (
                  <div className="task-action-panel">
                    <input className="task-input" type="text" value={lotNumberInput} onChange={(event) => setLotNumberInput(event.target.value)} placeholder="Lot number" />
                    <div className="task-inline-row"><input className="task-input" type="number" inputMode="decimal" min="0" step="0.1" value={lotVolumeInput} onChange={(event) => setLotVolumeInput(event.target.value)} placeholder="Volume (L, optional)" />
                    <input className="task-input" type="number" inputMode="numeric" min="0" step="1" value={lotUnitsInput} onChange={(event) => setLotUnitsInput(event.target.value)} placeholder="Units count (optional)" /></div>
                    <button type="button" className="dark-btn brew-confirm-primary task-confirm-btn" disabled={taskBusy || !lotNumberInput.trim()} onClick={async () => {
                      if (!lotNumberInput.trim()) { setTaskError("Enter a lot number."); return; }
                      const volumeLiters = lotVolumeInput.trim() ? Number(lotVolumeInput) : null;
                      const unitsCount = lotUnitsInput.trim() ? Number(lotUnitsInput) : null;
                      if (volumeLiters !== null && (!Number.isFinite(volumeLiters) || volumeLiters <= 0)) { setTaskError("Enter a valid volume or leave blank."); return; }
                      if (unitsCount !== null && (!Number.isFinite(unitsCount) || unitsCount <= 0)) { setTaskError("Enter a valid units count or leave blank."); return; }
                      try { setTaskBusy(true); await createOutputLot({ batchId: task.batchId, lotNumber: lotNumberInput.trim(), volumeLiters, unitsCount }); await (isDemoMode ? refetchDemoDashboard() : refetchRealDashboard()); setActiveTaskId(null); setLotNumberInput(""); setLotVolumeInput(""); setLotUnitsInput(""); }
                      catch (error) { setTaskError(error instanceof Error ? error.message : "Failed to create output lot"); }
                      finally { setTaskBusy(false); }
                    }}>Confirm</button>
                  </div>
                )}
              </div>
            ))}
            {taskError ? <p className="error">{taskError}</p> : null}
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
            <Icon name="tank" className="line-icon icon-md" />
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
      <div className="brew-fab-wrapper" aria-hidden="true">
        <button type="button" className="brew-fab" aria-label={copy.quickActionStartBrew} onClick={brewEntryFlow.open}>
          <span className="brew-fab-icon" aria-hidden="true">
            <Icon name="plus" className="line-icon icon-lg" />
          </span>
        </button>
      </div>

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
