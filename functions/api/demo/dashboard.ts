import { jsonResponse } from "../../_shared/auth";
import {
  applyDashboardOverlay,
  fetchDashboardBaseline,
  fetchDemoSession,
  fetchOverlayRecords,
  missingSessionResponse,
  type DemoEnv,
} from "../../_shared/demo";

interface Env extends DemoEnv {}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const url = new URL(request.url);
  const demoSessionId = url.searchParams.get("demo_session_id");
  if (!demoSessionId) return missingSessionResponse();

  try {
    const session = await fetchDemoSession(env, demoSessionId);
    const baseline = await fetchDashboardBaseline(env, session.brewery_id);
    const overlays = await fetchOverlayRecords(env, demoSessionId);
    const merged = applyDashboardOverlay(baseline, overlays);

    return jsonResponse({
      demo_session_id: demoSessionId,
      baseline,
      merged,
      overlay_count: overlays.length,
    });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Failed to load demo dashboard" }, 500);
  }
}
