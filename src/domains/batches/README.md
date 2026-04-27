# Batches Domain

## Responsibility
- Own brew entry and batch draft preparation logic.
- Prepare a safe confirmation boundary before any batch write is executed.
- Keep UI components thin by centralizing flow state and transitions.

## Current scope
- Recipe source selection flow (`existing`, `new`, `upload`).
- Upload intake handoff into recipe domain intake endpoint.
- Batch draft preparation endpoint integration.
- No direct final batch creation in this phase.
