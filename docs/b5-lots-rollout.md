# Phase 1.B / B.5 - Lots traceability backbone

This rollout prepares `public.lots` to become the finished-goods traceability anchor.

## What it adds

- `produced_at`: when the lot was created from production output
- `packaged_at`: when the lot entered packaged form
- `best_before_date`: finished-goods shelf-life marker
- `depleted_at`: when stock was exhausted
- `archived_at`: when the lot was administratively closed out
- `is_traceability_required`: explicit forward-traceability flag
- `tag`: `[INSTANCE]` ownership marker for brewery-specific lot facts

## Why this matters

`lots` already links batches, parent lots, packaging formats, sales, and inventory movements.
This migration turns that existing graph into a more durable operational record so Operon can answer:

- which batch created this finished lot?
- was this lot packaged or still bulk?
- when was it produced, packaged, depleted, or archived?
- what expiry/shelf-life date applied?
- which sale or movement referenced it later?

## Important modeling decision

This keeps lifecycle timing separate from existing status enums:

- `status` remains the operational stock state (`active`, `depleted`, `archived`)
- `packaging_state` remains packaging-specific
- `excise_state` remains compliance-specific
- timestamps explain when those lifecycle transitions happened

## Notes

This PR intentionally prepares the schema first.
Generated `src/types/supabase.ts` should be refreshed after the migration is applied to the live Supabase project.
