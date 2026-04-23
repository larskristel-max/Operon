export interface DashboardHeroData {
  greetingName: string;
  subtitle: string;
  demoLabel?: string;
}

export interface BrewCardData {
  batchName: string;
  batchStageLabel: string;
  stageCount: string;
  progressLabel: string;
  progressPercent: number;
}

export interface GlanceCardData {
  title: string;
  subtitle: string;
  accent: "green" | "blue" | "purple" | "amber";
  value: string;
}

export interface TaskItemData {
  id: string;
  title: string;
  detail: string;
}

export interface AgendaItemData {
  id: string;
  time: string;
  title: string;
}

export interface InventoryItemData {
  id: string;
  name: string;
  level: string;
}

export interface DashboardData {
  breweryName: string;
  hero: DashboardHeroData;
  brewCard: BrewCardData;
  glanceCards: GlanceCardData[];
  quickActions: string[];
  tasks: TaskItemData[];
  agenda: AgendaItemData[];
  lowStock: InventoryItemData[];
}

export const demoDashboardData: DashboardData = {
  breweryName: "OPERON",
  hero: {
    greetingName: "Demo Brewer",
    subtitle: "Welcome to Operon Demo Brewery.",
    demoLabel: "Demo",
  },
  brewCard: {
    batchName: "Hazy IPA · Batch OPN-214",
    batchStageLabel: "In Fermentation",
    stageCount: "1 Active",
    progressLabel: "Day 5 of 10",
    progressPercent: 52,
  },
  glanceCards: [
    { title: "Tanks", subtitle: "Active", accent: "green", value: "3 / 8" },
    { title: "Water Usage", subtitle: "Today", accent: "blue", value: "6.4 m³" },
    { title: "Orders", subtitle: "To Fulfill", accent: "purple", value: "12" },
    { title: "Inventory", subtitle: "Low Stock", accent: "amber", value: "3 items" },
  ],
  quickActions: ["Start Brew", "Log Fermentation", "Add Inventory", "View Reports"],
  tasks: [
    { id: "task-1", title: "Dry hop Batch OPN-214", detail: "Due in 2h · Fermenter FV-03" },
    { id: "task-2", title: "CIP Bright Tank BT-01", detail: "Scheduled · Packaging prep" },
    { id: "task-3", title: "Confirm can seam check", detail: "QA hold · Line 1" },
  ],
  agenda: [
    { id: "agenda-1", time: "14:00", title: "Yeast viability check" },
    { id: "agenda-2", time: "16:30", title: "Distributor pickup window" },
  ],
  lowStock: [
    { id: "stock-1", name: "Citra hops", level: "18 kg remaining" },
    { id: "stock-2", name: "Pilsner malt", level: "220 kg remaining" },
    { id: "stock-3", name: "355ml cans", level: "14 sleeves" },
  ],
};
