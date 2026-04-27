import type { UploadSourceType } from "@/domains/batches/types";

export interface RecipeUploadIntakeRequest {
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  sourceType: UploadSourceType;
  manualText?: string | null;
}

export interface RecipeUploadIntakeResponse {
  intake_id: string;
  parse_status: "pending";
  source_type: UploadSourceType;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  manual_text: string | null;
  next_step: "parse_and_confirm";
}
