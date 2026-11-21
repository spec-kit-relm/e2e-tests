---
description: "Task list for RELM-1 stock reservation — end-to-end verification"
---

# Tasks: Stock reservation at checkout — end-to-end verification

**Input**: Design documents from `/specs/001-stock-reservation/`

**Prerequisites**: plan.md, spec.md, `contracts.lock.json` (inventory-api 1.1.0, orders-api 1.3.0)

**Tests**: this repository *is* tests; every task produces or supports a scenario test.

**Organization**: grouped by user story; each phase fits one `/speckit.implement` run.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Add `openapi-typescript` and `gen:api` script for `contracts/vendor/*.yaml` → `support/generated/`
- [ ] T002 [P] ESLint rules banning `waitForTimeout` and CSS locators in `tests/` (E2E-1, E2E-5)

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T003 `support/api.ts`: `seedSku(stock)`, `getAvailability(sku)`, `getReservation(id)` with test token (E2E-3)
- [ ] T004 [P] `support/capabilities.ts`: compare environment versions with `contracts.lock.json`; skip `@relm-1` with a clear reason on mismatch (spec Edge Cases)
- [ ] T005 [P] `pages/CheckoutPage.ts`: hold notice, remaining time, shortage list, place order, expired state — role/label locators only
- [ ] T006 [P] `support/poll.ts`: `expect.poll` helpers for availability and reservation state (E2E-5)

**Checkpoint**: helpers ready; tests can run against local mocks

---

## Phase 3: User Story 1 - Prove holds work end to end (Priority: P1) 🎯 MVP

- [ ] T007 [P] [US1] `RELM-1/US1/AS1 starting checkout holds items and shows the hold @relm-1 @smoke` in `tests/relm-1/hold.spec.ts`
- [ ] T008 [P] [US1] `RELM-1/US1/AS2 short cart shows shortage and holds nothing @relm-1`
- [ ] T009 [P] [US1] `RELM-1/US1/AS3 reload keeps the same hold and remaining time @relm-1`
- [ ] T010 [P] [US1] `RELM-1/US1/AS4 last unit held by A is unavailable to B @relm-1` (two browser contexts)

---

## Phase 4: User Story 2 - Prove ordering uses the hold exactly once (Priority: P1)

- [ ] T011 [P] [US2] `RELM-1/US2/AS1 placing the order converts the hold @relm-1 @smoke` in `tests/relm-1/order.spec.ts`
- [ ] T012 [P] [US2] `RELM-1/US2/AS2 double click creates exactly one order @relm-1 @smoke`
- [ ] T013 [P] [US2] `RELM-1/US2/AS3 expired hold is rejected and no order exists @relm-1`

---

## Phase 5: User Story 3 - Prove unused holds are released (Priority: P2)

- [ ] T014 [P] [US3] `RELM-1/US3/AS1 unused hold is released within 60 s @relm-1` (API-level, polls availability) in `tests/relm-1/release.spec.ts`
- [ ] T015 [P] [US3] `RELM-1/US3/AS2 returning after expiry shows the expired state @relm-1`

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T016 CI job `e2e-staging` (manual + nightly) running `@relm-1` and uploading the JSON report
- [ ] T017 Run `npm run coverage:scenarios -- --feature RELM-1 --gate` and attach the output to product-specs#1 (QA-6)

---

## Phase R: Relm Verification & Handoff *(mandatory, always the last phase — ORG-3, ORG-4, ORG-9, PRD-6)*

- [ ] TR01 Provider verification and consumer contract tests pass against the locked contract versions, including negative cases
- [ ] TR02 Every acceptance scenario `RELM-1/US<k>/AS<m>` in scope has an automated test whose title starts with that ID
- [ ] TR03 Feature flag defaults to off; rollback steps from plan.md verified in a non-production environment
- [ ] TR04 Run `/speckit.converge`; resolve every appended convergence task until it reports **Converged**
- [ ] TR05 If shipped behavior or contract versions differ from the central spec, open a PR in `product-specs` updating `spec.md` / `contracts.lock.md`
- [ ] TR06 Open the pull request with the Relm PR template (Feature ID, contracts, analyze + converge evidence, scenario coverage)

---

## Dependencies & Execution Order

- Phases 1–2 can start immediately (mocks); Phases 3–5 need the storefront and services in staging for the final green run, but can be written against local mocks first.
- QA spec partner reviews T007–T015 titles against the central Scenario IDs table.
