import { jsonResponse, unauthorizedResponse, verifySupabaseJwt, type AuthEnv } from "../../_shared/auth";

type Env = AuthEnv;

type UploadSourceType = "pdf" | "image" | "spreadsheet" | "text" | "beerxml" | "brewfather" | "unknown";

interface UploadIntakeBody {
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  sourceType?: UploadSourceType;
  manualText?: string | null;
}

const ALLOWED_SOURCE_TYPES: UploadSourceType[] = ["pdf", "image", "spreadsheet", "text", "beerxml", "brewfather", "unknown"];

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const user = await verifySupabaseJwt(request.headers.get("Authorization"), env);
  if (!user) return unauthorizedResponse();

  let body: UploadIntakeBody;
  try {
    body = (await request.json()) as UploadIntakeBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const sourceType = body.sourceType ?? "unknown";
  if (!ALLOWED_SOURCE_TYPES.includes(sourceType)) {
    return jsonResponse({ error: "sourceType is invalid" }, 400);
  }

  if (!body.fileName && !(body.manualText && body.manualText.trim().length > 0)) {
    return jsonResponse({ error: "fileName or manualText is required" }, 400);
  }

  const intakeId = crypto.randomUUID();

  return jsonResponse(
    {
      intake_id: intakeId,
      parse_status: "pending",
      source_type: sourceType,
      file_name: body.fileName ?? null,
      mime_type: body.mimeType ?? null,
      file_size: typeof body.fileSize === "number" ? body.fileSize : null,
      manual_text: body.manualText?.trim() || null,
      next_step: "parse_and_confirm",
    },
    201
  );
}
