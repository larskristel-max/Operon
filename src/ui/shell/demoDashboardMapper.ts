import type { DemoDashboardMerged } from "@/api/demo";
import type { DashboardData } from "@/data/demoData";
import type { DashboardCopy } from "@/ui/shell/dashboardI18n";

const normalizeStatus = (status?: string): string | undefined => status?.toLowerCase().trim();

const ACTIVE_STATUSES = ["brewing", "fermenting", "conditioning", "in_progress", "active"];

const isActiveStatus = (status?: string): boolean =>
  ACTIVE_STATUSES.includes(normalizeStatus(status) ?? "");

const litersToHL = (liters: number): number => liters / 100;

function readString(record: Record<string, unknown> | null | undefined, keys: string[]): string | null {
  if (!record) return null;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function readNumber(record: Record<string, unknown> | null | undefined, keys: string[]): number | null {
  if (!record) return null;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return null;
}

function toTitleCase(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function pickActiveBatch(batches: Array<Record<string, unknown>>): Record<string, unknown> | null {
  const activeBatch = batches.find((batch) => {
    const status = readString(batch, ["status", "stage", "batch_status"]);
    return isActiveStatus(status ?? undefined);
  });

  return activeBatch ?? batches[0] ?? null;
}

function calculateLowStock(ingredients: Array<Record<string, unknown>>): number | null {
  const low = ingredients.filter((ingredient) => {
    const onHand = readNumber(ingredient, ["stock_on_hand", "quantity_on_hand", "current_stock", "amount"]);
    const threshold = readNumber(ingredient, ["low_stock_threshold", "reorder_level", "minimum_stock", "min_stock"]);
    if (onHand === null || threshold === null) return false;
    return onHand <= threshold;
  });

  return low.length > 0 ? low.length : null;
}

function calculateWaterUsage(movements: Array<Record<string, unknown>>): string {
  const waterTotal = movements.reduce<number>((sum, movement) => {
    const movementType = readString(movement, ["movement_type", "scope", "category"]);
    if (!movementType || !movementType.toLowerCase().includes("water")) {
      return sum;
    }

    const quantity = readNumber(movement, ["quantity", "base_quantity_liters", "volume_liters"]);
    if (quantity === null) return sum;
    return sum + quantity;
  }, 0);

  if (waterTotal <= 0) return "—";
  return `${litersToHL(waterTotal).toFixed(2)} hL`;
}

export function mapDemoDashboardToViewModel(merged: DemoDashboardMerged, copy: DashboardCopy): DashboardData {
  const breweryName =
    readString(merged.brewery_profile, ["display_name", "name", "legal_name"]) ?? "OPERON";

  const activeBatch = pickActiveBatch(merged.batches);
  const batchName = readString(activeBatch, ["name", "batch_name", "recipe_name", "batch_number"]) ?? "—";
  const batchId = readString(activeBatch, ["batch_number", "id", "declaration_number"]) ?? "—";
  const batchStatusRaw = readString(activeBatch, ["status", "stage", "batch_status"]);
  const batchStatus = batchStatusRaw ? toTitleCase(batchStatusRaw) : copy.waitingForData;
  const stageCount = readNumber(activeBatch, ["day_in_stage", "day", "days_in_stage", "days_elapsed"]);
  const progress = readNumber(activeBatch, ["progress_percent", "fermentation_progress", "progress"]);

  const tanksCount = merged.tanks.length;
  const ordersCount = merged.sales.length;
  const lowStockCount = calculateLowStock(merged.ingredients);

  return {
    breweryName,
    hero: {
      greetingName: copy.greetingBrewer,
      subtitle: copy.heroSubtitleDemo,
    },
    brewCard: {
      batchName,
      batchId: batchId === "—" ? "—" : `${copy.batchIdPrefix}${batchId}`,
      batchStageLabel: batchStatus,
      stageCount: stageCount === null ? "—" : String(Math.max(0, Math.floor(stageCount))),
      progressPercent: progress === null ? 0 : Math.max(0, Math.min(100, Math.round(progress))),
    },
    glanceCards: [
      { title: copy.tanks, subtitle: copy.active, accent: "green", value: String(tanksCount) },
      { title: copy.waterUsage, subtitle: copy.today, accent: "blue", value: calculateWaterUsage(merged.inventory_movements) },
      { title: copy.orders, subtitle: copy.toFulfill, accent: "purple", value: String(ordersCount) },
      { title: copy.inventory, subtitle: copy.lowStock, accent: "amber", value: lowStockCount === null ? "—" : String(lowStockCount) },
    ],
    quickActions: [
      copy.quickActionStartBrew,
      copy.quickActionLogFermentation,
      copy.quickActionAddInventory,
      copy.quickActionViewReports,
    ],
  };
}
