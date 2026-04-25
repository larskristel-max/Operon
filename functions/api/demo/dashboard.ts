import { buildDashboardPayload, mapDemoError, missingSessionResponse, type DemoEnv } from "../../_shared/demo";

interface Env extends DemoEnv {}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const url = new URL(request.url);
  const demoSessionId = url.searchParams.get("demo_session_id");
  if (!demoSessionId) return missingSessionResponse();

  try {
    return new Response(JSON.stringify(await buildDashboardPayload(env, demoSessionId)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return mapDemoError(error, "Failed to load demo dashboard");
  }
}
