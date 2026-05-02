DO $$
DECLARE
  missing_count integer;
BEGIN
  SELECT count(*) INTO missing_count
  FROM (VALUES ('batches'),('batch_inputs'),('brew_logs'),('ingredients'),('demo_overlay_records')) AS required(name)
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = required.name
  );
  IF missing_count > 0 THEN
    RAISE EXCEPTION 'Schema integrity failed: missing required tables';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='ingredients' AND column_name='ingredient_type'
  ) THEN
    RAISE EXCEPTION 'Schema integrity failed: ingredients.ingredient_type missing';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ingredients_ingredient_type_check') THEN
    RAISE EXCEPTION 'Schema integrity failed: ingredients_ingredient_type_check missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='batch_inputs_quantity_positive') THEN
    RAISE EXCEPTION 'Schema integrity failed: batch_inputs_quantity_positive missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='batch_inputs_unit_present') THEN
    RAISE EXCEPTION 'Schema integrity failed: batch_inputs_unit_present missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='demo_overlay_records_table_name_check') THEN
    RAISE EXCEPTION 'Schema integrity failed: demo_overlay_records_table_name_check missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='demo_overlay_records_operation_check') THEN
    RAISE EXCEPTION 'Schema integrity failed: demo_overlay_records_operation_check missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='demo_overlay_records_payload_object_check') THEN
    RAISE EXCEPTION 'Schema integrity failed: demo_overlay_records_payload_object_check missing';
  END IF;
END $$;
