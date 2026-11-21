# e2e-tests

**Cross-service end-to-end verification for Relm Commerce, and the scenario-coverage evidence for
release readiness (Gate 4).** Playwright + TypeScript.

Owner: `@spec-kit-relm/qa` · Spec Kit project, kind **qa** (presets `relm-org` + `relm-qa`,
extensions `git`, `github`, `relm`) · Consumer of **inventory-api 1.1.0** and **orders-api 1.3.0**
(see [`contracts.lock.json`](contracts.lock.json))

## Run it

```bash
npm ci && npx playwright install chromium
npx playwright test --list                                   # what exists
BASE_URL=https://staging.storefront.relm.example npm test     # run against an environment
npm run coverage:scenarios -- --feature RELM-1                # which scenarios have tests (any repo)
```

`coverage:scenarios` reads the *Scenario IDs* tables in `../product-specs/specs/*/spec.md` and
searches test titles in this repo and in sibling repos. Today it reports **0/9 for RELM-1** —
correct, because implementation has not started; `--gate` fails until every P1 scenario is covered.

## How QA works with Spec Kit — in order

1. **Before any code (product-specs):** co-write acceptance scenarios with the PO, challenge
   `/speckit.clarify` answers, run `/speckit.checklist` (requirements, api, ux, qa), tick items by
   hand in the Gate 1 review.
2. **Contracts (Gate 2):** review problem types and edge cases in provider contract PRs.
3. **This repository:** `/speckit.relm.handoff RELM-<n>` → `/speckit.specify` → `/speckit.plan`
   (scenario-to-test table, pinned versions) → `/speckit.tasks` → `/speckit.analyze`.
4. **Service plans (Gate 3):** check every repo's `tasks.md` has scenario-ID test tasks and
   negative contract tests.
5. **Build suites in parallel** with development, against local mocks first.
6. **Gate 4:** run `@relm-<n>` + `@smoke` in staging, attach
   `coverage:scenarios --feature RELM-<n> --gate` and the release checklist to the feature issue.

## Current feature

| Feature | Directory | State |
|---------|-----------|-------|
| RELM-1 Stock reservation at checkout | [`specs/001-stock-reservation/`](specs/001-stock-reservation/) | Approved · versions pinned · [tasks](specs/001-stock-reservation/tasks.md) ready — **next: `/speckit.implement Phase 1`** |

## Gates on every PR

`sdd / sdd-gates`, `ci / static` (types, lock check, test listing, scenario coverage report), one
`@spec-kit-relm/qa` approval.
