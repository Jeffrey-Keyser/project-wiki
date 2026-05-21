---
title: Operations
description: Runtime, deploy, logs, health, and on-call notes for the qa-patrol service.
---

# Operations

QA Patrol is a deployable service, not a library — it runs as a persistent user-mode systemd unit on the beelink host.

## Runtime

- **Start command (prod)**: `npm start` → `node dist/bin/www.js` ([package.json:8](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/package.json#L8)).
- **Dev**: `npm run dev` → `ts-node src/bin/www.ts` ([package.json:6](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/package.json#L6)).
- **Port**: 3042 ([CLAUDE.md:10](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L10)).
- **Display**: `DISPLAY=:99` (Xvfb) required for system Chrome ([CLAUDE.md:9](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L9)).
- **Systemd unit**: `qa-patrol.service` (user scope) ([CLAUDE.md:10](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L10)).
- **Public URL**: https://qa-patrol.jeffreykeyser.net (Cloudflare Tunnel) ([README.md:58](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L58)).

## Deploy

Production deploys flow through the **beelink-deploy webhook** ([README.md:59](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L59)). Manual restart:

```bash
systemctl --user restart qa-patrol
```

Source: [CLAUDE.md:20](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L20).

## Migrations

```bash
npm run migrate           # apply
npm run migrate:down      # revert last
npm run migrate:create    # scaffold new
```

Source: [package.json:10-12](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/package.json#L10-L12). Migrations live in `migrations/` and are run via `node-pg-migrate` ([migrations/](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/migrations/)).

## Health probe

`GET /health` returns aggregated status from two checks ([app.ts:83-92](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/src/app.ts#L83-L92)):

- **database** — `createDatabaseHealthCheck(pool)` from `express-server-factory` ([app.ts:32](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/src/app.ts#L32)).
- **rabbitmq** — `rabbitMQ.checkHealth()`; `not_configured` is reported as healthy so dev environments without RMQ still pass ([app.ts:38-50](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/src/app.ts#L38-L50)).

Health requests are excluded from request logging ([app.ts:67-68](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/src/app.ts#L67-L68)).

## Logging

- HTTP request log: morgan `dev` format via `express-server-factory` ([app.ts:66](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/src/app.ts#L66)).
- Errors: routed through `errorHandling.logger`, with stack traces only in development ([app.ts:101-110](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/src/app.ts#L101-L110)).
- Service logs: `journalctl --user -u qa-patrol -f` (standard systemd-user pattern; service unit lives outside the repo).

## Storage

- **Postgres**: DB `qa_patrol`, schema `qa`, user `jeff` ([CLAUDE.md:8](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L8)).
- **Evidence**: `evidence/runs/<runId>/` on local disk; gitignored; served at `/evidence/runs/:runId/:filename` ([CLAUDE.md:42](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L42), [app.ts:16-18](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/src/app.ts#L16-L18)).
- **Retention**: keep-latest-per-group strategy; eager cleanup on completion + daily 3am cron sweep for orphans ([CLAUDE.md:55](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L55), [README.md:233](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L233)).

## On-call notes

- **Symptom: runs error immediately** — usually Xvfb (`DISPLAY=:99`) or Chrome path issue ([README.md:177](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L177)).
- **Symptom: auth fails on pay-auth targets** — verify Solo Vault secrets and that the target is reached via its public HTTPS URL, not localhost; localhost trips CORS on Pay auth ([README.md:248](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L248)).
- **Symptom: completion notifications missing** — completion hooks are fire-and-forget; check publisher health and confirm RabbitMQ is reachable ([CLAUDE.md:54](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L54)).
- **Synchronous execution caveat** — long step arrays block the request connection until Playwright finishes; no async queue exists yet ([README.md:175](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L175)).
