ALTER TABLE demo_overlay_records
DROP CONSTRAINT demo_overlay_table_name_whitelist;

ALTER TABLE demo_overlay_records
ADD CONSTRAINT demo_overlay_table_name_whitelist
CHECK (
  table_name IN (
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
    'fermentation_checks',
    'batch_inputs'
  )
);
