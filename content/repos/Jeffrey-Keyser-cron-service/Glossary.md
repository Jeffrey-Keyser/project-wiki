---
title: Glossary
description: Terms specific to cron-service — jobs, runs, exchanges, and the contracts that glue them together.
---

# Glossary

**Cron job** — a row in `cron_jobs` describing a recurring publish: `name`, `schedule` (cron expression), `queue` (routing key), `exchange`, `payload`, retry policy, and health counters ([schema.sql:3-20](https://github.com/Jeffrey-Keyser/cron-service/blob/main/schema.sql#L3-L20), [src/models/types.ts:1-19](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/models/types.ts#L1-L19)).

**Run** — a single execution of a job, tracked in `cron_job_runs` with status `running | success | failed | retrying` and a `retry_count`. Created on trigger, finalized when publish succeeds, exhausts retries, or fatally errors ([schema.sql:22-30](https://github.com/Jeffrey-Keyser/cron-service/blob/main/schema.sql#L22-L30), [src/services/scheduler.ts:116-147](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/scheduler.ts#L116-L147)).

**Schedule** — a standard cron expression validated by `node-cron`'s `cron.validate` on create/update. The API decorates rows with a human translation via `cronstrue` (`schedule_human`) and the next ISO timestamp via `cron-parser` (`next_run_at`) ([src/routes/jobs.ts:73-77](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/routes/jobs.ts#L73-L77), [src/routes/jobs.ts:240-255](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/routes/jobs.ts#L240-L255)).

**`queue`** — confusingly named field on `cron_jobs`: it is the **routing key** used when publishing, not necessarily a queue name. Subscribers bind their own queues to `cron.jobs` with that key ([schema.sql:6](https://github.com/Jeffrey-Keyser/cron-service/blob/main/schema.sql#L6), [src/services/scheduler.ts:66-73](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/scheduler.ts#L66-L73)).

**`exchange`** — optional override on `cron_jobs`. Empty string or `cron.jobs` ⇒ publish a full `CronJobTriggered` envelope to the shared `CronExchange`. Any other value ⇒ assert that topic exchange and publish the raw `payload` instead ([src/services/scheduler.ts:64-84](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/scheduler.ts#L64-L84), [src/services/rabbit.ts:95-109](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/rabbit.ts#L95-L109)).

**`CronExchange`** — the shared RabbitMQ exchange definition imported from `@jeffrey-keyser/message-contracts`. Asserted at connect time using its `name`, `type`, and `durable` fields ([src/services/rabbit.ts:31-36](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/rabbit.ts#L31-L36)).

**`CronJobTriggered`** — the canonical message envelope for default-exchange publishes: `{ jobId, jobName, schedule, payload, triggeredAt, runId }`. Defined in `@jeffrey-keyser/message-contracts` and used as the published payload type ([src/services/scheduler.ts:74-84](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/scheduler.ts#L74-L84), [README.md:108-119](https://github.com/Jeffrey-Keyser/cron-service/blob/main/README.md#L108-L119)).

**`CronTargets`** — static map of known consumer message-type metadata, served raw at `GET /api/message-types` so the UI can render destinations without knowing them locally ([src/routes/message-types.ts:1-10](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/routes/message-types.ts#L1-L10)).

**Idempotent create** — `POST /api/jobs` upserts on `(name, schedule)`. The `RETURNING *, (xmax = 0) AS inserted` trick lets the route distinguish new rows (201) from re-posts (200), and schedules a `node-cron` task only on actual insert ([src/routes/jobs.ts:78-104](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/routes/jobs.ts#L78-L104), [schema.sql:42-49](https://github.com/Jeffrey-Keyser/cron-service/blob/main/schema.sql#L42-L49)).

**Manual trigger** — `POST /api/jobs/:id/trigger` runs `Scheduler.executeJob` synchronously and returns `{ success, error? }`. Used for ad-hoc reruns from the UI or scripts ([src/routes/jobs.ts:221-235](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/routes/jobs.ts#L221-L235)).

**Retry policy** — per-job: `max_retries` (default 0), `retry_delay_ms` (default 1000), `backoff_multiplier` (default 2). Wait between attempt `n` and `n+1` is `retry_delay_ms * backoff_multiplier^n` ([src/services/scheduler.ts:91-103](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/scheduler.ts#L91-L103), [schema.sql:11-13](https://github.com/Jeffrey-Keyser/cron-service/blob/main/schema.sql#L11-L13)).

**Health columns** — `consecutive_failures`, `last_error`, `last_success_at` on `cron_jobs`. Reset on success, incremented/updated on terminal failure. Provides a quick "is this job healthy?" read without scanning `cron_job_runs` ([schema.sql:15-17](https://github.com/Jeffrey-Keyser/cron-service/blob/main/schema.sql#L15-L17), [src/services/scheduler.ts:136-146](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/scheduler.ts#L136-L146)).

**Bridge** — short for the `openclaw-bridge` admin API. `/api/bridge/*` is a thin HTTP proxy so the SPA can edit handler/bridge config without a direct connection to that other service ([src/routes/bridge.ts:6-62](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/routes/bridge.ts#L6-L62)).

**`CRON_API_KEY`** — static bearer token required on mutating `/api/jobs*` routes. Compared with `timingSafeEqual` to resist timing attacks; absence at boot is fatal ([src/middleware/auth.ts:12-29](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/middleware/auth.ts#L12-L29), [src/validate-env.ts:1-11](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/validate-env.ts#L1-L11)).
