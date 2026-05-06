-- Phase 1.B / B.4 - Ingredient receipts traceability backbone
-- Extends raw-material receipt records for AFSCA-style backward traceability.

alter table public.ingredient_receipts
  add column if not exists receipt_reference text,
  add column if not exists supplier_reference text,
  add column if not exists supplier_invoice_reference text,
  add column if not exists supplier_vat_number text,
  add column if not exists origin_country_code text,
  add column if not exists manufactured_on date,
  add column if not exists use_by_date date,
  add column if not exists received_at timestamptz,
  add column if not exists quality_checked_at timestamptz,
  add column if not exists quality_checked_by_user_id uuid references public.users(id) on delete set null,
  add column if not exists quality_decision_notes text,
  add column if not exists storage_zone text,
  add column if not exists is_traceability_required boolean not null default true,
  add column if not exists tag text not null default '[INSTANCE]';

create index if not exists ingredient_receipts_quality_lookup_idx
  on public.ingredient_receipts(brewery_id, ingredient_id, quality_status, best_before_date);

create index if not exists ingredient_receipts_supplier_lot_idx
  on public.ingredient_receipts(brewery_id, supplier_lot_number);

create index if not exists ingredient_receipts_internal_lot_idx
  on public.ingredient_receipts(brewery_id, internal_lot_code);

create index if not exists ingredient_receipts_quality_checked_by_idx
  on public.ingredient_receipts(quality_checked_by_user_id);

create unique index if not exists ingredient_receipts_receipt_reference_unique_idx
  on public.ingredient_receipts(brewery_id, receipt_reference)
  where receipt_reference is not null;

alter table public.ingredient_receipts
  drop constraint if exists ingredient_receipts_quality_status_check;

alter table public.ingredient_receipts
  add constraint ingredient_receipts_quality_status_check
  check (
    quality_status = any (
      array['approved', 'on_hold', 'quarantined', 'rejected', 'expired']
    )
  );
