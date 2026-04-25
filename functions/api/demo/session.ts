import { jsonResponse } from "../../_shared/auth";
import {
  buildDashboardPayload,
  createDemoSession,
  endDemoSession,
  fetchDemoBrewery,
  mapDemoError,
  missingSessionResponse,
  type DemoEnv,
} from "../../_shared/demo";

interface Env extends DemoEnv {}

function readSessionId(request: Request): string | null {
  const url = new URL(request.url);
  return url.searchParams.get("demo_session_id");
}

export async function onRequestPost(context: { env: Env }): Promise<Response> {
  const { env } = context;

  try {
    const demoBrewery = await fetchDemoBrewery(env);
    const demoBreweryId = demoBrewery.id;

    if (typeof demoBreweryId !== "string" || !demoBreweryId) {
      return jsonResponse({ error: "Demo brewery is missing id" }, 500);
    }

    const session = await createDemoSession(env, demoBreweryId);
    const dashboard = await buildDashboardPayload(env, session.id);

    return jsonResponse(dashboard, 201);
  } catch (error) {
    return mapDemoError(error, "Failed to create demo session");
  }
}

export async function onRequestDelete(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  let demoSessionId = readSessionId(request);
  if (!demoSessionId) {
    try {
      const body = (await request.json()) as { demo_session_id?: string };
      demoSessionId = body.demo_session_id ?? null;
    } catch {
      demoSessionId = null;
    }
  }

  if (!demoSessionId) return missingSessionResponse();

  try {
    await endDemoSession(env, demoSessionId);
    return jsonResponse({ ok: true, demo_session_id: demoSessionId, status: "exited" });
  } catch (error) {
    return mapDemoError(error, "Failed to end demo session");
  }
}
