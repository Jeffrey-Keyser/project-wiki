---
title: Architecture
description: Internal module layout of the Cream City Web repo — operator runbook, scripts, API server, workers, templates, and shared Postgres database.
---

# Architecture

Cream City Web is a single Node 22 ESM workspace ([.nvmrc](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/.nvmrc) + [package.json:5](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/package.json#L5)) organized into a runbook, a set of CLI scripts, a long-running HTTP server, a static-site server, a Cloudflare worker, and a Postgres schema.

## Component diagram

```mermaid
flowchart LR
  Trigger[cron-service / ad-hoc] -->|RabbitMQ ccw.run| Bridge[openclaw-bridge]
  Bridge --> Session[Claude Code session]
  Session --> Scripts[(scripts/*.mjs CLIs)]
  Scripts --> DB[(PostgreSQL cream_city_web)]
  Scripts --> Sites[sites/{slug}/]
  Scripts --> Templates[templates/{general,restaurant,services}]
  Scripts --> Resend[Resend API]
  Scripts --> PayAPI[pay-api.jeffreykeyser.net]
  API[api/server.mjs Express] --> DB
  API --> PayAPI
  API --> Resend
  Stripe[Stripe Webhooks] --> API
  Serve[scripts/serve.mjs static] --> Sites
  Tunnel[Cloudflare Tunnel] --> Serve
  Worker[workers/email-receiver CF Worker] --> Webhook[webhook.creamcityweb.com]
  Webhook --> Bridge
```

## Role contracts

### Operator runbook (`CLAUDE.md`)
Defines identity, run procedure, decision framework, compliance, and escalation policy that every Claude session must follow ([CLAUDE.md:1-189](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/CLAUDE.md#L1-L189)). Outreach is currently gated behind three explicit prerequisites ([CLAUDE.md:104-128](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/CLAUDE.md#L104-L128)).

### Scripts (`scripts/*.mjs`)
Operator-invoked CLIs. Notable entries:
- `run.mjs` — start/end/log run rows, send Telegram via NanoClaw IPC ([scripts/run.mjs:23-34](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/scripts/run.mjs#L23-L34)).
- `leads.mjs`, `scout.mjs`, `lead-queries.mjs` — pipeline CRUD + scoring ([tools.md:65-83](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/tools.md#L65-L83)).
- `build-site.mjs`, `site.mjs`, `site-modifier.mjs`, `staging.mjs` — render templates into `sites/{slug}/` ([tools.md:85-100](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/tools.md#L85-L100)).
- `deploy.mjs` — create DNS, update DB, test live URL via Cloudflare Tunnel ([tools.md:91-96](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/tools.md#L91-L96)).
- `send-email.mjs`, `poll-email.mjs`, `email-intent.mjs`, `approval-flow.mjs` — Resend outbound + inbound intent classification ([scripts/poll-email.mjs:1-26](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/scripts/poll-email.mjs#L1-L26)).
- `billing.mjs`, `secrets.mjs`, `db.mjs`, `serve.mjs` — billing CLI, Solo Vault secret loader, pg pool helper, static file server.

### Express payment API (`api/server.mjs`)
Long-running HTTP service on `CCW_API_PORT` (default 3051). Routes: `POST /payment/verify-code`, `POST /payment/create-checkout`, `POST /webhook/stripe`, `GET /health` ([api/server.mjs:1-12](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/api/server.mjs#L1-L12)). Loads `.env` then overrides with Solo Vault secrets ([api/server.mjs:26-44](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/api/server.mjs#L26-L44)).

### Static site server (`scripts/serve.mjs`)
Serves rendered sites on port 3050 behind a Cloudflare Tunnel — the systemd unit `cream-city-web-server` is wired to this script ([cream-city-web-server.service:6-12](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/cream-city-web-server.service#L6-L12)).

### Email receiver worker (`workers/email-receiver`)
Cloudflare Worker `ccw-email-receiver` POSTs incoming mail to `webhook.creamcityweb.com/email/inbound` ([workers/email-receiver/wrangler.toml:1-7](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/workers/email-receiver/wrangler.toml#L1-L7)). Webhook forwards through openclaw-bridge into a Claude session for intent processing ([tools.md:37-43](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/tools.md#L37-L43)).

### Templates (`templates/`)
Three layout families — `general`, `restaurant`, `services` — consumed by `build-site.mjs <template> <data.json> sites/{slug}` ([tools.md:85-89](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/tools.md#L85-L89)). Treated as starting points, not rigid molds ([CLAUDE.md, Creative Philosophy section](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/CLAUDE.md)).

### Postgres schema (`schema.sql`)
Defines `leads`, `outreach`, `customers`, `sites`, `staging_sites`, `spend`, `suppression_list`, `runs` ([README.md:18-27](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/README.md#L18-L27)). Reset via `npm run db:reset` ([package.json:7](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/package.json#L7)).
