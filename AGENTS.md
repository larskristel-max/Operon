# Operon — AGENTS.md

This file is the durable operating guide for Codex, ChatGPT, and any future AI contributor working on Operon.

It exists so every new execution thread starts from the same architecture and product understanding.

This document is not a wish list. Treat it as project law unless the user explicitly changes the architecture.

---

# 1. Product identity

Operon is a mobile-first brewery operating system.

It is not a generic dashboard, CRUD app, or form system.

Core loop:

```text
User acts → system suggests → user confirms → system structures, links, and logs data
```

Primary product goal:

```text
Reduce brewery admin while preserving traceability and operational control.
```

The app must help the brewer act faster, safer, and with less admin.

---

# 2. Locked product principles

## 2.1 Action-first

Operon is:

- action-driven
- flow-driven
- context-driven
- mobile-first

Operon must not become:

- tab-heavy
- form-heavy
- CRUD-first
- dashboard-first

## 2.2 Let’s Brew / Brassage

The central brew action is the primary operational entry point.

It must remain:

- direct
- low-friction
- confirm-based
- compatible with future AI routing

Do not demote it into a secondary feature.

## 2.3 Batch as workspace

A batch is not just a row in a list.

A batch is a process-run workspace: a place to understand and act.

When exposing batch context, reveal existing relationships around the batch instead of inventing new logic.

## 2.4 No hidden logic

System behavior must be explicit at domain and data-model level.

Avoid temporary heuristics, implicit rules, and UI-only computations that should live in a domain module.

---

# 3. Current architecture

The current production architecture is:

```text
Supabase = operational truth
Notion = semantic/context truth
GitHub = implementation truth
Cloudflare Pages / Functions = API boundary and runtime middle layer
React + Vite + TypeScript = frontend
```

Older references to Airtable, vanilla JS, or no build pipeline are obsolete.

Do not reintroduce Airtable assumptions.

---

# 4. Supabase architecture

Supabase stores operational data.

Primary project:

```text
operon-prod
project ref: curjxdjlrlenqlitdspd
region: eu-west-3
```

## 4.1 Core relational model

The operational model is centered on:

```text
brewery_profiles → batches → lots / tasks / logs / movements
```

Important tables:

- `brewery_profiles`
- `users`
- `recipes`
- `ingredients`
- `ingredient_receipts`
- `batches`
- `batch_inputs`
- `brew_logs`
- `mash_steps`
- `boil_additions`
- `fermentation_checks`
- `tanks`
- `lots`
- `inventory_movements`
- `pending_movements`
- `tasks`
- `sales`
- `declarations`
- `issues`
- `event_logs`
- `demo_sessions`
- `demo_overlay_records`

## 4.2 Batch lifecycle

Batch status enum:

```text
planned → brewing → fermenting → conditioning → ready → packaged → closed
```

Do not replace this with free-form UI labels.

## 4.3 Task types

Current task types:

```text
assign_tank
assign_inputs
record_mash_volume
record_transfer_volume
take_gravity_reading
create_output_lot
```

Task rules live in code, not in UI components.

## 4.4 Ingredient classification

Ingredients have explicit `ingredient_type` values:

```text
malt
hops
yeast
adjunct
sugar
water_additive
processing_aid
packaging
cleaning
other
```

Brew input selection should only expose relevant production ingredients, not packaging or cleaning items.

## 4.5 Demo mode

Demo mode uses Supabase baseline data plus overlay writes.

Demo flow:

```text
demo session → overlay records → merged dashboard data
```

Important demo tables:

- `demo_sessions`
- `demo_overlay_records`

Allowed overlay table names are explicitly whitelisted in the database.

UI must not branch into separate behavior for demo unless strictly necessary. Prefer shared hooks and shared view models.

## 4.6 RLS / access pattern

RLS is enabled on public tables.

The current application pattern is:

```text
frontend → Cloudflare Function/API → Supabase
```

Do not assume direct frontend table access is available.

## 4.7 Database change rule

Do not change Supabase schema unless the phase explicitly asks for it.

For UI/context phases, use existing dashboard data first.

---

# 5. Notion architecture

Notion is the semantic/context layer.

It is not the operational database.

Use Notion for:

- meaning
- product vocabulary
- semantic relationships
- domain context
- future explainability

Do not use Notion for:

- runtime writes
- batch execution writes
- task completion writes
- operational state mutation

## 5.1 Semantic model

Notion contains an App Semantic Graph with canonical object types such as:

- `process_run`
- `input_material`
- `measurement`
- `output_lot`
- `transaction`
- `task`
- `issue`
- `state`
- `system`

## 5.2 Batch semantic meaning

Batch maps to:

```text
Canonical Object Type: process_run
App Role: object
Entity Class: Operational Layer
```

Therefore a batch screen should feel like a process-run workspace, not a database detail page.

## 5.3 Brew Execution Domain

The Brew Execution Domain owns actual brew, fermentation, packaging, and batch execution reality.

Batch context work belongs to this domain.

---

# 6. GitHub / codebase architecture

Main repository:

```text
larskristel-max/Operon
```

Current stack:

- React
- Vite
- TypeScript
- Supabase JS
- Cloudflare Pages / Functions

Commands:

```bash
npm run typecheck
npm run build
```

Both must pass before a PR is considered ready.

## 6.1 App entry

`src/App.tsx` handles:

- splash screen
- first-launch language selection
- auth gate
- demo entry
- protected shell

Authenticated or demo users enter:

```tsx
<ProtectedShell />
```

## 6.2 Protected shell

`src/ui/shell/ProtectedShell.tsx` currently composes much of the runtime UI:

- dashboard
- brew entry flow
- task modal/sheet behavior
- demo and real dashboard data
- domain hooks for execution actions

When adding lightweight navigation or screens, respect this existing structure unless a phase explicitly asks for routing refactor.

## 6.3 Domain structure

Domain code lives under:

```text
src/domains/
```

Examples:

- `dashboard`
- `demo`
- `batches`
- `tasks`
- `tanks`
- `brew_logs`
- `batch_inputs`
- `fermentation_checks`
- `lots`

UI should call domain hooks and mappers. UI should not own business rules.

## 6.4 Dashboard data flow

Real dashboard data comes from:

```text
/api/dashboard
```

through:

```text
src/domains/dashboard/api.ts
src/domains/dashboard/hooks.ts
```

Real dashboard data is mapped into the same merged shape as demo data using:

```text
src/domains/dashboard/mappers.ts
```

When possible, screens should use the merged dashboard shape so demo and real mode behave identically.

## 6.5 Task rules

Task computation lives in:

```text
src/domains/tasks/rules.ts
```

Operational task summaries are built in:

```text
src/domains/dashboard/operational.ts
```

Do not duplicate task computation in UI.

Filter existing computed tasks by context, for example:

```ts
task.batchId === selectedBatch.id
```

---

# 7. UI / UX rules

Design direction:

```text
Apple + Industrial hybrid
```

The UI should feel:

- calm
- clean
- mobile-native
- low-friction
- operational
- industrial but not harsh

Use:

- rounded cards
- generous spacing
- large tap targets
- subtle depth
- minimal borders
- clear state colors

State colors:

```text
Green = OK
Orange = Needs attention
Red = Blocked
Blue = Action / navigation
```

Do not introduce a new design system unless explicitly requested.

Do not over-design operational screens.

---

# 8. Internationalization / copy

The app supports:

- French
- Dutch
- English
- German

Copy should be:

- short
- operational
- action-first
- easy to localize

Avoid decorative copy.

French operational terms already used include:

- `Brassage`
- `À compléter`
- `Voir le batch`

When adding UI strings, place them in the existing i18n/copy system rather than hardcoding them throughout components.

---

# 9. Write-path rules

Do not add new write logic unless explicitly requested.

Do not bypass existing domain hooks.

Current execution pattern:

```text
user taps task → existing domain hook writes → dashboard refetches → computed task disappears
```

This must be preserved.

For demo:

```text
write to overlay → refetch merged demo dashboard
```

For real:

```text
write through API/DB → refetch real dashboard
```

UI must not know more than necessary about this difference.

---

# 10. Batch Execution Surface guidance

For phases involving batch detail/context:

Goal:

```text
Give each batch a home.
```

Build a lightweight batch workspace using existing dashboard data.

Allowed sections:

- header
- status / overview
- tank
- ingredients / inputs
- logs
- tasks

Data mapping:

- batch header → `batches`
- recipe → `recipes`
- tank → `tanks.current_batch_id === batch.id`
- inputs → `batch_inputs.batch_id === batch.id`
- logs → `brew_logs.batch_id === batch.id`
- tasks → `operational.openTasks.filter(task => task.batchId === batch.id)`

Do not add:

- new endpoints unless existing dashboard data is insufficient
- new DB schema
- new task rules
- full timeline
- editing complexity
- Notion runtime queries

The batch screen is a context projection, not a new subsystem.

---

# 11. Empty states and safety

Every screen must handle:

- missing data
- empty arrays
- missing fields
- unknown IDs
- batch not found
- demo loading
- real loading

Use safe empty states such as:

```text
À compléter
```

Never crash because optional operational data is missing.

---

# 12. Testing expectations

Before claiming completion, run:

```bash
npm run typecheck
npm run build
```

For UI phases, validate manually:

- app loads
- demo mode works
- real mode still works
- no console errors
- mobile layout fits one screen where expected
- overlays close by intended gestures
- dashboard refetches after writes
- tasks disappear after completion

For batch surface phases, validate:

- open batch from dashboard
- open batch after brew success
- view status, tank, inputs, logs, tasks
- execute a batch task
- dashboard updates
- task disappears
- demo and real behavior match

---

# 13. Forbidden changes unless explicitly requested

Do not:

- redesign the whole UI system
- add top-level tabs casually
- add schema migrations casually
- move operational truth into Notion
- duplicate task logic in components
- create separate demo-only UI flows
- introduce fake data
- hardcode brewery-specific behavior globally
- bypass Cloudflare/API access patterns
- add heavy navigation stacks
- turn action flows into long forms

---

# 14. Development philosophy

Follow:

```text
Stabilize → Structure → Then expand
```

Not:

```text
Expand → Fix later
```

Keep changes narrow.

Prefer exposing what already exists over building new systems.

---

# 15. Final rule

Always ask:

```text
Does this help the brewer act faster, safer, and with less admin?
```

If not, it probably does not belong.
