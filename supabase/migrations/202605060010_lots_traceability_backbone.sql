-- Phase 1.B / B.5 - Lots traceability backbone
-- Extends finished-goods lot records so production, packaging, stock, and sales
-- can all point at a durable finished-lot anchor.

alter table public.lots
  add column if not exists produced_at timestamptz,
  add column if not exists packaged_at timestamptz,
  add column if not exists best_before_date date,
  add column if not exists depleted_at timestamptz,
  add column if not exists archived_at timestamptz,
  add column if not exists is_traceability_required boolean not null default true,
  add column if not exists tag text not null default '[INSTANCE]';

create unique index if not exists lots_brewery_lot_number_unique_idx
  on public.lots(brewery_id, lot_number);

create index if not exists lots_batch_lookup_idx
  on public.lots(brewery_id, batch_id, lot_type);

create index if not exists lots_parent_lookup_idx
  on public.lots(brewery_id, parent_lot_id);

create index if not exists lots_packaging_lookup_idx
  on public.lots(brewery_id, packaging_format_id, packaging_state);

create index if not exists lots_status_excise_lookup_idx
  on public.lots(brewery_id, status, excise_state);

create index if not exists lots_lot_date_lookup_idx
  on public.lots(brewery_id, lot_date, best_before_date);
