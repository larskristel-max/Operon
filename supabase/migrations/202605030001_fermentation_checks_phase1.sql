-- Phase 1: fermentation_checks compatibility + batch-level projection support
-- Safe, idempotent migration (repo-only; do not apply from Codex)

ALTER TABLE public.fermentation_checks
  ADD COLUMN IF NOT EXISTS batch_id uuid,
  ADD COLUMN IF NOT EXISTS measured_at timestamptz,
  ADD COLUMN IF NOT EXISTS reading_type text,
  ADD COLUMN IF NOT EXISTS is_stable_fg_check boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fermentation_checks_batch_id_fkey'
      AND conrelid = 'public.fermentation_checks'::regclass
  ) THEN
    ALTER TABLE public.fermentation_checks
      ADD CONSTRAINT fermentation_checks_batch_id_fkey
      FOREIGN KEY (batch_id)
      REFERENCES public.batches(id)
      ON DELETE SET NULL;
  END IF;
END $$;

UPDATE public.fermentation_checks fc
SET batch_id = bl.batch_id
FROM public.brew_logs bl
WHERE fc.brew_log_id = bl.id
  AND fc.batch_id IS NULL;

UPDATE public.fermentation_checks
SET measured_at = CASE
  WHEN check_date IS NOT NULL AND check_time IS NOT NULL THEN (check_date::timestamp + check_time)::timestamptz
  WHEN check_date IS NOT NULL AND check_time IS NULL THEN check_date::timestamp::timestamptz
  ELSE NULL
END
WHERE measured_at IS NULL;

UPDATE public.fermentation_checks
SET reading_type = check_type
WHERE reading_type IS NULL
  AND check_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS fermentation_checks_batch_id_idx
  ON public.fermentation_checks(batch_id);

CREATE INDEX IF NOT EXISTS fermentation_checks_brew_log_id_idx
  ON public.fermentation_checks(brew_log_id);

CREATE INDEX IF NOT EXISTS fermentation_checks_measured_at_idx
  ON public.fermentation_checks(measured_at);
