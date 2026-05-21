---
title: Services and Dependencies
description: Runtime dependencies, libraries, and downstream consumers of cron-service.
---

# Services and Dependencies

## Depends on

### Infrastructure

- **PostgreSQL** — job catalog and run history. Connection string in `DATABASE_URL`; schema in `schema.sql` ([README.md:36-37](https://github.com/Jeffrey-Keyser/cron-service/blob/main/README.md#L36-L37), [schema.sql:1-50](https://github.com/Jeffrey-Keyser/cron-service/blob/main/schema.sql#L1-L50), [src/services/db.ts:3-5](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/db.ts#L3-L5)). Systemd ordering requires `postgresql.service` to be up first ([cron-service.service:3](https://github.com/Jeffrey-Keyser/cron-service/blob/main/cron-service.service#L3)).
- **RabbitMQ** — publish target for every job. `RABBITMQ_URL`, default `amqp://localhost` ([src/services/rabbit.ts:24-25](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/rabbit.ts#L24-L25)). Systemd requires `rabbitmq-server.service` ([cron-service.service:3](https://github.com/Jeffrey-Keyser/cron-service/blob/main/cron-service.service#L3)).
- **SMTP server (optional)** — `SMTP_HOST/PORT/USER/PASS/FROM` for failure alerts; falls back to stdout log if unset ([src/services/email.ts:3-32](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/email.ts#L3-L32)).
- **openclaw-bridge (optional)** — proxied via `/api/bridge/*` to `BRIDGE_HOST:BRIDGE_PORT` (default `localhost:3099`). Only required if the operator uses the bridge admin UI through cron-service ([src/routes/bridge.ts:6-7](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/routes/bridge.ts#L6-L7)).

### NPM libraries (runtime)

- `@jeffrey-keyser/api-errors` — typed HTTP errors + `RouteHandler.wrap` + Express error middleware ([package.json:14](https://github.com/Jeffrey-Keyser/cron-service/blob/main/package.json#L14), [src/index.ts:10-59](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/index.ts#L10-L59)).
- `@jeffrey-keyser/message-contracts` — supplies `CronExchange`, `CronJobTriggered`, and `CronTargets` shared with subscriber services ([package.json:15](https://github.com/Jeffrey-Keyser/cron-service/blob/main/package.json#L15), [src/services/rabbit.ts:2](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/rabbit.ts#L2), [src/routes/message-types.ts:2-7](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/routes/message-types.ts#L2-L7)).
- `amqplib` ^0.10.5 — RabbitMQ client ([package.json:16](https://github.com/Jeffrey-Keyser/cron-service/blob/main/package.json#L16)).
- `node-cron` ^4.2.1 — in-process cron timers ([package.json:22](https://github.com/Jeffrey-Keyser/cron-service/blob/main/package.json#L22), [src/services/scheduler.ts:1](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/scheduler.ts#L1)).
- `cron-parser` ^5.5.0 + `cronstrue` ^2.50.0 — next-run computation and human-readable schedule text ([package.json:18-19](https://github.com/Jeffrey-Keyser/cron-service/blob/main/package.json#L18-L19), [src/routes/jobs.ts:3-4](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/routes/jobs.ts#L3-L4)).
- `express` ^5.2.1 + `cors` — HTTP layer ([package.json:17-21](https://github.com/Jeffrey-Keyser/cron-service/blob/main/package.json#L17-L21)).
- `pg` ^8.13.0 — Postgres pool ([package.json:24](https://github.com/Jeffrey-Keyser/cron-service/blob/main/package.json#L24)).
- `pino` ^10.3.1 — structured logging ([package.json:25](https://github.com/Jeffrey-Keyser/cron-service/blob/main/package.json#L25)).
- `nodemailer` ^8.0.6 — failure alert mail ([package.json:23](https://github.com/Jeffrey-Keyser/cron-service/blob/main/package.json#L23)).
- `uuid` ^14.0.0 — run IDs ([package.json:26](https://github.com/Jeffrey-Keyser/cron-service/blob/main/package.json#L26), [src/services/scheduler.ts:2-58](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/scheduler.ts#L2-L58)).
- `dotenv` ^16.4.5 — local `.env` loading ([package.json:20](https://github.com/Jeffrey-Keyser/cron-service/blob/main/package.json#L20), [src/index.ts:1](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/index.ts#L1)).

## Consumed by

- **Any RabbitMQ subscriber** bound to the shared `CronExchange` (default name in message-contracts) with a routing key equal to a job's `queue` field. The default message body is `CronJobTriggered = { jobId, jobName, schedule, payload, triggeredAt, runId }` ([src/services/scheduler.ts:74-84](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/scheduler.ts#L74-L84), [README.md:108-119](https://github.com/Jeffrey-Keyser/cron-service/blob/main/README.md#L108-L119)).
- **Custom-exchange consumers** — if a job sets `exchange` to something other than empty or `cron.jobs`, the raw `payload` is published verbatim to that topic exchange. Used to integrate with subscribers that own their own message envelopes ([src/services/scheduler.ts:64-73](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/scheduler.ts#L64-L73), [src/services/rabbit.ts:95-109](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/rabbit.ts#L95-L109)).
- **Operator dashboard** — the SPA in `public/index.html`, served from `/`, plus any external script using the JSON API with the bearer token ([src/index.ts:49-117](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/index.ts#L49-L117), [README.md:53-64](https://github.com/Jeffrey-Keyser/cron-service/blob/main/README.md#L53-L64)).
- **Seed scripts** — `scripts/seed-flights-job.sh` and `scripts/seed-flights-purge-job.sh` POST jobs into a running instance using `CRON_API_KEY`, an example of an external system provisioning cron entries ([README.md:96-106](https://github.com/Jeffrey-Keyser/cron-service/blob/main/README.md#L96-L106)).

## External admin coupling

`openclaw-bridge` is the only outbound HTTP integration. Failures return `502 Bridge unreachable` or `504 Bridge timeout` instead of cascading into the scheduler ([src/routes/bridge.ts:32-46](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/routes/bridge.ts#L32-L46)).
