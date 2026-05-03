import { useCallback, useMemo, useState } from "react";
import { createBatchAfterConfirmation, createBrewDraft } from "@/domains/batches/api";
import { writeDemoOverlay } from "@/domains/demo/api";
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

const initialBrewEntryState: BrewEntryState = {
  isOpen: false,
  step: "select-existing-recipe",
  selectedSource: "existing-recipe",
  selectedRecipeId: null,
  upload: EMPTY_UPLOAD,
  uploadIntake: null,
  draftPreview: null,
  isBusy: false,
  isConfirming: false,
  error: null,
  confirmedBatchName: null,
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
  nonPersistent: boolean;
}): BrewDraftPreview {
  return {
    draftId: input.draftId,
    status: "ready_to_confirm",
    source: input.source,
    nonPersistent: input.nonPersistent,
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
    nonPersistent: true,
  };
}

export function useBrewEntryFlow({
  isDemoMode,
  existingRecipes,
  onConfirmed,
}: {
  isDemoMode: boolean;
  existingRecipes: ExistingRecipeOption[];
  onConfirmed: () => Promise<void>;
}) {
  const [state, setState] = useState<BrewEntryState>(initialBrewEntryState);

  const existingRecipeOptions = useMemo<ExistingRecipeOption[]>(
    () => existingRecipes,
    [existingRecipes],
  );

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
        return { ...prev, selectedSource: source, step: "new-recipe-placeholder", error: null, draftPreview: null };
      }
      return { ...prev, selectedSource: source, step: "upload-recipe", error: null, draftPreview: null };
    });
  }, []);

  const openRecipeList = useCallback(() => {
    setState((prev) => ({ ...prev, step: "select-existing-recipe", selectedSource: "existing-recipe", error: null }));
  }, []);

  const chooseUploadPath = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedSource: "upload-recipe",
      step: "upload-recipe",
      selectedRecipeId: null,
      draftPreview: null,
      error: null,
      confirmedBatchName: null,
    }));
  }, []);

  const setManualText = useCallback((manualText: string) => {
    setState((prev) => ({
      ...prev,
      upload: { ...prev.upload, manualText },
      draftPreview: null,
      error: null,
      confirmedBatchName: null,
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
      confirmedBatchName: null,
    }));
  }, []);

  const back = useCallback(() => {
    setState((prev) => {
      if (prev.step === "ready-to-confirm") {
        if (prev.selectedSource === "existing-recipe") {
          return { ...prev, step: "select-existing-recipe", draftPreview: null, error: null };
        }
        return { ...prev, step: "upload-recipe", draftPreview: null, error: null };
      }
      if (prev.step === "select-existing-recipe") {
        return initialBrewEntryState;
      }
      if (prev.step === "upload-recipe") {
        return { ...prev, step: "select-existing-recipe", selectedSource: "existing-recipe", error: null };
      }
      if (prev.step === "new-recipe-placeholder") {
        return { ...prev, step: "select-existing-recipe", selectedSource: "existing-recipe", error: null };
      }
      if (prev.step === "existing-recipe-options") {
        return initialBrewEntryState;
      }
      return prev;
    });
  }, []);

  const prepareDraft = useCallback(
    async (input?: { source: BrewEntrySource; recipeId?: string }) => {
      setState((prev) => ({ ...prev, isBusy: true, error: null }));

      try {
        const current = state;
        const source = input?.source ?? current.selectedSource;
        if (!source) {
          throw new Error("Recipe source is required");
        }

        if (source === "new-recipe") {
          const preview = toPreview({
            draftId: `new-recipe-boundary-${crypto.randomUUID()}`,
            source: "new-recipe",
            nonPersistent: true,
          });
          setState((prev) => ({ ...prev, isBusy: false, step: "new-recipe-placeholder", draftPreview: preview }));
          return;
        }

        if (source === "existing-recipe") {
          const selectedRecipeId = input?.recipeId ?? current.selectedRecipeId;
          if (!selectedRecipeId) {
            throw new Error("Select an existing recipe first");
          }

          const selectedRecipeIsAvailable = existingRecipeOptions.some((recipe) => recipe.id === selectedRecipeId);
          if (!selectedRecipeIsAvailable) {
            throw new Error("Selected recipe is not available");
          }

          if (isDemoMode) {
            const draftPreview = toPreview({
              draftId: `demo-draft-${crypto.randomUUID()}`,
              source,
              recipeId: selectedRecipeId,
              nonPersistent: true,
            });

            setState((prev) => ({
              ...prev,
              selectedSource: source,
              selectedRecipeId,
              isBusy: false,
              step: "ready-to-confirm",
              draftPreview,
            }));
            return;
          }

          const response = await createBrewDraft({
            source: "existing-recipe",
            recipeId: selectedRecipeId,
          });

          const draftPreview = toPreview({
            draftId: response.draft_id,
            source: response.source,
            recipeId: response.recipe_draft.recipe_id,
            uploadIntakeId: response.recipe_draft.upload_intake_id,
            nonPersistent: response.non_persistent,
          });

          setState((prev) => ({
            ...prev,
            selectedSource: source,
            selectedRecipeId,
            isBusy: false,
            step: "ready-to-confirm",
            draftPreview,
          }));
          return;
        }

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
          nonPersistent: intakeResponse.non_persistent,
        };
      }

      const draftPreview = isDemoMode
        ? toPreview({
            draftId: `demo-draft-${crypto.randomUUID()}`,
            source: "upload-recipe",
            uploadIntakeId: uploadIntake.intakeId,
            nonPersistent: true,
          })
        : toPreview({
            draftId: (await createBrewDraft({ source: "upload-recipe", uploadIntakeId: uploadIntake.intakeId })).draft_id,
            source: "upload-recipe",
            uploadIntakeId: uploadIntake.intakeId,
            nonPersistent: uploadIntake.nonPersistent,
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
    },
    [existingRecipeOptions, isDemoMode, state],
  );

  const chooseExistingRecipe = useCallback(
    (recipeId: string) => {
      if (recipeId.startsWith("recipe-placeholder-")) {
        return;
      }

      setState((prev) => ({
        ...prev,
        selectedSource: "existing-recipe",
        selectedRecipeId: recipeId,
        step: "ready-to-confirm",
        error: null,
        draftPreview: null,
        confirmedBatchName: null,
      }));
      void prepareDraft({ source: "existing-recipe", recipeId });
    },
    [prepareDraft],
  );

  const confirmDraft = useCallback(async (batchNumber?: string) => {
    const current = state;
    if (!current.draftPreview || !current.selectedSource || current.selectedSource === "new-recipe") {
      setState((prev) => ({ ...prev, error: "Prepare a draft first" }));
      return;
    }

    const selectedRecipeName = existingRecipeOptions.find((recipe) => recipe.id === current.selectedRecipeId)?.name ?? null;
    const fallbackName = current.selectedSource === "upload-recipe" ? "Uploaded Recipe Batch" : "New Batch";
    const batchName = selectedRecipeName ?? fallbackName;

    setState((prev) => ({ ...prev, isConfirming: true, step: "confirming", error: null }));

    try {
      if (isDemoMode) {
        const recordId = crypto.randomUUID();
        await writeDemoOverlay({
          table_name: "batches",
          record_id: recordId,
          operation: "insert",
          payload: {
            id: recordId,
            brewery_id: "00000000-0000-4000-8000-0000000d3110",
            recipe_id: current.selectedRecipeId,
            name: batchName,
            status: "planned",
            created_at: new Date().toISOString(),
          },
        });
      } else {
        await createBatchAfterConfirmation({
          source: current.selectedSource,
          recipeId: current.selectedRecipeId,
          uploadIntakeId: current.uploadIntake?.intakeId ?? current.draftPreview.recipeDraft.uploadIntakeId,
          draftId: current.draftPreview.draftId,
          batchNumber: batchNumber?.trim() ? batchNumber.trim() : undefined,
        });
      }

      await onConfirmed();
      setState((prev) => ({ ...prev, isConfirming: false, step: "confirmed", confirmedBatchName: batchName }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isConfirming: false,
        step: "ready-to-confirm",
        error: error instanceof Error ? error.message : "Could not create batch. Try again.",
      }));
    }
  }, [existingRecipeOptions, isDemoMode, onConfirmed, state]);

  const canPrepareDraft = useMemo(() => {
    if (!state.selectedSource) return false;
    if (state.selectedSource === "existing-recipe") {
      const selectedRecipeId = state.selectedRecipeId;
      if (!selectedRecipeId) return false;
      return existingRecipeOptions.some((recipe) => recipe.id === selectedRecipeId);
    }
    if (state.selectedSource === "new-recipe") return false;
    return Boolean(state.upload.file) || state.upload.manualText.trim().length > 0;
  }, [existingRecipeOptions, state.selectedRecipeId, state.selectedSource, state.upload.file, state.upload.manualText]);

  return {
    state,
    existingRecipeOptions,
    hasConnectedRecipes: existingRecipeOptions.length > 0,
    open,
    close,
    back,
    chooseSource,
    openRecipeList,
    chooseExistingRecipe,
    chooseUploadPath,
    setUploadFile,
    setManualText,
    prepareDraft,
    confirmDraft,
    canPrepareDraft,
  };
}
