-- ingredient classification
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS ingredient_type text;

UPDATE public.ingredients
SET ingredient_type = CASE
  WHEN coalesce(lower(category),'') LIKE '%malt%' OR coalesce(lower(name),'') LIKE '%malt%' OR coalesce(lower(name),'') LIKE '%grain%' THEN 'malt'
  WHEN coalesce(lower(category),'') LIKE '%hop%' OR coalesce(lower(name),'') LIKE '%hop%' THEN 'hops'
  WHEN coalesce(lower(category),'') LIKE '%yeast%' OR coalesce(lower(name),'') LIKE '%yeast%' THEN 'yeast'
  WHEN coalesce(lower(category),'') LIKE '%sugar%' OR coalesce(lower(name),'') LIKE '%sugar%' THEN 'sugar'
  WHEN coalesce(lower(category),'') LIKE '%adjunct%' OR coalesce(lower(name),'') LIKE '%adjunct%' THEN 'adjunct'
  WHEN coalesce(lower(category),'') LIKE '%water%' THEN 'water_additive'
  WHEN coalesce(lower(category),'') LIKE '%process%' THEN 'processing_aid'
  WHEN coalesce(lower(category),'') LIKE '%pack%' OR coalesce(lower(name),'') LIKE '%bottle%' OR coalesce(lower(name),'') LIKE '%label%' THEN 'packaging'
  WHEN coalesce(lower(category),'') LIKE '%clean%' OR coalesce(lower(name),'') LIKE '%sanit%' OR coalesce(lower(name),'') LIKE '%caustic%' THEN 'cleaning'
  ELSE 'other'
END
WHERE ingredient_type IS NULL;

ALTER TABLE public.ingredients ALTER COLUMN ingredient_type SET DEFAULT 'other';
ALTER TABLE public.ingredients ALTER COLUMN ingredient_type SET NOT NULL;
ALTER TABLE public.ingredients DROP CONSTRAINT IF EXISTS ingredients_ingredient_type_check;
ALTER TABLE public.ingredients ADD CONSTRAINT ingredients_ingredient_type_check CHECK (ingredient_type IN ('malt','hops','yeast','adjunct','sugar','water_additive','processing_aid','packaging','cleaning','other'));

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'batch_inputs_quantity_positive') THEN
    ALTER TABLE public.batch_inputs ADD CONSTRAINT batch_inputs_quantity_positive CHECK (quantity > 0);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'batch_inputs_unit_present') THEN
    ALTER TABLE public.batch_inputs ADD CONSTRAINT batch_inputs_unit_present CHECK (length(trim(unit)) > 0);
  END IF;
END $$;

ALTER TABLE public.batches ALTER COLUMN brewery_id SET NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'batches_status_valid_check') THEN
    ALTER TABLE public.batches ADD CONSTRAINT batches_status_valid_check CHECK (status IN ('planned','brewing','fermenting','conditioning','ready','packaged','archived'));
  END IF;
END $$;

ALTER TABLE public.demo_overlay_records DROP CONSTRAINT IF EXISTS demo_overlay_records_table_name_check;
ALTER TABLE public.demo_overlay_records ADD CONSTRAINT demo_overlay_records_table_name_check CHECK (
  table_name IN ('batches','batch_inputs','brew_logs','fermentation_checks','lots','tanks','inventory_movements','pending_movements','ingredients')
);
ALTER TABLE public.demo_overlay_records DROP CONSTRAINT IF EXISTS demo_overlay_records_operation_check;
ALTER TABLE public.demo_overlay_records ADD CONSTRAINT demo_overlay_records_operation_check CHECK (operation IN ('insert','update','delete'));
ALTER TABLE public.demo_overlay_records DROP CONSTRAINT IF EXISTS demo_overlay_records_payload_object_check;
ALTER TABLE public.demo_overlay_records ADD CONSTRAINT demo_overlay_records_payload_object_check CHECK (jsonb_typeof(payload) = 'object');
