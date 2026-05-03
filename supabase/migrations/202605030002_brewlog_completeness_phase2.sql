-- Phase 2: Brewlog completeness foundation (schema readiness only)

-- Expand brew_logs with planned/actual brewday dossier fields.
ALTER TABLE public.brew_logs
  ADD COLUMN IF NOT EXISTS planned_mash_water_liters numeric,
  ADD COLUMN IF NOT EXISTS actual_mash_water_liters numeric,
  ADD COLUMN IF NOT EXISTS planned_strike_water_temp_c numeric,
  ADD COLUMN IF NOT EXISTS planned_sparge_water_liters numeric,
  ADD COLUMN IF NOT EXISTS actual_sparge_water_liters numeric,
  ADD COLUMN IF NOT EXISTS planned_sparge_temp_c numeric,
  ADD COLUMN IF NOT EXISTS actual_sparge_temp_c numeric,
  ADD COLUMN IF NOT EXISTS planned_pre_boil_gravity numeric,
  ADD COLUMN IF NOT EXISTS actual_pre_boil_gravity numeric,
  ADD COLUMN IF NOT EXISTS planned_original_gravity numeric,
  ADD COLUMN IF NOT EXISTS actual_original_gravity numeric,
  ADD COLUMN IF NOT EXISTS planned_final_gravity numeric,
  ADD COLUMN IF NOT EXISTS actual_final_gravity numeric,
  ADD COLUMN IF NOT EXISTS planned_ph_min numeric,
  ADD COLUMN IF NOT EXISTS planned_ph_max numeric,
  ADD COLUMN IF NOT EXISTS actual_mash_ph numeric,
  ADD COLUMN IF NOT EXISTS actual_sparge_duration_min integer,
  ADD COLUMN IF NOT EXISTS actual_last_runnings_gravity numeric,
  ADD COLUMN IF NOT EXISTS lautering_notes text,
  ADD COLUMN IF NOT EXISTS actual_cooling_temp_c numeric,
  ADD COLUMN IF NOT EXISTS actual_transfer_temp_c numeric,
  ADD COLUMN IF NOT EXISTS transfer_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS transfer_finished_at timestamptz,
  ADD COLUMN IF NOT EXISTS yeast_pitch_quantity numeric,
  ADD COLUMN IF NOT EXISTS yeast_pitch_unit text,
  ADD COLUMN IF NOT EXISTS yeast_pitch_time timestamptz;

-- Expand mash_steps with timing and execution status.
ALTER TABLE public.mash_steps
  ADD COLUMN IF NOT EXISTS actual_start_time timestamptz,
  ADD COLUMN IF NOT EXISTS actual_end_time timestamptz,
  ADD COLUMN IF NOT EXISTS step_status text;

-- Expand boil_additions for traceability and execution capture.
ALTER TABLE public.boil_additions
  ADD COLUMN IF NOT EXISTS ingredient_receipt_id uuid,
  ADD COLUMN IF NOT EXISTS batch_input_id uuid,
  ADD COLUMN IF NOT EXISTS target_temp_c numeric,
  ADD COLUMN IF NOT EXISTS actual_temp_c numeric,
  ADD COLUMN IF NOT EXISTS duration_min integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'boil_additions_ingredient_receipt_id_fkey'
      AND conrelid = 'public.boil_additions'::regclass
  ) THEN
    ALTER TABLE public.boil_additions
      ADD CONSTRAINT boil_additions_ingredient_receipt_id_fkey
      FOREIGN KEY (ingredient_receipt_id) REFERENCES public.ingredient_receipts(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'boil_additions_batch_input_id_fkey'
      AND conrelid = 'public.boil_additions'::regclass
  ) THEN
    ALTER TABLE public.boil_additions
      ADD CONSTRAINT boil_additions_batch_input_id_fkey
      FOREIGN KEY (batch_input_id) REFERENCES public.batch_inputs(id);
  END IF;
END $$;

-- Strengthen batch_inputs for role and movement linkage.
ALTER TABLE public.batch_inputs
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS is_traceability_required boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS inventory_movement_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'batch_inputs_inventory_movement_id_fkey'
      AND conrelid = 'public.batch_inputs'::regclass
  ) THEN
    ALTER TABLE public.batch_inputs
      ADD CONSTRAINT batch_inputs_inventory_movement_id_fkey
      FOREIGN KEY (inventory_movement_id) REFERENCES public.inventory_movements(id);
  END IF;
END $$;
