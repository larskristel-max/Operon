-- ============================================================
-- Operon BrewOS — Demo overlay table_name constraint update
-- Migration: 007_demo_overlay_extended_tables
-- Adds batch_inputs and fermentation_checks to the allowed
-- demo overlay tables.
-- ============================================================

DO $$
DECLARE
  existing_constraint_name text;
BEGIN
  SELECT con.conname
  INTO existing_constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE nsp.nspname = 'public'
    AND rel.relname = 'demo_overlay_records'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%table_name%'
  LIMIT 1;

  IF existing_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.demo_overlay_records DROP CONSTRAINT %I', existing_constraint_name);
  END IF;

  ALTER TABLE public.demo_overlay_records
    ADD CONSTRAINT demo_overlay_records_table_name_check
    CHECK (
      table_name = ANY (
        ARRAY[
          'batches',
          'tasks',
          'tanks',
          'lots',
          'ingredients',
          'inventory_movements',
          'recipes',
          'packaging_formats',
          'sales',
          'brew_logs',
          'batch_inputs',
          'fermentation_checks'
        ]::text[]
      )
    );
END $$;
