# AGENTS.md — e2e-tests

Cross-service end-to-end suites and scenario-coverage tooling for Relm Commerce (Playwright +
TypeScript). Owned by `@spec-kit-relm/qa`. Exercises web-storefront, inventory-service and
orders-service in staging at the contract versions pinned in `contracts.lock.json`.
Rules that MUST hold are in `.specify/memory/constitution.md` (ORG-*, QA-1 … QA-6, E2E-1 … E2E-5).

## Commands
| Purpose | Command |
|---------|---------|
| Install deps | `npm ci` (browsers: `npx playwright install chromium`) |
| Type check | `npm run typecheck` |
| List tests | `npx playwright test --list` |
| Run against an environment | `BASE_URL=https://staging.storefront.relm.example npm test` |
| Run one feature | `npm run test:feature -- @relm-2` |
| Smoke only | `npm run test:smoke` |
| Lock check | `npm run check:lock` (needs `../product-specs` or `PRODUCT_SPECS=<path>`) |
| Scenario coverage | `npm run coverage:scenarios -- --feature RELM-2` (add `--gate` for Gate 4) |

Run `npm run typecheck && npx playwright test --list` before marking any task `[X]`.

## Layout
```text
tests/smoke/            @smoke suites (release gating)
tests/relm-<n>/         feature suites, one folder per feature
pages/                  page objects (role/label locators only)
support/                API seeding, capability checks, polling helpers   (RELM-2 Phase 2)
scripts/                scenario-coverage.mjs, check-lock.mjs
contracts/vendor/       READ-ONLY pinned contracts
contracts.lock.json     versions + capability requirements exercised by this suite
specs/NNN-*/            Spec Kit features
```

## Spec Kit in this repository
- Kind: `qa` — presets `relm-org` + `relm-qa`; extensions `git`, `github`, `relm`.
- `/speckit.specify RELM-<n> …` → `specs/<NNN>-<short-name>/`; the plan's *scenario-to-test
  strategy* table maps every central scenario ID to a test.
- Start with `/speckit.relm.handoff RELM-<n>` — this repo's slice is always "all scenarios".
- One phase per `/speckit.implement` run; then `/speckit.converge` and `/speckit.relm.pr`.
- Current feature: **RELM-2** `specs/002-stock-reservation/` — tasks ready, start with Phase 1.

## Conventions
- Test title = scenario ID + behavior + tags:
  `test('RELM-2/US2/AS2 double click creates exactly one order @relm-2 @smoke', …)`.
- Seed data through APIs with synthetic values (`E2E-<uuid>` SKUs, `e2e-` cart prefix); UI only
  for the behavior under test.
- Wait with web-first assertions or `expect.poll`; read hold lifetimes from API responses.

## Do not
- Use `page.waitForTimeout`, CSS selectors, or `retries` to hide flakiness — quarantine instead (`@quarantine`).
- Use production data or real personal data (QA-5).
- Edit `contracts/vendor/**` or Parts A/B of the constitution.
- Tick checklist items in product-specs — humans only (QA-1).

## Gotchas
- Node 22 strips TypeScript types natively: avoid TS-only runtime syntax such as constructor
  parameter properties (`constructor(private page: Page)`) and `enum` — Playwright fails to load them.
- Staging hold lifetime is short for `e2e-` carts; never hard-code 15 minutes.
