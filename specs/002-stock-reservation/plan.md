# Implementation Plan: Stock reservation at checkout — end-to-end verification

**Branch**: `002-stock-reservation` | **Date**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-stock-reservation/spec.md`

## Summary

Playwright suite `tests/relm-2/` covering all nine RELM-2 scenarios. Data is seeded through
inventory-api (synthetic SKUs, test service token); UI steps go through page objects
(`CheckoutPage`). A `beforeAll` capability check compares the environment's contract versions
(`/v1/meta` or `info.version` exposed by each service) with `contracts.lock.json`. Expiry tests read
`expiresAt`/`remainingSeconds` from the reservation and poll availability instead of sleeping.

## Technical Context

**Language/Version**: TypeScript 5.7, Node 22

**Primary Dependencies**: @playwright/test 1.49; openapi-typescript types from `contracts/vendor/*.yaml` for API helpers

**Storage**: N/A

**Testing**: Playwright (Chromium) — UI + API request context

**Target Platform**: staging (CI job `e2e-staging`), local against `npm run dev` + mocks

**Project Type**: test suite

**Performance Goals**: `@relm-2` < 8 min, `@smoke` < 10 min overall

**Constraints**: retries 0 in gating runs; no `waitForTimeout`

**Scale/Scope**: 9 scenarios → ~11 tests, 1 page object, 2 API helpers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | How this plan complies | Status |
|------|------------------------|--------|
| ORG-3 / QA-3 / E2E-4 | Versions from `contracts.lock.json`, checked against environment and vendored files | ✅ |
| ORG-4 / QA-2 / E2E-2 | One or more tests per scenario, titles start with IDs, tags `@relm-2` (+ `@smoke` for US1/AS1, US2/AS1, US2/AS2) | ✅ |
| ORG-5 / QA-5 | Synthetic SKUs `E2E-<uuid>`, test carts only; no personal data | ✅ |
| QA-4 / E2E-5 | Polling helpers, no sleeps, retries 0 | ✅ |
| QA-6 | `coverage:scenarios --feature RELM-2 --gate` output attached to the feature issue | ✅ |
| E2E-1 / E2E-3 | `CheckoutPage` page object; seeding via inventory-api | ✅ |

## Project Structure

```text
pages/CheckoutPage.ts           hold notice, shortage list, place order, expired state
support/api.ts                  seedSku(), getAvailability(), getReservation() — typed from vendored contracts
support/capabilities.ts         environment version check vs contracts.lock.json
tests/relm-2/hold.spec.ts       US1
tests/relm-2/order.spec.ts      US2
tests/relm-2/release.spec.ts    US3
```

## Complexity Tracking

> No constitution violations to justify.

---

## Relm Delivery Sections *(mandatory — ORG-3, ORG-5, ORG-6, ORG-7)*

### Contracts & Versions (ORG-3)

| Interface | Role | Contract file | Locked version | Change | Consumers / provider |
|-----------|------|---------------|----------------|--------|----------------------|
| Inventory API | consumes (seeding, assertions) | `contracts/vendor/inventory-api.yaml` | 1.1.1 | — | inventory-service |
| Orders API | consumes (assertions) | `contracts/vendor/orders-api.yaml` | 1.3.1 | — | orders-service |

### Observability (ORG-6)

| Success criterion (from spec) | Signal (metric / log / trace) | Dashboard or alert |
|-------------------------------|-------------------------------|--------------------|
| SC-001 P1 coverage | `coverage:scenarios` report | attached to product-specs#2 at Gate 4 |
| SC-002 duration | Playwright JSON report duration | CI summary |
| SC-003 flakiness | nightly rerun report | QA flake tracker |

### Feature flag, rollout & rollback (ORG-7)

- **Flag**: relies on `checkout.stock-reservation` targeting test carts (prefix `e2e-`) in staging.
- **Rollout position**: 4 of 4 — must be green before the flag goes to 5 %.
- **Rollback**: n/a (test code); a failing suite blocks the next rollout step.

### Security & privacy (ORG-5)

- **AuthN / AuthZ**: staging test service token (`E2E_SERVICE_TOKEN`) with `inventory:reserve` for seeding.
- **Personal data touched**: none (QA-5).
- **Secrets / config**: `BASE_URL`, `INVENTORY_BASE_URL`, `ORDERS_BASE_URL`, `E2E_SERVICE_TOKEN` (secret).

### QA: scenario-to-test strategy (QA-2, QA-3)

| Scenario ID | Level (unit / contract / integration / E2E) | Repository & suite | Tag | Data setup (synthetic) |
|-------------|---------------------------------------------|--------------------|-----|------------------------|
| RELM-2/US1/AS1 | E2E (+ provider/unit in inventory, component in web) | e2e-tests / relm-2/hold | @relm-2 @smoke | SKU stock 5, cart 2 |
| RELM-2/US1/AS2 | E2E | e2e-tests / relm-2/hold | @relm-2 | SKU stock 1, cart 2 |
| RELM-2/US1/AS3 | E2E | e2e-tests / relm-2/hold | @relm-2 | SKU stock 5, cart 1, reload |
| RELM-2/US1/AS4 | E2E (two browser contexts) | e2e-tests / relm-2/hold | @relm-2 | SKU stock 1, carts A and B |
| RELM-2/US2/AS1 | E2E | e2e-tests / relm-2/order | @relm-2 @smoke | SKU stock 5, cart 2 |
| RELM-2/US2/AS2 | E2E | e2e-tests / relm-2/order | @relm-2 @smoke | SKU stock 5, cart 1, double click |
| RELM-2/US2/AS3 | E2E (short hold lifetime) | e2e-tests / relm-2/order | @relm-2 | SKU stock 5, hold expired via lifetime |
| RELM-2/US3/AS1 | API-level E2E | e2e-tests / relm-2/release | @relm-2 | SKU stock 2, hold 2, poll availability ≤ 60 s |
| RELM-2/US3/AS2 | E2E | e2e-tests / relm-2/release | @relm-2 | expired hold, return to checkout |

### QA: environments & pinned versions (QA-3)

| Environment | Contract versions exercised | Capability flags | Data reset strategy |
|-------------|-----------------------------|------------------|---------------------|
| staging | inventory-api@1.1.1, orders-api@1.3.1 | checkout.stock-reservation=on for `e2e-` carts | per-test synthetic SKUs `E2E-<uuid>` |
| local | same (Prism mocks + storefront dev) | env `FLAG_STOCK_RESERVATION_PERCENT=100` | mocks are stateless |

### QA: release sign-off evidence (QA-6)

- [ ] All participating repositories report `/speckit.converge`: Converged
- [ ] Provider + consumer contract tests green for every locked version
- [ ] `@smoke` suite green in staging; all P1 scenarios pass
- [ ] Sign-off recorded on the product feature issue
