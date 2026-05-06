# Operon — Project Handoff Document

**Status as of**: 2026-05-06  
**Owner**: Lars Kristel (head brewer, Brasserie du Château de Durbuy; building Operon as a self-funded side project)  
**Repo**: github.com/larskristel-max/Operon  
**Live app**: https://operon-eqw.pages.dev  
**Supabase project**: operon-prod (`curjxdjlrlenqlitdspd`)

---

## 0. How to use this document

This document is the current handoff source for Operon. It is intended for a fresh AI coding agent or developer to understand:

- what Operon is
- what has been built
- where the build phase currently stands
- what architectural decisions are binding
- what to implement next
- how the future generic RAG system fits into the existing generic/regional/instance model

The current build state is:

```text
Track 1 — V1 Durbuy Ship
Phase 1.A — Foundation Fixes: COMPLETE
Phase 1.B — Compliance Backbone: ACTIVE
Current active PR: #101 — Phase 1.B / B.5 lots forward traceability
```

---

## 1. What Operon is

Operon is a mobile-first brewery operating system that turns brewing into a continuous, guided workflow. It is not a passive dashboard or a data tracker.

The core loop:

```text
Act → Record → Understand → Act again
```

Three surfaces:

- **Dashboard** = signal: what needs attention
- **Batch** = workspace: where work happens
- **Tasks** = actions: what to do next

Three layers under the surface:

- **Supabase** = facts: what is true
- **Semantic / knowledge layer** = meaning: what facts imply
- **UI** = action: what the operator should do now

One-line vision:

```text
Operon's objective is to run the brewery with you, not just record what you do.
```

---

## 2. Customer #1 — Brasserie du Château de Durbuy

Customer #1 is the real brewery Operon is being built for first. All customer-specific data must remain scoped and must not become hardcoded generic product logic.

### Identity

- Name: Brasserie du Château de Durbuy
- Location: Durbuy, Ardennes, Belgium
- EA number: `BE1L005888999`
- VAT: BE 0553.910.976
- Authorisation holder: Jean-Michel d'Ursel
- Customs authority: Libramont
- Customs email: `da.succ.libramont@minfin.fed.be`

### Operating reality

- Recipes currently scaled around 100 L brews in the app context
- Real brewery also has larger production equipment and historical operational data outside the app
- Batch numbering: `YY-NNN`, e.g. `26-001`, `26-002`
- Customer #1 finished-product-lot strategy: `batch_equals_lot`
- Known real batches: `26-001 Blonde`, `26-002 IPA`
- Compliance layers: AFSCA / food safety and Douanes / excise production

### Supplier and compliance context

- Brewpark: commodity and cost-optimization supplier
- HVB-IMTC: flexible/fallback supplier
- SBI: chemical/process supplier
- Brasserie Minne: bottle supplier
- Securex / SD Worx: HR / social administration context
- Cohézio / Securex-type prevention context for workplace safety

---

## 3. Binding principles

### 3.1 Four-tag taxonomy

Every fact, field, default, rule, and knowledge item must be classified as one of:

- **`[INSTANCE]`** — specific to one brewery; scoped by `brewery_id`
- **`[GENERIC]`** — true for breweries in general
- **`[REGIONAL: BE]`** — Belgian regulatory / market / compliance truth
- **`[STRATEGY-DEFAULT]`** — common recommendation that a brewery may override

If the tag is unclear, do not hardcode it.

### 3.2 Pattern B only

All operational data access goes through Cloudflare Functions in `functions/api/*`.

Frontend Supabase usage is allowed only for auth/session handling. Direct frontend operational Supabase queries are forbidden.

### 3.3 UX as first-class

Every screen should answer:

```text
What is happening?
What does it mean?
What should I do?
```

Empty, loading, and error states are part of the definition of done.

### 3.4 Compliance is not an add-on

Operon must be able to reconstruct:

```text
ingredient receipt → lot → batch → finished lot → movement/sale/release
```

For Belgium, food-safety compliance and excise-production compliance must remain aligned through shared production traceability.

### 3.5 No paid complexity before revenue

Paid AI, paid analytics, paid auth, or other paid infrastructure must not be introduced until there is a clear revenue reason.

---

## 4. Architecture decisions already made

### Auth and tenant isolation

- Supabase Auth is used.
- Tenant-scoped tables use `brewery_id`.
- RLS policies read `brewery_id` from a top-level JWT claim.
- `public.custom_access_token_hook(jsonb)` injects `brewery_id` into JWT claims.
- Hook resolution:
  1. fast path: `auth.users.app_metadata.brewery_id`
  2. fallback: `public.users.brewery_id`

### Users policy split

- SELECT: user can see self or same-brewery users
- UPDATE: self-only and cannot change own `brewery_id`
- INSERT/DELETE: not available to authenticated role; provisioning uses service role through Cloudflare Functions

### Inventory baseline architecture

`inventory_baselines` supports:

- `historical_compliance`
- `operational_seed`
- `periodic_snapshot`

Customer #1's 2026-02-24 baseline is historical compliance. Go-live inventory must be captured fresh as operational seed.

### Finished-product-lot strategy

Per-brewery strategy:

- `batch_equals_lot`
- `separate_lot_numbering`
- `blended_lot`

Customer #1 uses `batch_equals_lot`. This is not a universal product rule.

### Declared-format equivalence

When physical packaging differs from declared excise format, preserve both:

- physical/internal format
- declared compliance format

Declared volume must match actual released volume. Never distort volume to fit a format.

---

## 5. Current GitHub build state

### Phase 1.A — Foundation Fixes: COMPLETE

Merged work:

- **PR #88** — Auth hook + tenant RLS policies
- **PR #89** — remove duplicate `ingredient_receipts` from function/dashboard payload types
- **PR #90** — remove legacy BrewOS Pages references
- **PR #91** — ESLint configuration + lint workflow
- **PR #92** — Supabase type generation + CI drift check
- **PR #93** — remove frontend Supabase DB layer; Pattern B only
- **PR #94** — remove remaining duplicate `ingredient_receipts` declarations in `src/domains/*`
- **PR #95** — harden lint workflow triggers for Codex PR updates
- **PR #98** — workflow to regenerate Supabase types on PR/manual runs

### Phase 1.B — Compliance Backbone: ACTIVE

Merged / active work:

- **PR #96** — Phase 1.B / B.20: brewery config layer schema with tenant RLS — MERGED
- **PR #99** — Phase 1.B / B.4: extend `ingredient_receipts` for backward traceability — MERGED
- **PR #100** — types sync after B.4 — CLOSED, not merged because it had no net diff
- **PR #101** — Phase 1.B / B.5: extend `lots` for finished-goods traceability — OPEN DRAFT, mergeable, Cloudflare preview successful

### Current precise phase

```text
Track 1 — Phase 1.B, early-to-mid stage.
B.4 is done.
B.5 is in progress.
B.20 was completed early.
```

The app has moved past foundation hardening and is now building the durable compliance / traceability backbone.

---

## 6. Phase 1.B compliance backbone roadmap

Existing roadmap items:

- **B.1** Migrate HACCP from Notion to Supabase + wire entities (`haccp_ccps`, `haccp_hazards`)
- **B.2** Add `ccp_monitoring_logs`
- **B.3** Extend `declarations` for pre-brew + monthly excise filings
- **B.4** Extend `ingredient_receipts` for AFSCA backward traceability — DONE
- **B.5** Extend `lots` for forward traceability — ACTIVE PR #101
- **B.6** Extend `batches` for AFSCA register + brewsheet generation
- **B.7** Add `quality_control_checks`
- **B.8** Add `by_products` / `waste_outputs`
- **B.9** Extend `sales` / `inventory_movements` for finished-product accounting
- **B.10** Extend `recipes` / `recipe_ingredients` for Brewfather parity
- **B.11** Extend `ingredients` with cost / supplier data
- **B.12** Add compliance state machine on `batches.status`
- **B.13** Add `batch_costs` + `batch_cost_summary`
- **B.14** Add `prepaid_expenses`
- **B.15** Add `release_events` + `ac4_declarations`
- **B.16** Add `stock_zone_snapshots` + zone classification view
- **B.17** Add `product_aliases`
- **B.18** Add `dispatch_items` + `task_states` enum + routing taxonomy
- **B.19** Add `invoice_lot_links`
- **B.20** Add brewery-config tables — DONE
- **B.21** Add generic / regional / instance knowledge base foundation for future RAG — NEW

Recommended next order after PR #101:

1. Finish / merge B.5 if review passes
2. B.6 `batches` compliance fields and brewsheet generation support
3. B.21 knowledge base foundation
4. B.3 declarations
5. B.1 / B.2 HACCP + CCP monitoring
6. B.15 release events + AC4 declarations

B.21 can also be done immediately after B.5 if the priority is to make compliance guides and internal procedures searchable before implementing the heavier HACCP schema.

---

## 7. Generic RAG system architecture

### Strategic decision

Operon should build a **generic RAG system**, not a Lars-only assistant.

The RAG model follows the same inheritance logic as the product database model:

```text
Generic knowledge base
        ↓ inherited by
Regional knowledge base
        ↓ inherited by
Brewery-specific knowledge base
```

This means one system can serve:

- all breweries through generic knowledge
- Belgian breweries through Belgian regulatory knowledge
- each tenant through brewery-specific procedures and documents

### Scope layers

#### 1. Generic knowledge

For knowledge true across breweries generally.

Examples:

- brewing process concepts
- batch lifecycle
- inventory logic
- traceability chain structure
- lot tracking concepts
- generic cleaning concepts
- generic HACCP structure
- generic task definitions

Tag: `[GENERIC]`

#### 2. Regional knowledge

For country/region-specific requirements.

For Belgium:

- AC4
- déclaration de brassage
- Douanes / excise rules
- AFSCA obligations
- Belgian HACCP guide content
- Belgian small brewery context

Tag: `[REGIONAL: BE]`

#### 3. Brewery-specific knowledge

For one brewery's own documents, facts, procedures, and choices.

For Customer #1:

- Securex / prevention report
- actual cleaning products
- actual equipment
- own SOPs
- own floor plan
- own supplier choices
- own recipes
- own batch dossiers
- own customs office and EA number

Tag: `[INSTANCE]`

### Important rule

Generic does not mean universal truth.

Example:

```text
Batch number equals finished lot number
```

This is not generic. It is either:

- `[STRATEGY-DEFAULT]` if proposed as a default
- `[INSTANCE]` once selected by a brewery

Customer #1 currently uses `batch_equals_lot`.

---

## 8. RAG phased implementation plan

The RAG system should not start as an AI chat feature. It should start as a searchable, citation-ready knowledge base.

### RAG Phase 1 — Searchable knowledge base

Implement during Phase 1.B as **B.21 Knowledge Base Foundation**.

Build:

- `knowledge_sources`
- `knowledge_documents`
- `knowledge_chunks`
- optional `knowledge_document_links`
- scope model: `generic | regional | brewery`
- tag model: `[INSTANCE] | [GENERIC] | [REGIONAL: BE] | [STRATEGY-DEFAULT]`
- citation-ready metadata: page, section, heading, source title
- future-ready embedding field

No AI answers yet.

### RAG Phase 2 — Search endpoint with citations

Build a Cloudflare Function endpoint:

```text
GET /api/knowledge/search
```

or

```text
POST /api/knowledge/search
```

It should return:

- matching chunks
- document title
- source type
- scope
- tag
- page / section reference
- confidence / rank

Keyword search is acceptable first. Vector search can come later.

### RAG Phase 3 — RAG answers with citations

Only after search is reliable:

- generate answers from retrieved chunks
- every answer must cite sources
- no citation = no answer
- answer must distinguish generic, regional, and brewery-specific facts

### RAG Phase 4 — RAG + Supabase facts

Combine retrieved knowledge with live operational facts.

Examples:

- “What AC4 data is missing for this release?”
- “Which batch lacks a BBD?”
- “Which ingredient lot is not linked to a batch?”
- “Are we ready for an AFSCA traceability check?”

### RAG Phase 5 — Suggested tasks

RAG can suggest operational tasks but must not create them automatically.

Pattern:

```text
System suggests → user confirms → task is created
```

Examples:

- “Create task: upload latest Securex prevention report”
- “Create task: review expired ingredient lot”
- “Create task: prepare AC4 declaration for release event”

### RAG Phase 6 — AI assistant inside Daily Workspace

This corresponds to the larger AI Assistant vision.

Possible capabilities:

- Daily Workspace explanation
- AC4 drafter
- inspection readiness assistant
- recall reconstruction helper
- post-BBD decision drafter
- compliance gap explanation

This should not ship until at least one paying customer or imminent paying customer makes AI costs defensible.

---

## 9. Proposed B.21 ticket — Knowledge Base Foundation

```text
TICKET: Phase 1.B / B.21 — Knowledge Base Foundation

OBJECTIVE
Add the durable Supabase schema foundation for Operon's future searchable knowledge base and RAG system.

WHY NOW
Phase 1.B is building the compliance backbone. Operon needs a structured place to store compliance guides, HACCP documents, brewery procedures, Securex reports, and future Notion-derived knowledge before AI answers or Daily Workspace assistant features can be safely added.

ACCEPTANCE CRITERIA
- Add Supabase migration for knowledge_sources, knowledge_documents, knowledge_chunks, and optionally knowledge_document_links.
- Support generic, regional, and brewery-specific scope.
- Support the four-tag model.
- Make chunks citation-ready with document title, page, section, heading, and metadata references.
- Include future embedding/vector field if pgvector is available, but do not require AI generation yet.
- Add RLS policies consistent with tenant isolation.
- Regenerate Supabase types.
- Add a rollout note in docs/ explaining the RAG ladder.
- No UI.
- No LLM calls.
- No automatic document parsing.
- No task creation.

TAGGING
- Belgian excise/HACCP documents: [REGIONAL: BE]
- Brewery-specific procedures/reports: [INSTANCE]
- Generic brewing concepts: [GENERIC]
- Suggested defaults: [STRATEGY-DEFAULT]

DEPENDENCIES
- Phase 1.A Pattern B complete
- Existing brewery_id / RLS architecture
- Supabase type generation workflow

OUT OF SCOPE
- Chat UI
- Answer generation
- Embedding generation job
- Daily Workspace assistant
- Suggested task creation

TEST PLAN
- Apply migration.
- Confirm RLS is enabled.
- Insert sample generic, regional, and brewery-scoped records.
- Confirm generated types include new tables.
- Run typecheck, lint, and build.

FILES TO TOUCH
- supabase/migrations/*
- src/types/supabase.ts
- docs/b21-knowledge-base-foundation.md

DEFINITION OF DONE
- Migration applies cleanly.
- Types regenerated.
- RLS policies present.
- Documentation explains inheritance and future RAG phases.
- No frontend or AI behavior introduced.
```

---

## 10. Knowledge search inheritance rules

When a brewery user searches knowledge, the system should search:

```text
scope_type = generic
OR scope_type = regional AND region_code = brewery.region_code
OR scope_type = brewery AND brewery_id = current_brewery_id
```

Rank order:

```text
brewery-specific > regional > generic
```

Reason:

- the brewery's own procedure overrides a generic explanation
- regional law overrides generic brewery advice
- generic knowledge fills gaps when no specific source exists

Example answer behavior:

User asks:

```text
When do I need to file the brewing declaration?
```

The system should use:

- `[REGIONAL: BE]` excise rule for the D-3 requirement
- `[INSTANCE]` Customer #1 customs office if relevant

It should not answer from generic brewing process knowledge alone.

---

## 11. Track 1 roadmap after current point

### Phase 1.B — finish compliance backbone

Continue schema and data model hardening until Operon can support real compliance dossiers and traceability.

Important near-term items:

- finish B.5 lots traceability
- B.6 batches / brewsheet / AFSCA register support
- B.21 knowledge base foundation
- B.3 declarations
- B.1 HACCP entities
- B.2 CCP monitoring logs
- B.15 release events + AC4 declarations

### Phase 1.C — Foundation Flows + Daily Workspace

Only after enough compliance backbone exists, move into the more visible workspace phase:

- fix dead nav
- fix dashboard task/action bugs
- Daily Workspace inbox
- Dispatch routing
- task state chips
- packaging countdown
- controlled standby state

### Phase 1.D — Auth & Single-Tenant Onboarding

- sign-up / sign-in flow
- magic links / Google OAuth
- Customer #1 onboarding wizard
- transactional email setup

### Phase 1.E — UX Polish + ProtectedShell Refactor

- ProtectedShell refactor
- i18n cleanup
- empty/loading/error audit
- Sentry
- full Track 1 UX pass

---

## 12. Coding agent conventions

Every ticket should use this structure:

```text
TICKET: <name>

OBJECTIVE
<what this does>

WHY NOW
<why this is the next correct step>

ACCEPTANCE CRITERIA
- ...

TAGGING
<INSTANCE / GENERIC / REGIONAL / STRATEGY-DEFAULT rules>

DEPENDENCIES
<dependencies>

OUT OF SCOPE
<explicit non-goals>

TEST PLAN
- ...

FILES TO TOUCH
- ...

DEFINITION OF DONE
- ...
```

Coding rules:

1. Pattern B only.
2. Never hardcode Customer #1 facts into generic app code.
3. Use generated Supabase types.
4. Domain logic belongs in domain modules, not UI components.
5. RLS and tenant isolation must be included in schema tickets.
6. Empty/loading/error states are mandatory for UI tickets.
7. No paid tools without explicit approval.
8. RAG must preserve scope and citations; no uncited compliance answers.

---

## 13. Open decisions

- Whether B.21 should be implemented immediately after B.5 or after B.6
- Whether to enable `pgvector` in B.21 or leave embeddings as nullable future field only
- Whether Notion remains a semantic source or becomes mirrored into Supabase knowledge tables during B.21 / later RAG phase
- Whether Belgian HACCP guide content is `[REGIONAL: BE]` only or split between `[GENERIC]` process knowledge and `[REGIONAL: BE]` regulatory framing
- How to version knowledge documents over time
- Whether source document files live in Supabase Storage or are only referenced by URI at first
- Which AI provider to use for later RAG answers; defer until revenue or clear production need

---

## 14. Current summary for the next agent

Operon has completed the main foundation-hardening phase. The current active development is Phase 1.B Compliance Backbone.

The most recent structural work is:

- tenant RLS and auth hook are in place
- Pattern B is enforced
- generated Supabase types are in place
- brewery config layer is in place
- ingredient receipts have been extended for backward traceability
- lots are currently being extended for finished-goods forward traceability in PR #101

The next important architecture addition is a generic/regional/brewery-scoped knowledge base foundation so future RAG can search and cite compliance, HACCP, procedures, and brewery-specific documents without becoming a one-off Lars-only chat feature.

Do not build AI chat first. Build citation-ready knowledge storage and scoped search first.
