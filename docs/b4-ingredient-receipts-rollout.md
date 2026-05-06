# B.4 Ingredient Receipts Rollout

This change prepares `ingredient_receipts` to act as the backward-traceability anchor for raw materials.

## What it adds

- internal receipt reference
- supplier delivery and invoice references
- supplier VAT reference
- origin country
- manufacturing and use-by dates
- receipt timestamp
- quality review timestamp and reviewer link
- quality decision notes
- storage zone
- explicit `[INSTANCE]` tagging
- lookup indexes for ingredient lot selection and receipt tracing

## Recommended rollout

1. Apply the new Supabase migration.
2. Regenerate `src/types/supabase.ts` with `npm run gen:types`.
3. Commit the generated types file.
4. Open the PR and let CI verify there is no schema/type drift.

## Why types are not updated in this branch yet

The repo's generated Supabase types come from live database introspection. Because this branch prepares the schema change without applying it to the live database first, `src/types/supabase.ts` would still regenerate to the old shape right now.

Once the migration is applied in the target database, run `npm run gen:types` and commit the refreshed file.
