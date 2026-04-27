export {
  clearStoredDemoSessionId,
  createDemoSession,
  DEMO_MODE_KEY,
  DEMO_SESSION_ID_KEY,
  endDemoSession,
  getStoredDemoSessionId,
  isDemoModeEnabled,
  isDemoSessionExpired,
  loadDemoDashboard,
  setStoredDemoSessionId,
  writeDemoOverlay,
} from "@/domains/demo/api";

export type {
  DemoDashboardMerged,
  DemoOverlayInput,
  OverlayOperation,
} from "@/domains/demo/types";
