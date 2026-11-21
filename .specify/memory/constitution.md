<!--
Sync Impact Report
- Version change: template → 1.0.0 (initial ratification)
- Part A: RELM:ORG-BASELINE v1.0.0 (synced, unchanged)
- Part B: RELM:TEAM-QA v1.0.0 (synced, unchanged)
- Part C: added E2E-1, E2E-2, E2E-3, E2E-4, E2E-5
- Templates: provided by presets relm-org + relm-qa (runtime resolution, no file edits)
- Deferred TODOs: none
-->
# e2e-tests Constitution

> **How this constitution is layered (Relm SDD).**
> Part A is the organization baseline and Part B is the team overlay. Both are synced from
> `spec-kit-relm/speckit-platform` and MUST NOT be edited in this repository. Part C holds this
> repository's own amendments: they may add or tighten rules, never relax Parts A or B.
> Every Spec Kit command reads this file; `/speckit.analyze` treats any MUST violation as CRITICAL.

<!-- BEGIN RELM:ORG-BASELINE v1.0.0 | source: spec-kit-relm/speckit-platform/presets/relm-org/templates/constitution-template.md | DO NOT EDIT OUTSIDE speckit-platform -->
## Part A — Relm Organization Baseline (MUST)

These principles apply to every Relm repository. They are deliberately few and every one of
them names the check that enforces it. Lower layers (team overlay, repository amendments) may
**add or tighten** rules, never relax or contradict them.

### ORG-1 Spec before code
Any change that alters user-visible behavior, a public contract, or persisted data MUST trace to
a Spec Kit feature (`Feature: RELM-<n>`) or to a declared lightweight lane (`lane:bugfix`,
`lane:chore`) on the pull request.
*Check: `sdd-gates / pr-check`.*

### ORG-2 Specs describe WHAT and WHY, never HOW
`spec.md` contains no frameworks, languages, or storage choices. Every user story has
Given/When/Then acceptance scenarios and measurable success criteria. No
`[NEEDS CLARIFICATION]` marker may remain once a spec's status is `Approved` or later.
*Check: `sdd-gates / spec-lint`, `/speckit.analyze`.*

### ORG-3 Contract-first integration
Every cross-repository interaction (HTTP, events, shared schemas) is defined in a versioned
contract (OpenAPI 3.1 or AsyncAPI 3) with exactly one owning (provider) repository. Consumers pin a
version and treat vendored copies as read-only. Breaking changes require a MAJOR version and the
expand → migrate → contract sequence.
*Check: `contract-check` workflow, consumer review on contract PRs.*

### ORG-4 Tests prove the spec
Each acceptance scenario maps to at least one automated test that carries its scenario ID
(e.g. `RELM-1/US1/AS2`). Every interface touched by a feature has provider verification and
consumer contract tests, including negative cases. Tests land in the same pull request as the
behavior they verify.
*Check: CI test jobs, `/speckit.converge`, QA review.*

### ORG-5 Secure and private by default
No secrets in code, specs, prompts, or logs. Every endpoint enforces authentication and
authorization. Personal data is classified in `data-model.md` and never logged or sent to analytics.
*Check: secret scanning, CodeQL, dependency review, PR review.*

### ORG-6 Observable by design
Services emit structured logs carrying a trace ID and RED metrics (rate, errors, duration) per
endpoint or consumer. Every feature states how each success criterion is measured in production.
*Check: plan review (`Observability` section), dashboards linked before release.*

### ORG-7 Safe, reversible delivery
New behavior ships behind a feature flag, is deployed in the dependency order defined in the
product feature's `impact.md`, and has a rollback path written in `plan.md`.
*Check: plan review, release-readiness gate.*

### ORG-8 Simplicity, justified complexity
No new service, datastore, message broker, or major dependency without an accepted ADR. Any
deviation from these principles is recorded in the plan's Complexity Tracking table.
*Check: `/speckit.analyze`, architecture review.*

### ORG-9 Humans own AI output
A named human owns every pull request and reviews AI-generated code to the same standard as
hand-written code. `/speckit.analyze` reports **0 CRITICAL** findings before `/speckit.implement`,
implementation runs are scoped to one phase at a time, and `/speckit.converge` reports converged
before merge.
*Check: PR template, CODEOWNERS, `sdd-gates / pr-check`.*

### Organization governance
- **Precedence**: Org baseline (Part A) > team overlay (Part B) > repository amendments (Part C).
  If an agent finds a conflict between layers it MUST stop and report it, not choose.
- **Amendments**: only by pull request to `spec-kit-relm/speckit-platform` (`governance/`), reviewed
  by the SDD Guild plus one approver per discipline. Versioned with semantic versioning
  (MAJOR = principle removed/redefined, MINOR = principle added/expanded, PATCH = wording).
- **Propagation**: the propagation bot opens a sync PR in every repository. Repositories MUST be on
  the same MAJOR and at most one MINOR behind; `sdd-gates / constitution-check` fails otherwise.
- **Exceptions**: listed in Part C → *Exceptions* with an ADR link, an owner, and an expiry date.
<!-- END RELM:ORG-BASELINE -->



<!-- BEGIN RELM:TEAM-QA v1.0.0 | source: spec-kit-relm/speckit-platform/presets/relm-qa/templates/constitution-template.md | owner: @spec-kit-relm/qa | DO NOT EDIT OUTSIDE speckit-platform -->
## Part B — Quality Engineering Overlay (MUST)

Applies to quality-engineering repositories (E2E, performance, contract-verification suites)
owned by `@spec-kit-relm/qa`.

### QA-1 Shift-left ownership
QA co-owns acceptance criteria with the product owner from `/speckit.specify` onwards and
generates the product feature's checklists (`/speckit.checklist`) before any service plan is
approved. Checklist items are ticked only by humans during review, never by an agent.
*Check: Gate 1 review, checklist diff in PR.*

### QA-2 Scenario traceability
Every Given/When/Then scenario has a stable ID `RELM-<n>/US<k>/AS<m>`. Every automated test title
starts with the scenario ID it verifies, so coverage can be computed from test reports.
*Check: `scenario-coverage` job in e2e-tests.*

### QA-3 Version-pinned environments
E2E suites pin the contract versions they exercise (`contracts.lock.json`) and select expectations
by contract version or capability flag, never by branch name.
*Check: E2E config validation.*

### QA-4 Deterministic suites
No fixed sleeps, no order dependence, no shared mutable test data. A flaky test is quarantined
within 24 hours and fixed or deleted within one sprint; quarantined tests never gate a release.
*Check: flake tracker, nightly rerun report.*

### QA-5 Synthetic data only
Tests use generated or synthetic data. Production data and real personal data are never used in
any test environment.
*Check: data-seeding review, secret/PII scanning.*

### QA-6 Release sign-off is evidence-based
Release readiness requires: all participating repositories converged, contract tests green,
`@smoke` E2E green in staging, and all P1 scenarios passing. QA records the sign-off on the
product feature issue.
*Check: Gate 4 checklist on the feature issue.*
<!-- END RELM:TEAM-QA -->

## Part C — Repository Amendments (MUST)

### E2E-1 Playwright + TypeScript, page objects
Suites use `@playwright/test` with TypeScript. UI interaction goes through page objects in
`pages/`; tests never use raw CSS selectors — role/label locators only (also exercises FE-1).
*Check: `npm run typecheck`; lint rule banning `page.locator('css=…')` in `tests/`.*

### E2E-2 Scenario-first test titles and tags
Every test title starts with its scenario ID (`RELM-<n>/US<k>/AS<m>`) or `SMOKE-<k>`, and carries
tags `@relm-<n>` and, for release gating, `@smoke` (tightens QA-2).
*Check: `npm run coverage:scenarios` (CI report; `--gate` at Gate 4).*

### E2E-3 Data setup through APIs, never through the UI
Test data is created with synthetic values via the providers' APIs using the vendored contracts;
only the behavior under test goes through the UI. Each test owns its data (unique cart IDs).
*Check: PR review; QA-5 data review.*

### E2E-4 The lock file is the single source of versions
`contracts.lock.json` lists the contract versions exercised and capability requirements; it must
match `contracts/vendor/*.yaml` and the product feature's `contracts.lock.md` (tightens QA-3).
*Check: `npm run check:lock` in CI.*

### E2E-5 No sleeps, no retries-as-fix
No `waitForTimeout`; use web-first assertions and polling on API state. `retries` stays 0 in
gating runs; flaky tests get `@quarantine` within 24 h (tightens QA-4).
*Check: lint rule banning `waitForTimeout`; `playwright.config.ts` review.*

### Exceptions
None. <!-- Format: | Rule | Exception | ADR | Owner | Expires | -->

## Repository governance
- Part C is amended by pull request in this repository, approved by the CODEOWNERS of
  `.specify/memory/`, on a dedicated `governance/*` branch (never inside a feature branch).
- Parts A and B change only through the automated governance sync pull request.

**Version**: 1.0.0 | **Ratified**: 2026-11-21 | **Last Amended**: 2026-11-21
**Governance blocks**: RELM:ORG-BASELINE v1.0.0 · RELM:TEAM-QA v1.0.0
