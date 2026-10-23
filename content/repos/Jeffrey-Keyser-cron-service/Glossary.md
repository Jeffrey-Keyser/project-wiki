---
title: "Glossary"
description: "Project-specific terms used in cron-service code, schema, and README, each tied to its source."
---

# Glossary

**Cron job.** A row in `cron_jobs` with `name`, `schedule`, `queue`, `exchange`, `payload`, retry settings, and health columns ([schema.sql:3-20](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/schema.sql#L3-L20)).

**Run.** One execution of a job, stored in `cron_job_runs`. Each run has a `status`, `retry_count`, and a `correlation_id` ([schema.sql:22-31](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/schema.sql#L22-L31)).

**Stage.** An append-only entry in `cron_job_run_stages`. The allowed values are `scheduled`, `dispatched`, `awaiting-downstream`, `downstream-completed`, `retrying`, and `failed` ([schema.sql:43-52](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/schema.sql#L43-L52)).

**Dispatch status.** The run field recording whether RabbitMQ accepted the event. Values are `pending`, `success`, and `failed` ([src/models/types.ts:30](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/models/types.ts#L30), [src/services/scheduler.ts:334](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L334)).

**Downstream status.** The run field for the later completion. Values are `pending`, `completed`, and `failed`. It is separate from dispatch status ([src/models/types.ts:31](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/models/types.ts#L31), [src/routes/runs.ts:105](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/routes/runs.ts#L105)).

**Correlation ID.** A UUID created per run and sent in every published message. It is the shared identifier to search for in RabbitMQ payloads, logs, and downstream records ([src/services/scheduler.ts:169](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L169), [README.md:132-136](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/README.md#L132-L136)).

**Downstream completion.** A call that records a completion or receipt against a run. It takes `status` of `completed` or `failed`, with `completed` as the default ([src/routes/runs.ts:12](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/routes/runs.ts#L12)). Calls by correlation ID are for custom-exchange consumers ([src/routes/runs.ts:89-90](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/routes/runs.ts#L89-L90)).

**Reconciliation sweep.** A timer that marks stale pending dispatched runs as failed with a timeout receipt ([src/services/scheduler.ts:112-136](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L112-L136)).

**`queue`.** The routing key used on publish, not necessarily a queue name ([src/services/scheduler.ts:181](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L181), [schema.sql:7](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/schema.sql#L7)).

**`exchange`.** An optional field on a job. An empty value or the literal `cron.jobs` uses the shared exchange with the full envelope. Any other value publishes the raw payload to that exchange ([src/services/scheduler.ts:184-202](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L184-L202)).

**`CronExchange`.** The shared exchange definition from the contracts package. It is asserted at connect time. Its value is not in the provided source, so it is unverified that it equals `cron.jobs` ([src/services/rabbit.ts:31-36](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/rabbit.ts#L31-L36)).

**`CronJobTriggered`.** The default envelope type, carrying `jobId`, `jobName`, `schedule`, `payload`, `triggeredAt`, `runId`, and `correlation_id` ([src/services/scheduler.ts:192-200](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L192-L200)).

**`CronTargets`.** The contracts export served as-is by `GET /api/message-types` ([src/routes/message-types.ts:6-8](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/routes/message-types.ts#L6-L8)).

**Idempotent create.** `POST /api/jobs` upserts on `(name, schedule)`. The `xmax = 0` check distinguishes a new row from an existing one, and only new enabled rows are scheduled ([src/routes/jobs.ts:71-91](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/routes/jobs.ts#L71-L91)). The table constraint is in [schema.sql:147-155](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/schema.sql#L147-L155).

**Manual trigger.** `POST /api/jobs/:id/trigger` calls `executeJob` and returns its result ([src/routes/jobs.ts:214-227](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/routes/jobs.ts#L214-L227)).

**Retry policy.** Per-job `max_retries` (default 0), `retry_delay_ms` (default 1000), and `backoff_multiplier` (default 2). The wait before retry `n+1` is `retry_delay_ms * backoff_multiplier^n` ([src/services/scheduler.ts:237-240](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L237-L240), [schema.sql:11-13](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/schema.sql#L11-L13)).

**Health columns.** `consecutive_failures`, `last_error`, and `last_success_at` on `cron_jobs`. A successful dispatch resets them ([schema.sql:15-17](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/schema.sql#L15-L17), [src/services/scheduler.ts:339-343](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L339-L343)).

**Bridge.** The `openclaw-bridge` admin API, reached through a thin proxy at `/api/bridge` ([src/routes/bridge.ts:9-11](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/routes/bridge.ts#L9-L11)).

**`CRON_API_KEY`.** The static bearer token for mutating routes. It is compared with `timingSafeEqual` and must be set at boot ([src/middleware/auth.ts:12-28](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/middleware/auth.ts#L12-L28), [src/validate-env.ts:1](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/validate-env.ts#L1)).
