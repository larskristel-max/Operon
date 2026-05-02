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

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ingredients' AND column_name='ingredient_type') THEN
    RAISE EXCEPTION 'Schema integrity failed: ingredients.ingredient_type missing';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='batches' AND column_name='brewery_id') THEN
    RAISE EXCEPTION 'Schema integrity failed: batches.brewery_id missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='batches' AND column_name='recipe_id') THEN
    RAISE EXCEPTION 'Schema integrity failed: batches.recipe_id missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='batches' AND column_name='status') THEN
    RAISE EXCEPTION 'Schema integrity failed: batches.status missing';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='batch_inputs' AND column_name='batch_id') THEN
    RAISE EXCEPTION 'Schema integrity failed: batch_inputs.batch_id missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='batch_inputs' AND column_name='ingredient_id') THEN
    RAISE EXCEPTION 'Schema integrity failed: batch_inputs.ingredient_id missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='batch_inputs' AND column_name='quantity') THEN
    RAISE EXCEPTION 'Schema integrity failed: batch_inputs.quantity missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='batch_inputs' AND column_name='unit') THEN
    RAISE EXCEPTION 'Schema integrity failed: batch_inputs.unit missing';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='demo_overlay_records' AND column_name='table_name') THEN
    RAISE EXCEPTION 'Schema integrity failed: demo_overlay_records.table_name missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='demo_overlay_records' AND column_name='operation') THEN
    RAISE EXCEPTION 'Schema integrity failed: demo_overlay_records.operation missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='demo_overlay_records' AND column_name='payload') THEN
    RAISE EXCEPTION 'Schema integrity failed: demo_overlay_records.payload missing';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ingredients_ingredient_type_check') THEN RAISE EXCEPTION 'Schema integrity failed: ingredients_ingredient_type_check missing'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='batch_inputs_quantity_positive') THEN RAISE EXCEPTION 'Schema integrity failed: batch_inputs_quantity_positive missing'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='batch_inputs_unit_present') THEN RAISE EXCEPTION 'Schema integrity failed: batch_inputs_unit_present missing'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='batches_status_valid_check') THEN RAISE EXCEPTION 'Schema integrity failed: batches_status_valid_check missing'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='demo_overlay_records_table_name_check') THEN RAISE EXCEPTION 'Schema integrity failed: demo_overlay_records_table_name_check missing'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='demo_overlay_records_operation_check') THEN RAISE EXCEPTION 'Schema integrity failed: demo_overlay_records_operation_check missing'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='demo_overlay_records_payload_object_check') THEN RAISE EXCEPTION 'Schema integrity failed: demo_overlay_records_payload_object_check missing'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='recipes_id_brewery_id_unique') THEN RAISE EXCEPTION 'Schema integrity failed: recipes_id_brewery_id_unique missing'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='batches_recipe_brewery_fk') THEN RAISE EXCEPTION 'Schema integrity failed: batches_recipe_brewery_fk missing'; END IF;
END $$;
