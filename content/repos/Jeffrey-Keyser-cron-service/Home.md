---
title: "cron-service Overview"
description: "Overview of cron-service, a publisher-only scheduler that sends RabbitMQ messages on cron schedules and records job and run state in PostgreSQL."
---

# cron-service

cron-service is a scheduler that publishes messages to RabbitMQ on cron schedules. The README describes it as publisher-only, with subscriber services doing the actual work ([README.md:3](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/README.md#L3)). It stores job definitions and run records in PostgreSQL and exposes a JSON API and a static UI ([src/index.ts:49](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L49), [src/index.ts:52-55](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L52-L55)).

## At a glance

- **Runtime**: TypeScript compiled with `tsc` into `dist/`, started with `node dist/index.js` ([package.json:5-8](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/package.json#L5-L8)).
- **HTTP**: Express 5 app on `PORT`, defaulting to 3016 ([src/index.ts:25](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L25), [package.json:21](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/package.json#L21)).
- **Scheduling**: in-process `node-cron` tasks, one per enabled job ([src/services/scheduler.ts:64-78](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L64-L78)).
- **Storage**: PostgreSQL tables `cron_jobs`, `cron_job_runs`, and `cron_job_run_stages` ([schema.sql:3-52](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/schema.sql#L3-L52)).
- **Output**: RabbitMQ publishing through `amqplib` ([src/services/rabbit.ts:80-90](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/rabbit.ts#L80-L90)).
- **Auth**: a static `CRON_API_KEY` bearer token guards mutating routes; reads are open ([src/middleware/auth.ts:12-28](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/middleware/auth.ts#L12-L28), [README.md:55](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/README.md#L55)).
- **Lifecycle**: a successful publish is recorded as dispatch success and awaiting downstream, not as completed work ([src/services/scheduler.ts:317-338](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L317-L338)).

## Who uses it

- **Operators** use the UI served from `public/` and the JSON API. The UI source is not among the provided excerpts, so its contents are unknown here ([src/index.ts:49](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L49), [src/index.ts:118](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L118)).
- **API clients** that hold `CRON_API_KEY` create, update, delete, and trigger jobs ([README.md:57-64](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/README.md#L57-L64)).
- **Downstream services** receive published messages. Which services actually subscribe is unknown from this source; see the Services page.
- **Seed scripts** in `scripts/` provision two jobs against a local instance on port 3016 ([scripts/seed-flights-job.sh:3-4](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/scripts/seed-flights-job.sh#L3-L4), [scripts/seed-flights-purge-job.sh:3-4](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/scripts/seed-flights-purge-job.sh#L3-L4)).

## Main flow

1. A client posts a job. The route requires a bearer key, validates name, schedule, and queue, and upserts on `(name, schedule)` ([src/routes/jobs.ts:60-86](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/routes/jobs.ts#L60-L86)).
2. A newly inserted, enabled job is scheduled immediately ([src/routes/jobs.ts:88-91](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/routes/jobs.ts#L88-L91)). On boot, enabled jobs are loaded first ([src/index.ts:152-153](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L152-L153)).
3. Each execution creates a run with a correlation ID and a `scheduled` stage ([src/services/scheduler.ts:168-170](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L168-L170)).
4. The event is published, then the run moves to `awaiting-downstream` ([src/services/scheduler.ts:184-226](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L184-L226)).
5. A completion or receipt is recorded later with the correlation ID ([src/routes/runs.ts:91-122](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/routes/runs.ts#L91-L122)). Runs still pending after the timeout are marked failed by a sweep ([src/services/scheduler.ts:112-136](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L112-L136)).

## Wiki pages

- [Architecture](../architecture/)
- [Iteration Loop](../iteration-loop/)
- [Services and Dependencies](../services-and-dependencies/)
- [Operations](../operations/)
- [Glossary](../glossary/)
