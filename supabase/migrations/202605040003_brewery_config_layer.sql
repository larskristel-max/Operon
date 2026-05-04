-- Phase 1.B / B.20 — Brewery Config Layer
-- Introduces tenant-scoped configuration entities.

-- 1) Extend tenant root profile with explicit config fields.
alter table public.brewery_profiles
  add column if not exists trading_name text,
  add column if not exists excise_authorisation_number text,
  add column if not exists authorisation_holder text,
  add column if not exists address_line_1 text,
  add column if not exists address_line_2 text,
  add column if not exists postal_code text,
  add column if not exists city text,
  add column if not exists country_code text not null default 'BE',
  add column if not exists customs_office_name text,
  add column if not exists customs_office_email text,
  add column if not exists default_batch_number_format text,
  add column if not exists default_finished_lot_strategy text,
  add column if not exists default_vessel_volume_l numeric;

create index if not exists brewery_profiles_country_code_idx on public.brewery_profiles(country_code);

-- 2) Tenant-level settings with explicit tagging.
create table if not exists public.brewery_settings (
  id uuid primary key default gen_random_uuid(),
  brewery_id uuid not null references public.brewery_profiles(id) on delete restrict,
  setting_key text not null,
  setting_value jsonb not null,
  tag text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brewery_id, setting_key)
);
create index if not exists brewery_settings_brewery_id_idx on public.brewery_settings(brewery_id);
create index if not exists brewery_settings_setting_key_idx on public.brewery_settings(setting_key);
create index if not exists brewery_settings_tag_idx on public.brewery_settings(tag);

-- 3) Tenant supplier role mapping.
create table if not exists public.brewery_supplier_roles (
  id uuid primary key default gen_random_uuid(),
  brewery_id uuid not null references public.brewery_profiles(id) on delete restrict,
  supplier_name text not null,
  supplier_role text not null,
  supplier_type text,
  vat_number text,
  notes text,
  is_active boolean not null default true,
  tag text not null default '[INSTANCE]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists brewery_supplier_roles_brewery_id_idx on public.brewery_supplier_roles(brewery_id);
create index if not exists brewery_supplier_roles_active_idx on public.brewery_supplier_roles(brewery_id, is_active);
create index if not exists brewery_supplier_roles_role_idx on public.brewery_supplier_roles(supplier_role);

-- 4) Tenant overhead item registry.
create table if not exists public.brewery_overhead_items (
  id uuid primary key default gen_random_uuid(),
  brewery_id uuid not null references public.brewery_profiles(id) on delete restrict,
  name text not null,
  cost_category text not null,
  amount numeric not null,
  currency text not null default 'EUR',
  coverage_period_months numeric,
  monthly_equivalent numeric generated always as (
    case
      when coverage_period_months is null or coverage_period_months = 0 then null
      else amount / coverage_period_months
    end
  ) stored,
  supplier_name text,
  starts_on date,
  ends_on date,
  is_active boolean not null default true,
  tag text not null default '[INSTANCE]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists brewery_overhead_items_brewery_id_idx on public.brewery_overhead_items(brewery_id);
create index if not exists brewery_overhead_items_active_idx on public.brewery_overhead_items(brewery_id, is_active);
create index if not exists brewery_overhead_items_category_idx on public.brewery_overhead_items(cost_category);

-- RLS enablement
alter table public.brewery_profiles enable row level security;
alter table public.brewery_settings enable row level security;
alter table public.brewery_supplier_roles enable row level security;
alter table public.brewery_overhead_items enable row level security;

-- Tenant isolation policies using brewery_id from JWT.
drop policy if exists tenant_isolation_brewery_profiles on public.brewery_profiles;
create policy tenant_isolation_brewery_profiles
  on public.brewery_profiles
  for all
  to authenticated
  using (id = (auth.jwt() ->> 'brewery_id')::uuid)
  with check (id = (auth.jwt() ->> 'brewery_id')::uuid);

drop policy if exists tenant_isolation_brewery_settings on public.brewery_settings;
create policy tenant_isolation_brewery_settings
  on public.brewery_settings
  for all
  to authenticated
  using (brewery_id = (auth.jwt() ->> 'brewery_id')::uuid)
  with check (brewery_id = (auth.jwt() ->> 'brewery_id')::uuid);

drop policy if exists tenant_isolation_brewery_supplier_roles on public.brewery_supplier_roles;
create policy tenant_isolation_brewery_supplier_roles
  on public.brewery_supplier_roles
  for all
  to authenticated
  using (brewery_id = (auth.jwt() ->> 'brewery_id')::uuid)
  with check (brewery_id = (auth.jwt() ->> 'brewery_id')::uuid);

drop policy if exists tenant_isolation_brewery_overhead_items on public.brewery_overhead_items;
create policy tenant_isolation_brewery_overhead_items
  on public.brewery_overhead_items
  for all
  to authenticated
  using (brewery_id = (auth.jwt() ->> 'brewery_id')::uuid)
  with check (brewery_id = (auth.jwt() ->> 'brewery_id')::uuid);

-- Keep updated_at behavior aligned with existing schema pattern.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  foreach t in array array[
    'brewery_settings',
    'brewery_supplier_roles',
    'brewery_overhead_items'
  ] loop
    execute format(
      'drop trigger if exists set_updated_at on %I;
       create trigger set_updated_at
       before update on %I
       for each row execute function public.set_updated_at();',
      t,
      t
    );
  end loop;
end $$;
