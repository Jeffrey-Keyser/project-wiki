---
title: "Operations"
description: "How to start, deploy, migrate, health-check, and observe Business HQ, with documented commands separated from what the excerpts verify at runtime."
---

# Operations

Business HQ is a long-running HTTP service with background consumers, not a library. It is started from `dist/bin/www.js` ([package.json:9](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/package.json#L9)).

## Start and runtime

- **Local dev**: `npm run dev` runs `ts-node src/bin/www.ts` ([package.json:7](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/package.json#L7)).
- **Production start**: `npm start` runs `node dist/bin/www.js` after `npm run build` ([package.json:8-9](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/package.json#L8-L9)).
- **systemd unit**: runs `/usr/bin/node` on `dist/bin/www.js` from the working directory ([business-hq.service:6-7](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/business-hq.service#L6-L7)). It sets `PORT=3041` and `NODE_ENV=production` ([business-hq.service:8-9](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/business-hq.service#L8-L9)).
- **Restart policy**: `Restart=always` with `RestartSec=5` ([business-hq.service:10-11](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/business-hq.service#L10-L11)).
- **Other configuration**: `RABBITMQ_URL` and database settings come from the environment ([src/services/rabbit.ts:4](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/rabbit.ts#L4), [src/config/env.ts:36-47](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/config/env.ts#L36-L47)). The DB pool max is 5 ([src/config/env.ts:43](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/config/env.ts#L43)). The units of the timeout values are not stated in the excerpt.

## Deploy

```bash
npm run build
systemctl --user restart business-hq
```

Source: [README.md:70-72](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/README.md#L70-L72). The unit file is kept in the repo and should be symlinked into `~/.config/systemd/user/` ([CLAUDE.md:59](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/CLAUDE.md#L59)).

**Documented versus verified.** The commands above are documented. The excerpts do not show that the unit is installed or running on any host, so current deployment state is unknown.

## Tests

`npm test` runs `npx vitest run` ([package.json:11](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/package.json#L11)). Test files are not in the excerpts.

## Database migrations

```bash
npm run migrate         # forward
npm run migrate:down    # roll back the last migration
```

These run `scripts/run-migrate.js` and `scripts/run-migrate-down.js` ([package.json:12-13](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/package.json#L12-L13)). The schema for the Absurd engine is defined in `src/db/absurd-schema.sql` ([src/db/absurd-schema.sql:1-6](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/db/absurd-schema.sql#L1-L6)). How that file is applied is not shown in the excerpts.

## Health

`GET /health` is enabled and includes a database check ([src/app.ts:54-62](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/app.ts#L54-L62)). Health requests are excluded from HTTP request logs ([src/app.ts:39](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/app.ts#L39)). The check's status codes and query are not shown in the excerpts, so response behavior is unknown.

## Observability

- Logging uses `console` with bracketed prefixes such as `[www]`, `[rabbit]`, `[pay-consumer]`, `[agency-consumer]`, `[cron-consumer]`, `[absurd]`, and `[snapshot]` ([src/bin/www.ts:22](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/bin/www.ts#L22), [src/services/absurd.ts:124](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/absurd.ts#L124)). No structured logger is shown.
- Error logs include stack traces only in development ([src/app.ts:70-76](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/app.ts#L70-L76)).
- RabbitMQ reconnects with exponential backoff from 1000 ms to a 60000 ms cap ([src/services/rabbit.ts:6-7](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/rabbit.ts#L6-L7), [src/services/rabbit.ts:98-101](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/rabbit.ts#L98-L101)).
- Metrics, tracing, and alerting are not shown in the excerpts.

## Graceful shutdown

On SIGTERM or SIGINT, the process closes Absurd, disconnects RabbitMQ, then closes the server. A 10-second timer forces exit ([src/bin/www.ts:39-50](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/bin/www.ts#L39-L50)).

## Playbook notes

- **Duplicate revenue.** `payment.succeeded` is deduplicated on `stripe_payment_id` ([src/services/pay-consumer.ts:22-30](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/pay-consumer.ts#L22-L30)). `subscription.created` has no such check ([src/services/pay-consumer.ts:61-77](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/pay-consumer.ts#L61-L77)).
- **Missing daily snapshot.** Check for `[cron-consumer]` and `[absurd]` log lines. A manual trigger is the exported `spawnDailySnapshot(date, hour)` ([src/services/absurd.ts:109-115](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/absurd.ts#L109-L115)). The idempotency key includes the hour ([src/services/absurd.ts:112](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/absurd.ts#L112)).
- **Requeue loops.** Consumer errors nack with requeue ([src/services/rabbit.ts:181](https://github.com/Jeffrey-Keyser/business-hq/blob/9fa76d7545fdce535b7a3a89236c2309937f4671/src/services/rabbit.ts#L181)). Repeated failures may redeliver. Behavior under persistent failure is not verified here.
