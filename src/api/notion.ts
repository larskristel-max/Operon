import type { SemanticEntity, SemanticLink, SemanticGraph } from "@/types/domain";
import { apiFetch, ApiError } from "@/api/client";

class NotionApiError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "NotionApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function notionGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, window.location.origin);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    }
  }

  try {
    return await apiFetch<T>(url.pathname + url.search);
  } catch (error) {
    if (error instanceof ApiError) {
      throw new NotionApiError(error.message, error.status, error.detail);
    }
    throw error;
  }
}

export interface NotionHealthResponse {
  ok: boolean;
  bot: string | null;
  workspace: string | null;
}

export interface NotionEntitiesFilter {
  ruleGroup?: string;
  entityClass?: string;
  memoryLayer?: string;
  layer?: string;
  appRole?: string;
  active?: "true" | "false";
}

const notion = {
  health: (): Promise<NotionHealthResponse> =>
    notionGet<NotionHealthResponse>("/api/notion/health"),

  entities: (filter?: NotionEntitiesFilter): Promise<SemanticEntity[]> =>
    notionGet<{ entities: SemanticEntity[] }>("/api/notion/entities", filter as Record<string, string>).then(
      (d) => d.entities
    ),

  entity: (idOrKey: string): Promise<SemanticEntity> =>
    notionGet<SemanticEntity>(`/api/notion/entities/${encodeURIComponent(idOrKey)}`),

  links: (filter?: { relationType?: string; sourceKey?: string; targetKey?: string }): Promise<SemanticLink[]> =>
    notionGet<{ links: SemanticLink[] }>("/api/notion/links", filter as Record<string, string>).then(
      (d) => d.links
    ),

  graph: (): Promise<SemanticGraph> =>
    notionGet<SemanticGraph>("/api/notion/graph"),

  readiness: (): Promise<{ entities: SemanticEntity[]; links: SemanticLink[] }> =>
    notionGet<{ entities: SemanticEntity[]; links: SemanticLink[] }>("/api/notion/readiness"),

  productFoundations: (): Promise<SemanticEntity[]> => notion.entities({ memoryLayer: "domain_knowledge" }),
  systemEntities: (): Promise<SemanticEntity[]> => notion.entities({ entityClass: "System" }),
  controlEntities: (): Promise<SemanticEntity[]> => notion.entities({ entityClass: "Control" }),
  executionReadiness: (): Promise<SemanticEntity[]> => notion.entities({ ruleGroup: "execution_readiness" }),
};

export default notion;
