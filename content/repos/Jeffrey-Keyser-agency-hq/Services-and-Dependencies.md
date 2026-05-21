---
title: Services & Dependencies
description: What agency-hq depends on and what depends on it.
---

# Services & Dependencies

## Depends on

- **PostgreSQL 17** — `agency` schema; migrations live in `migrations/` and run via `node-pg-migrate` ([README.md:31](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/README.md#L31), [package.json:30](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/package.json#L30)).
- **RabbitMQ** via `amqplib` — heartbeats, dispatch events, task completion ([package.json:26](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/package.json#L26), [src/execution/index.ts:30-49](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/execution/index.ts#L30-L49)).
- **dev-inbox** — invoked as a child process through `/home/jkeyser/dev-inbox/scripts/manager-standalone.sh`; agency-hq is the upstream planner, dev-inbox the executor ([src/execution/dispatcher.ts:28](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/execution/dispatcher.ts#L28)).
- **Telegram Bot API** — inbound via the `/webhook` router, outbound through `services/ceo-telegram.ts` and `services/telegram-cards.ts` ([README.md:47](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/README.md#L47), [src/execution/dispatcher.ts:8](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/execution/dispatcher.ts#L8)).
- **NanoClaw IPC** — `build:deploy` writes a reload-IPC JSON file into `/home/jkeyser/nanoclaw/data/ipc/ops/tasks/` to hot-reload the service ([package.json:10](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/package.json#L10)).
- **prompt-registry** — `lib/prompt-registry.ts` resolves prompt keys remotely for dispatch ([src/execution/dispatcher.ts:24](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/execution/dispatcher.ts#L24)).
- **Internal NPM packages** (GitHub Packages registry): `@jeffrey-keyser/database-base-config`, `@jeffrey-keyser/express-server-factory`, `@jeffrey-keyser/message-contracts` ([package.json:23-25](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/package.json#L23-L25), [package.json:45-47](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/package.json#L45-L47)).
- **Express 5 + TypeScript runtime** — express, pg, dotenv, vitest, eslint ([package.json:22-44](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/package.json#L22-L44)).
- **Cron / shell** — nightly backups via `scripts/backup-agency-hq.sh` writing to `/home/jkeyser/backups/agency-hq/` ([README.md:101-104](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/README.md#L101-L104)).

## Consumed by

- **The human operator** — through the Telegram CEO interface and the dashboard UI on port 3040 ([agency-hq.service:19](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/agency-hq.service#L19), [README.md:21](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/README.md#L21)).
- **dev-inbox** — reads dispatched prompts and reports completion / heartbeats back over RabbitMQ ([src/execution/dispatcher.ts:28](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/execution/dispatcher.ts#L28)).
- **business-hq** — sibling strategy layer that pulls ecosystem facts from agency-hq's `repos` / `services` tables to attribute revenue and cost ([CLAUDE.md:11-13](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L11-L13), [CLAUDE.md:54](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L54)).
- **NanoClaw** — the local model harness restarts agency-hq via the IPC reload file written by `build:deploy` ([package.json:10](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/package.json#L10)).
- **External wiki / dashboards** — anything fetching `/api/v1/dashboard`, `/api/v1/stats`, or the SSE streams ([CLAUDE.md:46-54](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L46-L54)).
