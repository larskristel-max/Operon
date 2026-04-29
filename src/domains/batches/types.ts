export type BrewEntryStep =
  | "recipe-source"
  | "existing-recipe-options"
  | "select-existing-recipe"
  | "upload-recipe"
  | "new-recipe-placeholder"
  | "ready-to-confirm";

export type BrewEntrySource = "existing-recipe" | "new-recipe" | "upload-recipe";

export type UploadSourceType = "pdf" | "image" | "spreadsheet" | "text" | "beerxml" | "brewfather" | "unknown";

export interface UploadSelection {
  file: File | null;
  sourceType: UploadSourceType;
  manualText: string;
}

export interface RecipeUploadIntakeDraft {
  intakeId: string;
  fileName: string | null;
  mimeType: string | null;
  sourceType: UploadSourceType;
  fileSize: number | null;
  manualText: string | null;
  parseStatus: "pending";
  nonPersistent: boolean;
}

export interface BrewDraftPreview {
  draftId: string;
  status: "ready_to_confirm";
  source: BrewEntrySource;
  nonPersistent: boolean;
  recipeDraft: {
    recipeId: string | null;
    uploadIntakeId: string | null;
    newRecipePlaceholder: boolean;
  };
  batchDraft: {
    proposedName: string;
    stage: "planning";
  };
}

export interface ExistingRecipeOption {
  id: string;
  name: string;
}

export interface BrewEntryState {
  isOpen: boolean;
  step: BrewEntryStep;
  selectedSource: BrewEntrySource | null;
  selectedRecipeId: string | null;
  upload: UploadSelection;
  uploadIntake: RecipeUploadIntakeDraft | null;
  draftPreview: BrewDraftPreview | null;
  isBusy: boolean;
  error: string | null;
}

export interface CreateBrewDraftInput {
  source: BrewEntrySource;
  recipeId?: string | null;
  uploadIntakeId?: string | null;
}
