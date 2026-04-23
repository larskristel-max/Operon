export interface DashboardHeroData {
  greetingName: string;
  subtitle: string;
  demoLabel?: string;
}

export interface BrewCardData {
  batchName: string;
  batchId: string;
  batchStageLabel: string;
  stageCount: string;
  progressPercent: number;
}

export interface GlanceCardData {
  title: string;
  subtitle: string;
  accent: "green" | "blue" | "purple" | "amber";
  value: string;
}

export interface DashboardData {
  breweryName: string;
  hero: DashboardHeroData;
  brewCard: BrewCardData;
  glanceCards: GlanceCardData[];
  quickActions: string[];
}

export const demoDashboardData: DashboardData = {
  breweryName: "OPERON",
  hero: {
    greetingName: "Alex",
    subtitle: "Here’s what’s brewing today.",
  },
  brewCard: {
    batchName: "West Coast IPA",
    batchId: "Batch #2417",
    batchStageLabel: "In Fermentation",
    stageCount: "2",
    progressPercent: 68,
  },
  glanceCards: [
    { title: "TANKS", subtitle: "Active", accent: "green", value: "12" },
    { title: "WATER USAGE", subtitle: "Today", accent: "blue", value: "1,245 gal" },
    { title: "ORDERS", subtitle: "To Fulfill", accent: "purple", value: "5" },
    { title: "INVENTORY", subtitle: "Low Stock", accent: "amber", value: "8" },
  ],
  quickActions: ["Start Brew", "Log Fermentation", "Add Inventory", "View Reports"],
};
