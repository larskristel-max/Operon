# Phase 1.B / B.6 - Batches compliance and brewsheet backbone

This rollout strengthens `public.batches` as the production-event anchor between raw-material traceability (`ingredient_receipts`) and finished-goods traceability (`lots`).

## What it adds

- `registered_at`: when the batch was recorded into the compliance register context
- batch-level production phase timestamps for brew, fermentation, and packaging windows
- `compliance_status`: a generic workflow state for batch compliance readiness
- `afsca_register_ref`: Belgian AFSCA register reference, scoped per brewery
- `brewsheet_status`, `brewsheet_generated_at`, and `brewsheet_version`: durable metadata for later brewsheet generation
- `is_compliance_required`: explicit switch for batches that do or do not require compliance tracking
- `tag`: explicit source/meaning marker with `[INSTANCE]` as the default
- lookup indexes for register reconstruction, AFSCA reference search, compliance workflow queues, phase-window filtering, and brewsheet workflow queues

## Modeling boundaries

`batches` is the production-run anchor. This migration only adds facts that describe the batch itself or its compliance/brewsheet workflow state.

It intentionally does not move or duplicate:

- supplier/source facts from `ingredient_receipts`
- finished lot dates, expiry, depletion, packaging state, or excise state from `lots`
- operational measurements or captured brewing readings from `brew_logs`
- formal filing state from `declarations`
- customer-specific numbering behavior into application code

Customer #1 may use the same value for `batch_number` and finished `lot_number`, but that remains a configurable brewery strategy through the existing configuration layer rather than a generic schema rule.

## Tagging/default logic

- Batch operational and compliance facts are brewery-scoped and default to `[INSTANCE]`.
- `compliance_status` and `brewsheet_status` are generic lifecycle/workflow concepts.
- `afsca_register_ref` has Belgian AFSCA meaning (`[REGIONAL: BE]`) while each stored value remains scoped to one brewery.
- Batch-equals-lot remains a strategy/default concern (`[STRATEGY-DEFAULT]`), not hardcoded behavior.

## Recommended rollout

1. Apply the Supabase migration.
2. Confirm existing `batches` rows remain valid and receive safe defaults for non-null fields.
3. Confirm indexes and check constraints exist.
4. Regenerate `src/types/supabase.ts` with `npm run gen:types`.
5. Run `npm run typecheck`, `npm run lint`, and `npm run build`.

## Out of scope

This change does not add UI, RAG, AI behavior, brewsheet PDF/XLSX generation, AC4/declaration workflows, task creation, Notion sync, or compliance exports.
