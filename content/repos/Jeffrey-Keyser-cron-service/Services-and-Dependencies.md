---
title: "Services and Dependencies"
description: "What cron-service depends on at runtime and who is confirmed or expected to call or consume it. Unconfirmed consumers are marked as unknown."
---

# Services and Dependencies

## Depends on

### Confirmed runtime dependencies

- **PostgreSQL.** Required for job and run state. The pool is built from `DATABASE_URL` ([src/services/db.ts:3-5](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/db.ts#L3-L5)). Startup fails if `SELECT 1` fails ([src/index.ts:145](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L145), [src/index.ts:161-164](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L161-L164)).
- **RabbitMQ.** Required for startup. `rabbit.connect()` runs before jobs load ([src/index.ts:149-153](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L149-L153)). The URL comes from `RABBITMQ_URL`, defaulting to `amqp://localhost` ([src/services/rabbit.ts:25](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/rabbit.ts#L25)).
- **systemd ordering.** The unit lists `postgresql.service` and `rabbitmq-server.service` in `After=`. This orders startup but does not guarantee availability ([cron-service.service:3](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/cron-service.service#L3)).

### Optional dependencies

- **SMTP server.** Used for failure alerts when `SMTP_HOST` is set. Otherwise alerts go to stdout ([src/services/email.ts:3-15](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/email.ts#L3-L15), [src/services/email.ts:20-23](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/email.ts#L20-L23)).
- **openclaw-bridge.** Reached only through `/api/bridge/*`, at `BRIDGE_HOST:BRIDGE_PORT` with defaults `localhost` and `3099` ([src/routes/bridge.ts:6-7](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/routes/bridge.ts#L6-L7)). Whether a bridge is deployed is unknown.

### Key libraries

- `@jeffrey-keyser/message-contracts` at 1.19.0 supplies `CronExchange`, `CronJobTriggered`, and `CronTargets` ([package.json:15](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/package.json#L15), [src/services/rabbit.ts:2](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/rabbit.ts#L2)). Its source is not provided.
- `@jeffrey-keyser/api-errors` supplies typed HTTP errors, `RouteHandler`, and the error middleware ([src/index.ts:10](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L10), [src/index.ts:58-59](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L58-L59)).
- `amqplib`, `node-cron`, `cron-parser`, `cronstrue`, `pg`, `pino`, `nodemailer`, and `express` do the work named by their imports. For example, `node-cron` provides scheduling ([src/services/scheduler.ts:1](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L1)).

## Consumed by

### Confirmed in source

- **The API and UI.** The app serves static files from `public/` and returns `index.html` for non-API paths. Those UI files are not in the provided excerpts ([src/index.ts:49](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L49), [src/index.ts:116-120](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L116-L120)).
- **Seed scripts.** Two scripts POST jobs to `localhost:3016` with a bearer key. They are in the repo, but whether they run in any environment is unknown ([scripts/seed-flights-job.sh:3-4](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/scripts/seed-flights-job.sh#L3-L4), [scripts/seed-flights-job.sh:18-20](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/scripts/seed-flights-job.sh#L18-L20), [scripts/seed-flights-purge-job.sh:23-25](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/scripts/seed-flights-purge-job.sh#L23-L25)).
- **Run completion callers.** `POST /api/runs/:id/downstream-completion` and the correlation-ID variant accept calls from a service or operator holding the key ([src/routes/runs.ts:91](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/routes/runs.ts#L91), [src/routes/runs.ts:106](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/routes/runs.ts#L106)). No caller of these routes is identified in the source.

### Expected but unconfirmed

- **Subscribers on `CronExchange`.** Messages are published with a routing key equal to the job's `queue` ([src/services/scheduler.ts:181](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L181), [src/services/rabbit.ts:86](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/rabbit.ts#L86)). The subscribing services are unknown.
- **Custom-exchange consumers.** Jobs with a non-empty exchange other than the literal `cron.jobs` publish raw payloads to that exchange ([src/services/scheduler.ts:184-190](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L184-L190)). The consumers are unknown.
- **Flights queues.** The seed scripts name queues `flights-parse-emails` and `flights-purge-expired`. This suggests consumers, but no consumer is in the provided source ([scripts/seed-flights-job.sh:4](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/scripts/seed-flights-job.sh#L4), [scripts/seed-flights-purge-job.sh:4](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/scripts/seed-flights-purge-job.sh#L4)).
- **Agency.** The README names Agency as the party that completes work and sends receipts ([README.md:87](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/README.md#L87)). Its implementation and deployment are unknown.
