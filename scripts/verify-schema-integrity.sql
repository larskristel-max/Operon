SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('batches','batch_inputs','brew_logs','ingredients','demo_overlay_records');
SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='ingredients' AND column_name='ingredient_type';
SELECT conname FROM pg_constraint WHERE conname IN ('ingredients_ingredient_type_check','demo_overlay_records_table_name_check','demo_overlay_records_operation_check','demo_overlay_records_payload_object_check','batch_inputs_quantity_positive','batch_inputs_unit_present');
