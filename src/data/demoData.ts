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
    greetingName: "brewer",
    subtitle: "",
  },
  brewCard: {
    batchName: "West Coast IPA",
    batchId: "2417",
    batchStageLabel: "",
    stageCount: "2",
    progressPercent: 68,
  },
  glanceCards: [
    { title: "", subtitle: "", accent: "green", value: "12" },
    { title: "", subtitle: "", accent: "blue", value: "12.45 hL" },
    { title: "", subtitle: "", accent: "purple", value: "5" },
    { title: "", subtitle: "", accent: "amber", value: "8" },
  ],
  quickActions: [],
};
