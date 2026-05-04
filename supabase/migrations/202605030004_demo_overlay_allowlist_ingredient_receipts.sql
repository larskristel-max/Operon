ALTER TABLE public.demo_overlay_records DROP CONSTRAINT IF EXISTS demo_overlay_records_table_name_check;
ALTER TABLE public.demo_overlay_records ADD CONSTRAINT demo_overlay_records_table_name_check CHECK (
  table_name IN (
    'batches',
    'batch_inputs',
    'brew_logs',
    'boil_additions',
    'fermentation_checks',
    'ingredient_receipts',
    'lots',
    'tanks',
    'inventory_movements',
    'pending_movements',
    'ingredients',
    'tasks',
    'recipes',
    'packaging_formats',
    'sales'
  )
);
