# Feature Specification: Stock reservation at checkout — end-to-end verification

**Feature Branch**: `002-stock-reservation`

**Created**: 2026-11-20

**Status**: Approved

**Input**: User description: "RELM-2 stock-reservation: e2e-tests slice — verify every P1 scenario of RELM-2 across inventory-service, orders-service and web-storefront in staging, against the locked contract versions, plus the P2 release and expired-state scenarios; provide the coverage evidence for release readiness."

## Clarifications

### Session 2026-11-20

- Q: Can E2E wait 15 minutes for expiry? → A: No. Staging runs inventory with a short hold lifetime for test carts; the suite reads the lifetime from the reservation response instead of assuming 15 minutes.
- Q: How do tests switch the feature on? → A: Test carts are always in the enabled percentage (flag targeting by test cart prefix in staging).
- Q: Which scenarios gate the release? → A: All P1 scenarios (`@smoke` subset runs on every deploy; the full `@relm-2` suite before each rollout step).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prove holds work end to end (Priority: P1)

QA can show, in staging, that checkout holds stock and that held stock is unavailable to others.

**Why this priority**: Verifies central US1 across storefront and inventory together.

**Independent Test**: Run the `@relm-2` US1 tests against staging with synthetic SKUs.

**Acceptance Scenarios**:

1. **Given** a synthetic SKU with 5 units and a cart with 2, **When** the test shopper starts checkout, **Then** the hold notice is visible and inventory reports 3 available. *[RELM-2/US1/AS1]*
2. **Given** a synthetic SKU with 1 unit and a cart with 2, **When** checkout starts, **Then** the shortage message appears and no units are held. *[RELM-2/US1/AS2]*
3. **Given** an active hold, **When** the page is reloaded, **Then** the same hold and a non-reset remaining time are shown. *[RELM-2/US1/AS3]*
4. **Given** shopper A holds the last unit, **When** shopper B starts checkout, **Then** B sees the item is not available. *[RELM-2/US1/AS4]*

---

### User Story 2 - Prove ordering uses the hold exactly once (Priority: P1)

**Why this priority**: Verifies central US2 across storefront, orders and inventory.

**Independent Test**: Run the `@relm-2` US2 tests against staging.

**Acceptance Scenarios**:

1. **Given** an active hold, **When** the order is placed, **Then** a confirmation is shown and inventory on-hand decreased by the held units. *[RELM-2/US2/AS1]*
2. **Given** an active hold, **When** "Place order" is double-clicked, **Then** one confirmation and exactly one order exist. *[RELM-2/US2/AS2]*
3. **Given** a hold that expired, **When** the order is placed, **Then** the expired message appears and no order exists. *[RELM-2/US2/AS3]*

---

### User Story 3 - Prove unused holds are released (Priority: P2)

**Why this priority**: Verifies central US3 (release and expired state).

**Independent Test**: Run the `@relm-2` US3 tests against staging with the short hold lifetime.

**Acceptance Scenarios**:

1. **Given** a hold that is not used, **When** its lifetime ends, **Then** availability is restored within 60 seconds. *[RELM-2/US3/AS1]*
2. **Given** an expired hold, **When** the shopper returns to checkout, **Then** the expired state with "Start checkout again" is shown. *[RELM-2/US3/AS2]*

---

### Edge Cases

- Staging is running an older contract version than the lock file: the suite refuses to run the `@relm-2` tests and reports the mismatch instead of failing scenarios.
- Shared staging data changes during a run: each test creates its own synthetic SKUs and carts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every P1 scenario of RELM-2 MUST have at least one automated E2E test titled with its ID.
- **FR-002**: Tests MUST create their own synthetic data through provider APIs.
- **FR-003**: Tests MUST NOT assume the production hold lifetime.
- **FR-004**: The suite MUST verify the environment's contract versions against the lock file before running feature tests.
- **FR-005**: A coverage report of RELM-2 scenario IDs MUST be produced for Gate 4.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % of RELM-2 P1 scenarios covered by passing tests at Gate 4.
- **SC-002**: `@relm-2` suite completes in under 8 minutes in staging.
- **SC-003**: Zero flaky failures across 10 consecutive nightly runs before full rollout.

## Assumptions

- Staging exposes test-only seeding through the providers' normal APIs with test service tokens.

---

## Relm Traceability *(mandatory — ORG-1, PRD-1, QA-2)*

**Feature ID**: RELM-2
**Central spec**: [product-specs/specs/002-stock-reservation/spec.md](https://github.com/spec-kit-relm/product-specs/blob/main/specs/002-stock-reservation/spec.md)
**Repository role**: verification
**Contracts provided**: none
**Contracts consumed**: inventory-api@1.1.1, orders-api@1.3.1 (pinned in `contracts.lock.json`)
**Product stories covered**: all (US1–US3)

**Status lifecycle**: Draft → In Review → Approved → Implemented → Released

### Scenario IDs
Identical to the central spec; no repository-only scenarios.
