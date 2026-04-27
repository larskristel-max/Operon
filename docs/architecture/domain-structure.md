# Domain Structure and Guardrails

This note defines the architecture boundaries for future feature work.

## Core ownership model

- **Domains own business logic.**
  - Domain modules contain use-case logic, domain rules, and contracts.
- **UI renders only.**
  - Components focus on presentation and interaction wiring.
- **Components do not call `fetch` directly.**
  - Network calls are mediated through domain/API layers.
- **Hooks call domain APIs.**
  - Hooks orchestrate loading/error/refresh behavior while delegating business operations to domains.
- **Mappers own API-to-UI conversion.**
  - API response shape adaptation belongs in mapper modules, not in components.

## ID policy

- IDs are represented as strings at UI and domain boundaries unless a stricter contract is explicitly documented.
- UUIDs remain opaque identifiers and must not embed business semantics.
- Any ID conversion/parsing must be localized to mapping/boundary layers.

## Centralized cross-cutting rules

- **Time rules:** centralized utilities are the source of truth for date/time formatting/parsing behavior.
- **Storage rules:** browser/local persistence access is centralized behind storage utilities/domain adapters.
- **API rules:** HTTP/request behavior is centralized through API client modules and domain APIs.

## PR 6 scope marker

This PR establishes structure only:
- Adds placeholder domain directories for planned ownership.
- Adds architecture guidance documentation.
- Introduces no runtime behavior changes.
