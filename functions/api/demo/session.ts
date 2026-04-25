import { jsonResponse } from "../../_shared/auth";
import { createDemoSession, deleteDemoSession, fetchDemoBrewery, missingSessionResponse, type DemoEnv } from "../../_shared/demo";

interface Env extends DemoEnv {}

function readSessionId(request: Request): string | null {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("demo_session_id");
  if (fromQuery) return fromQuery;
  return null;
}

export async function onRequestPost(context: { env: Env }): Promise<Response> {
  const { env } = context;

  try {
    const demoBrewery = await fetchDemoBrewery(env);
    const breweryId = demoBrewery.id;

    if (typeof breweryId !== "string" || !breweryId) {
      return jsonResponse({ error: "Demo brewery is missing id" }, 500);
    }

    const session = await createDemoSession(env, breweryId);
    return jsonResponse(
      {
        demo_session_id: session.id,
        brewery_id: session.brewery_id,
      },
      201
    );
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Failed to create demo session" }, 500);
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
    await deleteDemoSession(env, demoSessionId);
    return jsonResponse({ ok: true, demo_session_id: demoSessionId });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Failed to delete demo session" }, 500);
  }
}
