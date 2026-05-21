---
title: Operations
description: How cron-service is started, monitored, and recovered in production.
---

# Operations

## Start command

Production: `node dist/index.js` (compiled output from `tsc`). Dev: `npm run dev` (`ts-node src/index.ts`) ([package.json:7-10](https://github.com/Jeffrey-Keyser/cron-service/blob/main/package.json#L7-L10), [cron-service.service:9](https://github.com/Jeffrey-Keyser/cron-service/blob/main/cron-service.service#L9)).

Boot sequence (in `main()`):
1. `validateEnv()` — fail-fast if `DATABASE_URL`, `RABBITMQ_URL`, or `CRON_API_KEY` is missing ([src/validate-env.ts:1-11](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/validate-env.ts#L1-L11)).
2. `db.query('SELECT 1')` — verify Postgres.
3. `rabbit.connect()` — open channel and assert `CronExchange`.
4. `scheduler.loadJobs()` — load every `enabled = true` row and register a `node-cron` task.
5. `app.listen(PORT)` — bind HTTP (`PORT` env, default `3016`) ([src/index.ts:139-162](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/index.ts#L139-L162), [README.md:39](https://github.com/Jeffrey-Keyser/cron-service/blob/main/README.md#L39)).

If any step throws, `log.fatal` is emitted and the process exits 1 ([src/index.ts:156-160](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/index.ts#L156-L160)).

## Systemd unit

```ini
[Unit]
After=network.target postgresql.service rabbitmq-server.service

[Service]
Type=simple
User=jkeyser
WorkingDirectory=/home/jkeyser/cron-service
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
```

Source: [cron-service.service:1-15](https://github.com/Jeffrey-Keyser/cron-service/blob/main/cron-service.service#L1-L15). Install with `sudo cp cron-service.service /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable --now cron-service` ([README.md:142-149](https://github.com/Jeffrey-Keyser/cron-service/blob/main/README.md#L142-L149)).

Auto-restart is unconditional with 5s backoff — there is no in-app supervisor beyond that.

## Port and surface

- Default HTTP port: `3016` ([README.md:39](https://github.com/Jeffrey-Keyser/cron-service/blob/main/README.md#L39)).
- `GET /` — SPA from `public/index.html` ([src/index.ts:49-117](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/index.ts#L49-L117)).
- `GET /api/health` and `GET /health` — same handler, returns 200/503 ([src/index.ts:109-110](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/index.ts#L109-L110)).

## Health probe

`/api/health` returns JSON with:
- `checks.database.{status,latency,error}` — from `SELECT 1`
- `checks.rabbitmq.{status,connectionState}` — from `rabbit.status` (`connected` / `reconnecting` / `disconnected`)
- `checks.scheduler.scheduledJobs` — count of in-memory tasks
- `checks.system.{uptime,memory,nodeVersion,platform}`

Source: [src/index.ts:62-107](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/index.ts#L62-L107). Status `503` is returned when the DB ping fails; RabbitMQ disconnect does **not** flip the top-level status, only the nested check ([src/index.ts:80-106](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/index.ts#L80-L106)).

## Observability

- **Logs**: `pino` (`createLogger(scope)` in `src/lib/logger.ts`) — scopes seen: `server`, `http`, `scheduler`, `rabbit`. `http` middleware emits one line per `/api/*` request with method, path, status, durationMs, IP ([src/index.ts:30-47](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/index.ts#L30-L47)).
- **Run history**: every execution writes to `cron_job_runs`, queryable via `GET /api/runs` (paginated, filterable by `status`) ([src/routes/runs.ts:6-30](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/routes/runs.ts#L6-L30)).
- **Job health**: each `cron_jobs` row tracks `consecutive_failures`, `last_error`, and `last_success_at` — updated atomically at the end of each run ([src/services/scheduler.ts:130-147](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/scheduler.ts#L130-L147), [schema.sql:15-17](https://github.com/Jeffrey-Keyser/cron-service/blob/main/schema.sql#L15-L17)).
- **Alerts**: failure email goes to the per-job `alert_email` if set, else `ALERT_EMAIL`, else stdout ([src/services/email.ts:17-32](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/email.ts#L17-L32)).

## Failure modes & recovery

- **RabbitMQ disconnect** — automatic reconnect with exponential backoff, max 10 attempts. After exhaustion the adapter goes `disconnected` and stops retrying; in-flight scheduled triggers will fail and be recorded as failed runs ([src/services/rabbit.ts:38-75](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/rabbit.ts#L38-L75)).
- **Postgres outage** — `executeJob` throws, scheduler logs `Job failed`, no run row written (insert itself fails); systemd does not restart on this since the process is still alive.
- **Per-job retries** — `max_retries`, `retry_delay_ms`, `backoff_multiplier` on `cron_jobs` drive in-run retries; default is no retry (`max_retries = 0`) ([src/services/scheduler.ts:91-103](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/services/scheduler.ts#L91-L103), [schema.sql:11-13](https://github.com/Jeffrey-Keyser/cron-service/blob/main/schema.sql#L11-L13)).
- **Graceful shutdown** — `SIGTERM` / `SIGINT` stop all scheduled tasks, close RabbitMQ, close DB pool, then `process.exit(0)` ([src/index.ts:119-137](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/index.ts#L119-L137)).

## Secrets

`CRON_API_KEY` lives in Solo Vault under `cron-service/production/CRON_API_KEY` per the README; it must be present at boot or the process exits ([README.md:66](https://github.com/Jeffrey-Keyser/cron-service/blob/main/README.md#L66), [src/validate-env.ts:1-11](https://github.com/Jeffrey-Keyser/cron-service/blob/main/src/validate-env.ts#L1-L11)).
