-- Phase 1.B / B.21 — Knowledge Base Foundation
-- Builds the library-style storage layer before any ingestion, OCR, or AI flows.

-- Shared scope vocabulary for durable knowledge.
create table if not exists public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  brewery_id uuid references public.brewery_profiles(id) on delete restrict,
  source_key text not null,
  name text not null,
  source_type text not null,
  scope_tag text not null,
  description text,
  jurisdiction text,
  language text,
  source_quality text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint knowledge_sources_scope_tag_check
    check (scope_tag in ('[GENERIC]', '[REGIONAL: BE]', '[INSTANCE]', '[STRATEGY-DEFAULT]'))
);
create unique index if not exists knowledge_sources_shared_source_key_uidx
  on public.knowledge_sources(source_key)
  where brewery_id is null;
create unique index if not exists knowledge_sources_tenant_source_key_uidx
  on public.knowledge_sources(brewery_id, source_key)
  where brewery_id is not null;
create index if not exists knowledge_sources_brewery_id_idx on public.knowledge_sources(brewery_id);
create index if not exists knowledge_sources_scope_tag_idx on public.knowledge_sources(scope_tag);
create index if not exists knowledge_sources_source_type_idx on public.knowledge_sources(source_type);
create index if not exists knowledge_sources_jurisdiction_idx on public.knowledge_sources(jurisdiction);
create index if not exists knowledge_sources_active_idx on public.knowledge_sources(is_active);

create table if not exists public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.knowledge_sources(id) on delete restrict,
  document_key text not null,
  title text not null,
  document_type text not null,
  scope_tag text not null,
  status text not null default 'active',
  jurisdiction text,
  language text,
  effective_from date,
  effective_to date,
  superseded_at timestamptz,
  is_chunkable boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint knowledge_documents_scope_tag_check
    check (scope_tag in ('[GENERIC]', '[REGIONAL: BE]', '[INSTANCE]', '[STRATEGY-DEFAULT]')),
  constraint knowledge_documents_effective_window_check
    check (effective_to is null or effective_from is null or effective_to >= effective_from)
);
create unique index if not exists knowledge_documents_source_document_key_uidx
  on public.knowledge_documents(source_id, document_key);
create index if not exists knowledge_documents_source_id_idx on public.knowledge_documents(source_id);
create index if not exists knowledge_documents_scope_tag_idx on public.knowledge_documents(scope_tag);
create index if not exists knowledge_documents_document_type_idx on public.knowledge_documents(document_type);
create index if not exists knowledge_documents_jurisdiction_idx on public.knowledge_documents(jurisdiction);
create index if not exists knowledge_documents_status_idx on public.knowledge_documents(status);

create table if not exists public.knowledge_document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.knowledge_documents(id) on delete cascade,
  version_label text,
  version_number integer,
  source_uri text,
  storage_path text,
  mime_type text,
  checksum text,
  raw_text text,
  extracted_text text,
  citation_base text,
  metadata jsonb not null default '{}'::jsonb,
  is_current boolean not null default false,
  published_at timestamptz,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint knowledge_document_versions_version_number_check
    check (version_number is null or version_number >= 0)
);
create unique index if not exists knowledge_document_versions_current_uidx
  on public.knowledge_document_versions(document_id)
  where is_current;
create index if not exists knowledge_document_versions_document_id_idx on public.knowledge_document_versions(document_id);
create index if not exists knowledge_document_versions_is_current_idx on public.knowledge_document_versions(is_current);
create index if not exists knowledge_document_versions_published_at_idx on public.knowledge_document_versions(published_at);

create table if not exists public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_version_id uuid not null references public.knowledge_document_versions(id) on delete cascade,
  chunk_index integer not null,
  heading_path text,
  page_start integer,
  page_end integer,
  section_ref text,
  chunk_text text not null,
  chunk_summary text,
  workflow_stage_tag text,
  safety_tag text,
  confidence_score numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint knowledge_chunks_chunk_index_check
    check (chunk_index >= 0),
  constraint knowledge_chunks_page_window_check
    check (
      (page_start is null and page_end is null)
      or (page_start is not null and page_end is null and page_start >= 0)
      or (page_start is not null and page_end is not null and page_start >= 0 and page_end >= page_start)
    ),
  constraint knowledge_chunks_confidence_score_check
    check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 1))
);
create unique index if not exists knowledge_chunks_document_version_chunk_uidx
  on public.knowledge_chunks(document_version_id, chunk_index);
create index if not exists knowledge_chunks_document_version_id_idx on public.knowledge_chunks(document_version_id);
create index if not exists knowledge_chunks_workflow_stage_tag_idx on public.knowledge_chunks(workflow_stage_tag);
create index if not exists knowledge_chunks_safety_tag_idx on public.knowledge_chunks(safety_tag);

create table if not exists public.knowledge_document_links (
  id uuid primary key default gen_random_uuid(),
  from_document_id uuid not null references public.knowledge_documents(id) on delete cascade,
  to_document_id uuid not null references public.knowledge_documents(id) on delete cascade,
  link_type text not null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint knowledge_document_links_self_reference_check
    check (from_document_id <> to_document_id)
);
create unique index if not exists knowledge_document_links_unique_edge_uidx
  on public.knowledge_document_links(from_document_id, to_document_id, link_type);
create index if not exists knowledge_document_links_from_document_id_idx on public.knowledge_document_links(from_document_id);
create index if not exists knowledge_document_links_to_document_id_idx on public.knowledge_document_links(to_document_id);
create index if not exists knowledge_document_links_link_type_idx on public.knowledge_document_links(link_type);

alter table public.knowledge_sources enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.knowledge_document_versions enable row level security;
alter table public.knowledge_chunks enable row level security;
alter table public.knowledge_document_links enable row level security;

-- Shared knowledge (brewery_id is null) is readable by all authenticated tenants.
-- Tenant-owned knowledge stays isolated to the matching brewery_id.
drop policy if exists knowledge_sources_select_scoped on public.knowledge_sources;
create policy knowledge_sources_select_scoped
  on public.knowledge_sources
  for select
  to authenticated
  using (
    brewery_id is null
    or brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
  );

drop policy if exists knowledge_sources_insert_tenant_owned on public.knowledge_sources;
create policy knowledge_sources_insert_tenant_owned
  on public.knowledge_sources
  for insert
  to authenticated
  with check (brewery_id = (auth.jwt() ->> 'brewery_id')::uuid);

drop policy if exists knowledge_sources_update_tenant_owned on public.knowledge_sources;
create policy knowledge_sources_update_tenant_owned
  on public.knowledge_sources
  for update
  to authenticated
  using (brewery_id = (auth.jwt() ->> 'brewery_id')::uuid)
  with check (brewery_id = (auth.jwt() ->> 'brewery_id')::uuid);

drop policy if exists knowledge_sources_delete_tenant_owned on public.knowledge_sources;
create policy knowledge_sources_delete_tenant_owned
  on public.knowledge_sources
  for delete
  to authenticated
  using (brewery_id = (auth.jwt() ->> 'brewery_id')::uuid);

drop policy if exists knowledge_documents_select_scoped on public.knowledge_documents;
create policy knowledge_documents_select_scoped
  on public.knowledge_documents
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.knowledge_sources ks
      where ks.id = knowledge_documents.source_id
        and (
          ks.brewery_id is null
          or ks.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
        )
    )
  );

drop policy if exists knowledge_documents_insert_tenant_owned on public.knowledge_documents;
create policy knowledge_documents_insert_tenant_owned
  on public.knowledge_documents
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.knowledge_sources ks
      where ks.id = knowledge_documents.source_id
        and ks.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    )
  );

drop policy if exists knowledge_documents_update_tenant_owned on public.knowledge_documents;
create policy knowledge_documents_update_tenant_owned
  on public.knowledge_documents
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.knowledge_sources ks
      where ks.id = knowledge_documents.source_id
        and ks.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    )
  )
  with check (
    exists (
      select 1
      from public.knowledge_sources ks
      where ks.id = knowledge_documents.source_id
        and ks.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    )
  );

drop policy if exists knowledge_documents_delete_tenant_owned on public.knowledge_documents;
create policy knowledge_documents_delete_tenant_owned
  on public.knowledge_documents
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.knowledge_sources ks
      where ks.id = knowledge_documents.source_id
        and ks.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    )
  );

drop policy if exists knowledge_document_versions_select_scoped on public.knowledge_document_versions;
create policy knowledge_document_versions_select_scoped
  on public.knowledge_document_versions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.knowledge_documents kd
      join public.knowledge_sources ks on ks.id = kd.source_id
      where kd.id = knowledge_document_versions.document_id
        and (
          ks.brewery_id is null
          or ks.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
        )
    )
  );

drop policy if exists knowledge_document_versions_insert_tenant_owned on public.knowledge_document_versions;
create policy knowledge_document_versions_insert_tenant_owned
  on public.knowledge_document_versions
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.knowledge_documents kd
      join public.knowledge_sources ks on ks.id = kd.source_id
      where kd.id = knowledge_document_versions.document_id
        and ks.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    )
  );

drop policy if exists knowledge_document_versions_update_tenant_owned on public.knowledge_document_versions;
create policy knowledge_document_versions_update_tenant_owned
  on public.knowledge_document_versions
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.knowledge_documents kd
      join public.knowledge_sources ks on ks.id = kd.source_id
      where kd.id = knowledge_document_versions.document_id
        and ks.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    )
  )
  with check (
    exists (
      select 1
      from public.knowledge_documents kd
      join public.knowledge_sources ks on ks.id = kd.source_id
      where kd.id = knowledge_document_versions.document_id
        and ks.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    )
  );

drop policy if exists knowledge_document_versions_delete_tenant_owned on public.knowledge_document_versions;
create policy knowledge_document_versions_delete_tenant_owned
  on public.knowledge_document_versions
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.knowledge_documents kd
      join public.knowledge_sources ks on ks.id = kd.source_id
      where kd.id = knowledge_document_versions.document_id
        and ks.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    )
  );

drop policy if exists knowledge_chunks_select_scoped on public.knowledge_chunks;
create policy knowledge_chunks_select_scoped
  on public.knowledge_chunks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.knowledge_document_versions kv
      join public.knowledge_documents kd on kd.id = kv.document_id
      join public.knowledge_sources ks on ks.id = kd.source_id
      where kv.id = knowledge_chunks.document_version_id
        and (
          ks.brewery_id is null
          or ks.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
        )
    )
  );

drop policy if exists knowledge_chunks_insert_tenant_owned on public.knowledge_chunks;
create policy knowledge_chunks_insert_tenant_owned
  on public.knowledge_chunks
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.knowledge_document_versions kv
      join public.knowledge_documents kd on kd.id = kv.document_id
      join public.knowledge_sources ks on ks.id = kd.source_id
      where kv.id = knowledge_chunks.document_version_id
        and ks.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    )
  );

drop policy if exists knowledge_chunks_update_tenant_owned on public.knowledge_chunks;
create policy knowledge_chunks_update_tenant_owned
  on public.knowledge_chunks
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.knowledge_document_versions kv
      join public.knowledge_documents kd on kd.id = kv.document_id
      join public.knowledge_sources ks on ks.id = kd.source_id
      where kv.id = knowledge_chunks.document_version_id
        and ks.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    )
  )
  with check (
    exists (
      select 1
      from public.knowledge_document_versions kv
      join public.knowledge_documents kd on kd.id = kv.document_id
      join public.knowledge_sources ks on ks.id = kd.source_id
      where kv.id = knowledge_chunks.document_version_id
        and ks.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    )
  );

drop policy if exists knowledge_chunks_delete_tenant_owned on public.knowledge_chunks;
create policy knowledge_chunks_delete_tenant_owned
  on public.knowledge_chunks
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.knowledge_document_versions kv
      join public.knowledge_documents kd on kd.id = kv.document_id
      join public.knowledge_sources ks on ks.id = kd.source_id
      where kv.id = knowledge_chunks.document_version_id
        and ks.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    )
  );

drop policy if exists knowledge_document_links_select_scoped on public.knowledge_document_links;
create policy knowledge_document_links_select_scoped
  on public.knowledge_document_links
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.knowledge_documents kd_from
      join public.knowledge_sources ks_from on ks_from.id = kd_from.source_id
      where kd_from.id = knowledge_document_links.from_document_id
        and (
          ks_from.brewery_id is null
          or ks_from.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
        )
    )
    and exists (
      select 1
      from public.knowledge_documents kd_to
      join public.knowledge_sources ks_to on ks_to.id = kd_to.source_id
      where kd_to.id = knowledge_document_links.to_document_id
        and (
          ks_to.brewery_id is null
          or ks_to.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
        )
    )
  );

drop policy if exists knowledge_document_links_insert_tenant_owned on public.knowledge_document_links;
create policy knowledge_document_links_insert_tenant_owned
  on public.knowledge_document_links
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.knowledge_documents kd_from
      join public.knowledge_sources ks_from on ks_from.id = kd_from.source_id
      where kd_from.id = knowledge_document_links.from_document_id
        and ks_from.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    )
    and exists (
      select 1
      from public.knowledge_documents kd_to
      join public.knowledge_sources ks_to on ks_to.id = kd_to.source_id
      where kd_to.id = knowledge_document_links.to_document_id
        and (
          ks_to.brewery_id is null
          or ks_to.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
        )
    )
  );

drop policy if exists knowledge_document_links_update_tenant_owned on public.knowledge_document_links;
create policy knowledge_document_links_update_tenant_owned
  on public.knowledge_document_links
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.knowledge_documents kd_from
      join public.knowledge_sources ks_from on ks_from.id = kd_from.source_id
      where kd_from.id = knowledge_document_links.from_document_id
        and ks_from.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    )
  )
  with check (
    exists (
      select 1
      from public.knowledge_documents kd_from
      join public.knowledge_sources ks_from on ks_from.id = kd_from.source_id
      where kd_from.id = knowledge_document_links.from_document_id
        and ks_from.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    )
    and exists (
      select 1
      from public.knowledge_documents kd_to
      join public.knowledge_sources ks_to on ks_to.id = kd_to.source_id
      where kd_to.id = knowledge_document_links.to_document_id
        and (
          ks_to.brewery_id is null
          or ks_to.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
        )
    )
  );

drop policy if exists knowledge_document_links_delete_tenant_owned on public.knowledge_document_links;
create policy knowledge_document_links_delete_tenant_owned
  on public.knowledge_document_links
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.knowledge_documents kd_from
      join public.knowledge_sources ks_from on ks_from.id = kd_from.source_id
      where kd_from.id = knowledge_document_links.from_document_id
        and ks_from.brewery_id = (auth.jwt() ->> 'brewery_id')::uuid
    )
  );

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.knowledge_sources;
create trigger set_updated_at
before update on public.knowledge_sources
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.knowledge_documents;
create trigger set_updated_at
before update on public.knowledge_documents
for each row execute function public.set_updated_at();
