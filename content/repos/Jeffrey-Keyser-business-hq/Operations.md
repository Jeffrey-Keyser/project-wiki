---
title: Operations
description: Deploy, runtime, observability, and on-call notes for the business-hq systemd service.
---

# Operations

## Runtime

- **Process**: single Node process running `dist/bin/www.js` ([business-hq.service:7](https://github.com/Jeffrey-Keyser/business-hq/blob/main/business-hq.service#L7)).
- **Port**: `3041` ([business-hq.service:8](https://github.com/Jeffrey-Keyser/business-hq/blob/main/business-hq.service#L8)).
- **Restart policy**: `Restart=always`, `RestartSec=5` ([business-hq.service:10-11](https://github.com/Jeffrey-Keyser/business-hq/blob/main/business-hq.service#L10-L11)).
- **Environment**: `NODE_ENV=production`, `PORT=3041` baked into unit; other config (e.g., `RABBITMQ_URL`, DB creds) read from `.env` via `dotenv` ([package.json:22](https://github.com/Jeffrey-Keyser/business-hq/blob/main/package.json#L22), [src/services/rabbit.ts:4](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/rabbit.ts#L4)).

## Deploy

```bash
npm run build
systemctl --user restart business-hq
```

Source: [README.md:70-73](https://github.com/Jeffrey-Keyser/business-hq/blob/main/README.md#L70-L73). Systemd unit lives at the repo root and is expected to be symlinked into `~/.config/systemd/user/` ([CLAUDE.md:59](https://github.com/Jeffrey-Keyser/business-hq/blob/main/CLAUDE.md#L59)).

## Database migration

```bash
npm run migrate         # forward
npm run migrate:down    # rollback last
```

`node-pg-migrate` driven; new migrations created via `npm run migrate:create -- <name>` ([package.json:12-14](https://github.com/Jeffrey-Keyser/business-hq/blob/main/package.json#L12-L14)).

## Health probe

`GET /health` — returns service status plus a Postgres health check that issues a real query via the shared pool ([src/app.ts:21](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/app.ts#L21), [src/app.ts:54-62](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/app.ts#L54-L62)). Health requests are excluded from the `dev` HTTP log to keep noise down ([src/app.ts:39](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/app.ts#L39)).

## Logs / observability

- Console-only. No structured logger configured; key surfaces tag prefixes — `[pay-consumer]`, `[agency-consumer]`, `[cron-consumer]`, `[absurd]`, `[www]`, `[snapshot]`. Tail via `journalctl --user -u business-hq -f`.
- Absurd worker logs spawn results and per-step progress including idempotency hits ([src/services/absurd.ts:61-64](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/absurd.ts#L61-L64), [src/services/absurd.ts:98](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/absurd.ts#L98)).
- RabbitMQ reconnect logic with exponential backoff: initial 1s, max 60s, 10 retries ([src/services/rabbit.ts:6-8](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/rabbit.ts#L6-L8)).

## Graceful shutdown

SIGTERM/SIGINT close Absurd worker, disconnect RabbitMQ, then close HTTP. 10s force-exit timer guards against hangs ([src/bin/www.ts:38-50](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/bin/www.ts#L38-L50)).

## On-call playbook

- **`/health` 503**: Postgres unreachable — check shared DB instance first.
- **Daily snapshot missing**: confirm `cron.jobs` publisher fired; look for `[cron-consumer] Daily snapshot triggered` and `[absurd] save-snapshot` in journalctl. Manual replay: spawn the Absurd task by publishing `business.daily-snapshot` to `cron.jobs`, or call `spawnDailySnapshot(date, hour)` ([src/services/absurd.ts:109-115](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/absurd.ts#L109-L115)).
- **Duplicate revenue**: pay-consumer dedupes on `stripe_payment_id`; a duplicate row implies the upstream sent a different ID or used a non-Stripe `source` ([src/services/pay-consumer.ts:23-30](https://github.com/Jeffrey-Keyser/business-hq/blob/main/src/services/pay-consumer.ts#L23-L30)).
