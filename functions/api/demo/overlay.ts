import { jsonResponse } from "../../_shared/auth";
import {
  fetchActiveDemoSession,
  insertOverlayRecord,
  mapDemoError,
  missingSessionResponse,
  type DemoEnv,
  type OverlayOperation,
  type OverlayRecordRow,
} from "../../_shared/demo";

interface Env extends DemoEnv {}

interface OverlayBody {
  demo_session_id?: string;
  table_name?: string;
  record_id?: string;
  operation?: OverlayOperation;
  payload?: Record<string, unknown> | null;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  return Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null;
}

const ALLOWED_TABLES = new Set([
  "tanks",
  "batches",
  "tasks",
  "lots",
  "ingredients",
  "inventory_movements",
  "recipes",
  "packaging_formats",
  "sales",
  "brew_logs",
  "batch_inputs",
  "fermentation_checks",
]);

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  let body: OverlayBody;
  try {
    body = (await request.json()) as OverlayBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!body.demo_session_id) return missingSessionResponse();
  if (!body.table_name || !ALLOWED_TABLES.has(body.table_name)) {
    return jsonResponse({ error: "table_name is required and must be in allowed demo tables" }, 400);
  }
  if (!body.record_id) {
    return jsonResponse({ error: "record_id is required" }, 400);
  }

  const operation = body.operation ?? "update";
  if (!["insert", "update", "delete"].includes(operation)) {
    return jsonResponse({ error: "operation must be insert, update, or delete" }, 400);
  }

  let payload: Record<string, unknown> | null;
  if (operation === "delete") {
    payload = null;
  } else {
    if (!isPlainRecord(body.payload)) {
      return jsonResponse({ error: "payload must be a plain JSON object for insert/update operations" }, 400);
    }
    payload = body.payload;
  }

  try {
    await fetchActiveDemoSession(env, body.demo_session_id);

    const record = await insertOverlayRecord(env, {
      demo_session_id: body.demo_session_id,
      table_name: body.table_name,
      record_id: body.record_id,
      operation,
      payload,
    } satisfies OverlayRecordRow);

    return jsonResponse({ ok: true, overlay_record_id: record.id, demo_session_id: body.demo_session_id }, 201);
  } catch (error) {
    return mapDemoError(error, "Failed to persist demo overlay");
  }
}
