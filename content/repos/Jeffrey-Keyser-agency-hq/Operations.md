---
title: Operations
description: Deploy, runtime, observability, and on-call notes for the Agency HQ service.
---

# Operations

Agency HQ is a deployable Express service, not a library — it ships as a systemd user unit that runs `dist/bin/www.js` on port 3040 ([agency-hq.service:9-19](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/agency-hq.service#L9-L19)).

## Start / restart

- **Dev:** `npm run dev` runs `ts-node src/bin/www.ts` ([package.json:7](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/package.json#L7)).
- **Build:** `npm run build` compiles TypeScript via `tsc` ([package.json:8](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/package.json#L8)).
- **Prod restart:** `npm run build && systemctl --user restart agency-hq` ([README.md:92-97](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/README.md#L92-L97)).
- **Hot reload via NanoClaw:** `npm run build:deploy` drops an IPC reload file into `/home/jkeyser/nanoclaw/data/ipc/ops/tasks/` ([package.json:10](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/package.json#L10)).

## Systemd unit

- File: `agency-hq.service` (symlinked into `~/.config/systemd/user/`) ([CLAUDE.md:172-173](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L172-L173)).
- `ExecStartPre` runs `npm run migrate` before each start so the schema is always up to date ([agency-hq.service:8](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/agency-hq.service#L8)).
- `Restart=always`, capped at 5 failures per 60 seconds ([agency-hq.service:12-15](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/agency-hq.service#L12-L15)).
- Environment overrides come from `~/.config/agency-hq/env` ([agency-hq.service:20](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/agency-hq.service#L20)).

## Health & observability

- **HTTP health probe:** `GET /health` returns service + database + result-watcher status ([src/app.ts:72-89](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/app.ts#L72-L89)).
- **Correlation IDs:** every request gets a `traceId` injected by the `correlationId` middleware and echoed on errors ([src/app.ts:110-133](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/app.ts#L110-L133)).
- **Realtime streams:** `/dashboard` SSE, `/api/v1/dispatch-events`, and `/api/v1/meetings/:id/transcript/stream` are exempted from rate limiting so dashboards stay subscribed ([src/app.ts:55-65](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/app.ts#L55-L65)).
- **Critical alerts:** unrecoverable dispatch failures fire Telegram alerts through `services/critical-alerts.ts` instead of writing notifications ([src/services/iteration-engine.ts:29](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/services/iteration-engine.ts#L29), [src/execution/dispatcher.ts:9](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/execution/dispatcher.ts#L9)).
- **Logs:** `journalctl --user -u agency-hq` (systemd user journal); HTTP logging skips `/health` and `/dashboard` to keep the journal readable ([src/app.ts:42](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/app.ts#L42)).

## Data lifecycle

- **Migrations:** `npm run migrate` / `npm run migrate:down` / `npm run migrate:create -- <name>`; always use `migrate:create` to avoid timestamp ordering bugs ([package.json:15-18](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/package.json#L15-L18), [CLAUDE.md:33-37](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L33-L37)).
- **Backups:** nightly gzipped `pg_dump` at 02:00 UTC into `/home/jkeyser/backups/agency-hq/`, 30-day retention; restore via `scripts/restore-agency-hq.sh` ([README.md:99-104](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/README.md#L99-L104)).
- **Smoke gate:** `scripts/smoke-test-gate.sh` is the pre-sprint gate check invoked by `/api/v1/smoke-test` ([CLAUDE.md:53](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L53)).

## On-call quick checks

1. `curl -s localhost:3040/health | jq` — database + result-watcher status.
2. `systemctl --user status agency-hq` — process and recent restart history.
3. `journalctl --user -u agency-hq -n 200` — recent logs.
4. Telegram CEO thread — critical alerts land here ([src/execution/dispatcher.ts:8-9](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/execution/dispatcher.ts#L8-L9)).
