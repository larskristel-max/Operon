import { verifySupabaseJwt, unauthorizedResponse, jsonResponse, type AuthEnv } from "../_shared/auth";

type Env = AuthEnv;

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const user = await verifySupabaseJwt(request.headers.get("Authorization"), env);
  if (!user) return unauthorizedResponse();

  return jsonResponse({
    user: {
      id: user.id,
      email: user.email ?? null,
      displayName: user.user_metadata?.display_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    },
  });
}
