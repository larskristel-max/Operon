import { useCallback, useMemo, useState } from "react";
import { createBrewDraft } from "@/domains/batches/api";
import type {
  BrewDraftPreview,
  BrewEntrySource,
  BrewEntryState,
  ExistingRecipeOption,
  RecipeUploadIntakeDraft,
  UploadSelection,
  UploadSourceType,
} from "@/domains/batches/types";
import { createRecipeUploadIntake } from "@/domains/recipes/api";

const EMPTY_UPLOAD: UploadSelection = {
  file: null,
  sourceType: "unknown",
  manualText: "",
};


const DEFAULT_EXISTING_RECIPES: ExistingRecipeOption[] = [
  { id: "recipe-placeholder-1", name: "House Pale Ale" },
  { id: "recipe-placeholder-2", name: "Amber Session" },
  { id: "recipe-placeholder-3", name: "Pils Core" },
];

const initialBrewEntryState: BrewEntryState = {
  isOpen: false,
  step: "recipe-source",
  selectedSource: null,
  selectedRecipeId: null,
  upload: EMPTY_UPLOAD,
  uploadIntake: null,
  draftPreview: null,
  isBusy: false,
  error: null,
};

function detectUploadSourceType(file: File): UploadSourceType {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (mime.includes("pdf") || name.endsWith(".pdf")) return "pdf";
  if (mime.startsWith("image/") || /\.(png|jpg|jpeg|webp|heic)$/i.test(name)) return "image";
  if (mime.includes("spreadsheet") || /\.(csv|xls|xlsx|ods)$/i.test(name)) return "spreadsheet";
  if (name.endsWith(".xml") || name.endsWith(".beerxml")) return "beerxml";
  if (name.includes("brewfather") || name.endsWith(".json")) return "brewfather";
  if (mime.includes("text") || name.endsWith(".txt")) return "text";
  return "unknown";
}

function toPreview(input: {
  draftId: string;
  source: BrewEntrySource;
  recipeId?: string | null;
  uploadIntakeId?: string | null;
}): BrewDraftPreview {
  return {
    draftId: input.draftId,
    status: "ready_to_confirm",
    source: input.source,
    recipeDraft: {
      recipeId: input.recipeId ?? null,
      uploadIntakeId: input.uploadIntakeId ?? null,
      newRecipePlaceholder: input.source === "new-recipe",
    },
    batchDraft: {
      proposedName: "Draft batch",
      stage: "planning",
    },
  };
}

function buildDemoUploadIntake(upload: UploadSelection): RecipeUploadIntakeDraft {
  return {
    intakeId: `demo-upload-${crypto.randomUUID()}`,
    fileName: upload.file?.name ?? null,
    mimeType: upload.file?.type || null,
    sourceType: upload.sourceType,
    fileSize: upload.file?.size ?? null,
    manualText: upload.manualText.trim() ? upload.manualText.trim() : null,
    parseStatus: "pending",
  };
}

export function useBrewEntryFlow(isDemoMode: boolean) {
  const [state, setState] = useState<BrewEntryState>(initialBrewEntryState);

  const open = useCallback(() => {
    setState({ ...initialBrewEntryState, isOpen: true });
  }, []);

  const close = useCallback(() => {
    setState(initialBrewEntryState);
  }, []);

  const chooseSource = useCallback((source: BrewEntrySource) => {
    setState((prev) => {
      if (source === "existing-recipe") {
        return { ...prev, selectedSource: source, step: "existing-recipe-options", error: null, draftPreview: null };
      }
      if (source === "new-recipe") {
        return {
          ...prev,
          selectedSource: source,
          step: "ready-to-confirm",
          error: null,
          uploadIntake: null,
          draftPreview: null,
        };
      }
      return { ...prev, selectedSource: source, step: "upload-recipe", error: null, draftPreview: null };
    });
  }, []);

  const chooseExistingRecipe = useCallback((recipeId: string) => {
    setState((prev) => ({
      ...prev,
      selectedSource: "existing-recipe",
      selectedRecipeId: recipeId,
      step: "ready-to-confirm",
      error: null,
      draftPreview: null,
    }));
  }, []);

  const chooseUploadPath = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedSource: "upload-recipe",
      step: "upload-recipe",
      selectedRecipeId: null,
      draftPreview: null,
      error: null,
    }));
  }, []);

  const setManualText = useCallback((manualText: string) => {
    setState((prev) => ({
      ...prev,
      upload: { ...prev.upload, manualText },
      draftPreview: null,
      error: null,
    }));
  }, []);

  const setUploadFile = useCallback((file: File | null) => {
    setState((prev) => ({
      ...prev,
      upload: {
        ...prev.upload,
        file,
        sourceType: file ? detectUploadSourceType(file) : "unknown",
      },
      draftPreview: null,
      error: null,
    }));
  }, []);

  const back = useCallback(() => {
    setState((prev) => {
      if (prev.step === "ready-to-confirm") {
        if (prev.selectedSource === "new-recipe") {
          return { ...prev, step: "recipe-source", selectedSource: null, draftPreview: null, error: null };
        }
        if (prev.selectedSource === "existing-recipe") {
          return { ...prev, step: "existing-recipe-options", draftPreview: null, error: null };
        }
        return { ...prev, step: "upload-recipe", draftPreview: null, error: null };
      }
      if (prev.step === "upload-recipe") {
        return { ...prev, step: "existing-recipe-options", selectedSource: "existing-recipe", error: null };
      }
      if (prev.step === "existing-recipe-options") {
        return { ...prev, step: "recipe-source", selectedSource: null, error: null };
      }
      return prev;
    });
  }, []);

  const prepareDraft = useCallback(async () => {
    setState((prev) => ({ ...prev, isBusy: true, error: null }));

    try {
      const current = state;
      if (!current.selectedSource) {
        throw new Error("Recipe source is required");
      }

      if (current.selectedSource === "existing-recipe") {
        if (!current.selectedRecipeId) {
          throw new Error("Select an existing recipe first");
        }

        if (isDemoMode) {
          const draftPreview = toPreview({
            draftId: `demo-draft-${crypto.randomUUID()}`,
            source: current.selectedSource,
            recipeId: current.selectedRecipeId,
          });

          setState((prev) => ({ ...prev, isBusy: false, step: "ready-to-confirm", draftPreview }));
          return;
        }

        const response = await createBrewDraft({
          source: "existing-recipe",
          recipeId: current.selectedRecipeId,
        });

        const draftPreview: BrewDraftPreview = {
          draftId: response.draft_id,
          status: response.status,
          source: response.source,
          recipeDraft: {
            recipeId: response.recipe_draft.recipe_id,
            uploadIntakeId: response.recipe_draft.upload_intake_id,
            newRecipePlaceholder: response.recipe_draft.new_recipe_placeholder,
          },
          batchDraft: {
            proposedName: response.batch_draft.proposed_name,
            stage: response.batch_draft.stage,
          },
        };

        setState((prev) => ({ ...prev, isBusy: false, step: "ready-to-confirm", draftPreview }));
        return;
      }

      if (current.selectedSource === "new-recipe") {
        if (isDemoMode) {
          const draftPreview = toPreview({
            draftId: `demo-draft-${crypto.randomUUID()}`,
            source: current.selectedSource,
          });
          setState((prev) => ({ ...prev, isBusy: false, step: "ready-to-confirm", draftPreview }));
          return;
        }

        const response = await createBrewDraft({ source: "new-recipe" });
        const draftPreview = toPreview({ draftId: response.draft_id, source: response.source });
        setState((prev) => ({ ...prev, isBusy: false, step: "ready-to-confirm", draftPreview }));
        return;
      }

      // upload path
      const hasFile = Boolean(current.upload.file);
      const hasManualText = current.upload.manualText.trim().length > 0;
      if (!hasFile && !hasManualText) {
        throw new Error("Add a file or manual recipe text first");
      }

      let uploadIntake: RecipeUploadIntakeDraft;
      if (isDemoMode) {
        uploadIntake = buildDemoUploadIntake(current.upload);
      } else {
        const intakeResponse = await createRecipeUploadIntake({
          fileName: current.upload.file?.name ?? null,
          mimeType: current.upload.file?.type ?? null,
          fileSize: current.upload.file?.size ?? null,
          sourceType: current.upload.sourceType,
          manualText: hasManualText ? current.upload.manualText.trim() : null,
        });

        uploadIntake = {
          intakeId: intakeResponse.intake_id,
          fileName: intakeResponse.file_name,
          mimeType: intakeResponse.mime_type,
          sourceType: intakeResponse.source_type,
          fileSize: intakeResponse.file_size,
          manualText: intakeResponse.manual_text,
          parseStatus: intakeResponse.parse_status,
        };
      }

      const draftPreview = isDemoMode
        ? toPreview({
            draftId: `demo-draft-${crypto.randomUUID()}`,
            source: "upload-recipe",
            uploadIntakeId: uploadIntake.intakeId,
          })
        : toPreview({
            draftId: (await createBrewDraft({ source: "upload-recipe", uploadIntakeId: uploadIntake.intakeId })).draft_id,
            source: "upload-recipe",
            uploadIntakeId: uploadIntake.intakeId,
          });

      setState((prev) => ({
        ...prev,
        isBusy: false,
        step: "ready-to-confirm",
        uploadIntake,
        draftPreview,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isBusy: false,
        error: error instanceof Error ? error.message : "Failed to prepare draft",
      }));
    }
  }, [isDemoMode, state]);

  const canPrepareDraft = useMemo(() => {
    if (!state.selectedSource) return false;
    if (state.selectedSource === "existing-recipe") return Boolean(state.selectedRecipeId);
    if (state.selectedSource === "new-recipe") return true;
    return Boolean(state.upload.file) || state.upload.manualText.trim().length > 0;
  }, [state.selectedRecipeId, state.selectedSource, state.upload.file, state.upload.manualText]);

  return {
    state,
    existingRecipeOptions: DEFAULT_EXISTING_RECIPES,
    open,
    close,
    back,
    chooseSource,
    chooseExistingRecipe,
    chooseUploadPath,
    setUploadFile,
    setManualText,
    prepareDraft,
    canPrepareDraft,
  };
}
