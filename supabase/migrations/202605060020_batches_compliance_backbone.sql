-- Phase 1.B / B.6 - Batches compliance and brewsheet backbone
-- Extends the production-run anchor with durable compliance metadata used to
-- reconstruct AFSCA register views and generate batch brewsheets later.
-- Raw-material receipt facts remain on ingredient_receipts; finished-lot facts
-- remain on lots; operational measurements remain on brew_logs.

alter table public.batches
  add column if not exists registered_at timestamptz,
  add column if not exists brew_started_at timestamptz,
  add column if not exists brew_completed_at timestamptz,
  add column if not exists fermentation_started_at timestamptz,
  add column if not exists fermentation_completed_at timestamptz,
  add column if not exists packaging_started_at timestamptz,
  add column if not exists packaging_completed_at timestamptz,
  add column if not exists compliance_status text not null default 'pending',
  add column if not exists afsca_register_ref text,
  add column if not exists brewsheet_status text not null default 'not_generated',
  add column if not exists brewsheet_generated_at timestamptz,
  add column if not exists brewsheet_version integer not null default 1,
  add column if not exists is_compliance_required boolean not null default true,
  add column if not exists tag text not null default '[INSTANCE]';

create index if not exists batches_register_lookup_idx
  on public.batches(brewery_id, registered_at, batch_number);

create unique index if not exists batches_afsca_register_ref_unique_idx
  on public.batches(brewery_id, afsca_register_ref)
  where afsca_register_ref is not null;

create index if not exists batches_compliance_workflow_idx
  on public.batches(brewery_id, is_compliance_required, compliance_status);

create index if not exists batches_brew_window_idx
  on public.batches(brewery_id, brew_started_at, brew_completed_at);

create index if not exists batches_fermentation_window_idx
  on public.batches(brewery_id, fermentation_started_at, fermentation_completed_at);

create index if not exists batches_packaging_window_idx
  on public.batches(brewery_id, packaging_started_at, packaging_completed_at);

create index if not exists batches_brewsheet_workflow_idx
  on public.batches(brewery_id, brewsheet_status, brewsheet_generated_at);

create index if not exists batches_tag_idx
  on public.batches(tag);

alter table public.batches
  drop constraint if exists batches_compliance_status_check;

alter table public.batches
  add constraint batches_compliance_status_check
  check (
    compliance_status = any (
      array['pending', 'ready', 'blocked', 'registered', 'not_required']
    )
  );

alter table public.batches
  drop constraint if exists batches_brewsheet_status_check;

alter table public.batches
  add constraint batches_brewsheet_status_check
  check (
    brewsheet_status = any (
      array['not_generated', 'queued', 'generated', 'superseded', 'failed']
    )
  );

alter table public.batches
  drop constraint if exists batches_brewsheet_version_check;

alter table public.batches
  add constraint batches_brewsheet_version_check
  check (brewsheet_version >= 1);

alter table public.batches
  drop constraint if exists batches_tag_check;

alter table public.batches
  add constraint batches_tag_check
  check (
    tag = any (
      array['[INSTANCE]', '[GENERIC]', '[REGIONAL: BE]', '[STRATEGY-DEFAULT]']
    )
  );
