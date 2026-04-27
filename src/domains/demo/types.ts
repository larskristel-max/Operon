export type OverlayOperation = "insert" | "update" | "delete";

export interface DemoDashboardMerged {
  brewery_profile: Record<string, unknown> | null;
  tanks: Array<Record<string, unknown>>;
  batches: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  ingredients: Array<Record<string, unknown>>;
  recipes: Array<Record<string, unknown>>;
  packaging_formats: Array<Record<string, unknown>>;
  lots: Array<Record<string, unknown>>;
  inventory_movements: Array<Record<string, unknown>>;
  sales: Array<Record<string, unknown>>;
}

export interface DemoOverlayInput {
  table_name: string;
  record_id: string;
  operation: OverlayOperation;
  payload: Record<string, unknown> | null;
}
