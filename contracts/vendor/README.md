# Vendored contracts (READ-ONLY)

Used to seed data via APIs and to assert API-level scenarios. Versions MUST match
`contracts.lock.json` (QA-3, E2E-4). Re-vendor with the same `gh api … ?ref=<contract>-v<version>`
procedure as the other consumers.

| File | Provider | Version | Source tag | Vendored on |
|------|----------|---------|------------|-------------|
| `inventory-api.yaml` | spec-kit-relm/inventory-service | 1.1.1 | `inventory-api-v1.1.1` | 2026-11-22 |
| `orders-api.yaml` | spec-kit-relm/orders-service | 1.3.1 | `orders-api-v1.3.1` | 2026-11-22 |
