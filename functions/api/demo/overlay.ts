import { jsonResponse } from "../../_shared/auth";
import {
  fetchDemoSession,
  insertOverlayRecord,
  missingSessionResponse,
  type DemoEnv,
  type OverlayRecordRow,
} from "../../_shared/demo";

interface Env extends DemoEnv {}

interface OverlayBody {
  demo_session_id?: string;
  target_table?: string;
  target_id?: string;
  action?: "upsert" | "delete";
  payload?: Record<string, unknown> | null;
}

const ALLOWED_TABLES = new Set(["tanks"]);

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  let body: OverlayBody;
  try {
    body = (await request.json()) as OverlayBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!body.demo_session_id) return missingSessionResponse();
  if (!body.target_table || !ALLOWED_TABLES.has(body.target_table)) {
    return jsonResponse({ error: "target_table is required and must be supported" }, 400);
  }
  if (!body.target_id) {
    return jsonResponse({ error: "target_id is required" }, 400);
  }

  const action = body.action ?? "upsert";
  if (action !== "upsert" && action !== "delete") {
    return jsonResponse({ error: "action must be upsert or delete" }, 400);
  }

  const payload = action === "delete" ? null : body.payload ?? {};

  try {
    await fetchDemoSession(env, body.demo_session_id);

    const record = await insertOverlayRecord(env, {
      demo_session_id: body.demo_session_id,
      target_table: body.target_table,
      target_id: body.target_id,
      action,
      payload,
    } satisfies OverlayRecordRow);

    return jsonResponse({ ok: true, overlay_record_id: record.id, demo_session_id: body.demo_session_id }, 201);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Failed to persist demo overlay" }, 500);
  }
}
