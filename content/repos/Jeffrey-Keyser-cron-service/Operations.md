---
title: "Operations"
description: "How to start, check, and observe cron-service, with documented versus verified runtime behavior. cron-service is a long-running service, not a library."
---

# Operations

cron-service is a long-running service, not a library. Its package entry point is `dist/index.js` ([package.json:5](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/package.json#L5)). Nothing here was run for this page. Statements below come from source reading or the README, and are labeled as such.

## Commands

- **Build:** `npm run build` (`tsc`) ([package.json:7](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/package.json#L7)).
- **Start:** `npm start` runs `node dist/index.js` after a build ([package.json:8](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/package.json#L8)).
- **Dev:** `npm run dev` runs `ts-node src/index.ts` ([package.json:9](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/package.json#L9)).
- **Test:** `npm test` builds and runs two compiled test files ([package.json:11](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/package.json#L11)).

Required environment variables are `DATABASE_URL`, `RABBITMQ_URL`, and `CRON_API_KEY` ([src/validate-env.ts:1](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/validate-env.ts#L1)). Optional variables cover SMTP and alerts ([README.md:44-50](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/README.md#L44-L50)).

## Boot sequence

`main()` runs these steps in order ([src/index.ts:142-165](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L142-L165)):

1. Test the database with `SELECT 1`.
2. Connect to RabbitMQ and assert the shared exchange.
3. Load enabled jobs into the scheduler.
4. Start the downstream reconciler.
5. Listen on `PORT`.

Any thrown error logs `fatal` and exits with code 1.

## Systemd

The unit file runs `node dist/index.js` as user `jkeyser` from `/home/jkeyser/cron-service` with `Restart=always` and `RestartSec=5` ([cron-service.service:5-12](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/cron-service.service#L5-L12)). The README documents copying the unit into `/etc/systemd/system` and enabling it ([README.md:209-214](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/README.md#L209-L214)). Whether that host is running now is unknown.

## Health

- `GET /api/health` and `GET /health` run the same handler ([src/index.ts:112-113](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L112-L113)).
- The response is 503 only when the database check fails ([src/index.ts:80](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L80), [src/index.ts:109](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L109)). A RabbitMQ disconnect appears only in the nested check ([src/index.ts:90](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L90)).
- `checks.scheduler.downstreamReconciliation` reports the last sweep, reconciled counts, and the last error ([src/index.ts:93](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L93), [src/services/scheduler.ts:14-22](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L14-L22)).

## Observability

- **Logs.** Pino child loggers use the scopes `server`, `http`, `scheduler`, and `rabbit` ([src/index.ts:20](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L20), [src/index.ts:30](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L30), [src/services/scheduler.ts:10](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L10), [src/services/rabbit.ts:5](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/rabbit.ts#L5)). The HTTP log line covers `/api` requests ([src/index.ts:35-44](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L35-L44)). Logs carry `correlationId` ([src/services/scheduler.ts:225](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L225)).
- **Runs.** `GET /api/runs` filters by status, dispatch and downstream status, stage, and correlation ID ([src/routes/runs.ts:40-77](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/routes/runs.ts#L40-L77)). Each run includes its stages ([src/routes/runs.ts:48-51](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/routes/runs.ts#L48-L51)).
- **Alerts.** Failures send mail to the job's `alert_email`, then `ALERT_EMAIL`, then stdout ([src/services/email.ts:17-23](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/email.ts#L17-L23), [src/services/scheduler.ts:267-272](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L267-L272)).

## Failure handling

- **RabbitMQ.** Reconnects with backoff up to 10 attempts, then logs fatal and sets `disconnected` ([src/services/rabbit.ts:51-62](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/rabbit.ts#L51-L62)).
- **Publish retries.** Governed by `max_retries`, `retry_delay_ms`, and `backoff_multiplier` ([src/services/scheduler.ts:239-256](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L239-L256)).
- **Stale downstream runs.** Dispatched runs pending beyond the timeout are marked failed with a timeout receipt. Defaults are 24 hours and 5 minutes ([src/services/scheduler.ts:11-12](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L11-L12), [src/services/scheduler.ts:112-136](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L112-L136)). The env vars are `CRON_DOWNSTREAM_TIMEOUT_MS` and `CRON_DOWNSTREAM_RECONCILE_INTERVAL_MS` ([src/services/scheduler.ts:102-103](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/services/scheduler.ts#L102-L103)).
- **Shutdown.** SIGTERM and SIGINT stop tasks, close RabbitMQ and the pool, then exit 0 ([src/index.ts:122-140](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/index.ts#L122-L140)).

## Secrets

The README says the production key is stored in a vault under a named path ([README.md:66](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/README.md#L66)). Startup fails if the key is absent ([src/validate-env.ts:1-10](https://github.com/Jeffrey-Keyser/cron-service/blob/8ad749c7ce3502deec7e6699375aabad8f6688b3/src/validate-env.ts#L1-L10)).
