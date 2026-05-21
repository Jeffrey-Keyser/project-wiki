---
title: cron-service Overview
description: Lightweight cron scheduler that publishes job-trigger messages to RabbitMQ on schedule, with a Postgres-backed job catalog and admin UI.
---

# cron-service

`cron-service` is a lightweight scheduler that fires cron jobs by **publishing messages to RabbitMQ** — it does no work itself. Subscriber services in the wider ecosystem consume those messages and do the actual job ([README.md:1-3](https://github.com/Jeffrey-Keyser/cron-service/blob/main/README.md#L1-L3)).

Job definitions and run history live in PostgreSQL; an Express HTTP API and static SPA in `public/` provide CRUD plus manual triggers ([README.md:5-12](https://github.com/Jeffrey-Keyser/cron-service/blob/main/README.md#L5-L12), [src/index.ts:49-55](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/index.ts#L49-L55)).

## At a glance

- **Language / runtime**: TypeScript on Node, compiled with `tsc` to `dist/` ([package.json:6-12](https://github.com/Jeffrey-Keyser/cron-service/blob/main/package.json#L6-L12)).
- **Web framework**: Express 5 ([package.json:21](https://github.com/Jeffrey-Keyser/cron-service/blob/main/package.json#L21)).
- **Scheduler**: `node-cron` in-process timers, one `ScheduledTask` per enabled job ([src/services/scheduler.ts:1-40](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/scheduler.ts#L1-L40)).
- **Persistence**: PostgreSQL via `pg` pool — tables `cron_jobs`, `cron_job_runs` ([schema.sql:3-30](https://github.com/Jeffrey-Keyser/cron-service/blob/main/schema.sql#L3-L30), [src/services/db.ts:1-14](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/db.ts#L1-L14)).
- **Transport out**: RabbitMQ via `amqplib`, publishes to `cron.jobs` exchange or custom exchange ([src/services/rabbit.ts:24-49](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/rabbit.ts#L24-L49), [src/services/scheduler.ts:64-84](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/scheduler.ts#L64-L84)).
- **Auth**: static `CRON_API_KEY` Bearer token required for mutating routes; reads are unauthenticated ([README.md:53-66](https://github.com/Jeffrey-Keyser/cron-service/blob/main/README.md#L53-L66), [src/middleware/auth.ts:12-29](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/middleware/auth.ts#L12-L29)).
- **Default port**: `3016` ([README.md:39](https://github.com/Jeffrey-Keyser/cron-service/blob/main/README.md#L39)).
- **Deploy**: systemd unit `cron-service.service` runs `node dist/index.js` as user `jkeyser` ([cron-service.service:1-15](https://github.com/Jeffrey-Keyser/cron-service/blob/main/cron-service.service#L1-L15)).

## Who uses it

- **Other services in the Jeffrey-Keyser ecosystem** that subscribe to `cron.jobs` topic keys or custom exchanges declared per job ([src/services/scheduler.ts:64-84](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/scheduler.ts#L64-L84)).
- **Operators**, via the SPA at `/` (served from `public/index.html`) and the JSON API ([src/index.ts:49-55](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/index.ts#L49-L55), [README.md:68-93](https://github.com/Jeffrey-Keyser/cron-service/blob/main/README.md#L68-L93)).

## How work moves through it

1. Operator (or API client with the bearer key) POSTs to `/api/jobs` with `name`, `schedule`, `queue`, optional `exchange` and `payload` ([README.md:96-106](https://github.com/Jeffrey-Keyser/cron-service/blob/main/README.md#L96-L106)).
2. Row lands in `cron_jobs`; an upsert on `(name, schedule)` makes creation idempotent ([src/routes/jobs.ts:78-104](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/routes/jobs.ts#L78-L104), [schema.sql:42-49](https://github.com/Jeffrey-Keyser/cron-service/blob/main/schema.sql#L42-L49)).
3. `Scheduler` registers a `node-cron` task that, on trigger, builds a `CronJobTriggered` message and publishes through `rabbit.publishCronEvent` ([src/services/scheduler.ts:25-84](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/scheduler.ts#L25-L84)).
4. Each run is recorded in `cron_job_runs`; failures retry per job config with exponential backoff, then optionally email-alert ([src/services/scheduler.ts:64-114](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/scheduler.ts#L64-L114)).

## Wiki pages

- [Architecture](./architecture/)
- [Iteration Loop](./iteration-loop/)
- [Services and Dependencies](./services-and-dependencies/)
- [Operations](./operations/)
- [Glossary](./glossary/)
