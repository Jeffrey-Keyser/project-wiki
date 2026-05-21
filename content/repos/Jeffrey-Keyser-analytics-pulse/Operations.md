---
title: Operations
description: Deployment, runtime, observability, and on-call notes for Analytics-Pulse.
---

# Operations

## Deployable surfaces

This repo ships three artifacts:
1. A Docker-imaged Lambda function (server), built from `Dockerfile_Server` and pushed to ECR ([README.md:1031-1033](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L1031-L1033)).
2. A static React bundle (client) synced to S3 and fronted by CloudFront ([README.md:1034-1035](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L1034-L1035)).
3. An npm package (`@analytics-pulse/tracking-library`) for browser embedding ([tracking-library/package.json:1-10](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/tracking-library/package.json#L1-L10)).

## Initial deploy

`./scripts/new-service-auto.sh <service-name> <domain>` is the end-to-end path: prerequisite checks, project setup, Terraform init + targeted ECR apply, Docker image build + push, full Terraform apply, env-file updates, commit + push to trigger CI/CD. Target: <10 minutes ([README.md:238-291](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L238-L291)). Supports `--yes` / `-y` for non-interactive runs ([README.md:60-72 of CLAUDE.md](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/CLAUDE.md)).

Requires `GITHUB_TOKEN` and configured AWS CLI; OIDC is the default AWS-auth mode and is configured by Terraform itself ([README.md:353-380](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L353-L380)).

## CI/CD

Push to GitHub triggers workflows that:
- Build the server Docker image and push to ECR
- Update the Lambda function with the new image
- Build the client and sync to S3
- Invalidate the CloudFront distribution

Terraform itself runs manually via `workflow_dispatch` — never on a normal merge ([README.md:1041-1042](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L1041-L1042)).

GitHub Actions uses OIDC and assumes a role identified by the repo variable `AWS_ROLE_ARN`; if OIDC fails, see the troubleshooting matrix in CLAUDE.md ([CLAUDE.md](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/CLAUDE.md), [README.md:353-380](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L353-L380)).

## Runtime

### Server (Lambda)
- Entry point is `server/app.ts`, which exports the Express app wrapped by `createServerlessAppSync` for Lambda ([server/app.ts:245-247](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L245-L247)).
- Local dev: `cd server && npm run dev` (uses `ts-node ./bin/www.ts`) on port `config.PORT` (default 3001) ([server/package.json:7](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/package.json#L7), [README.md:594-597](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L594-L597)).
- Production start (container): `node ./dist/bin/www.js` ([server/package.json:6](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/package.json#L6)).
- Health probe: `GET /health` exposed by `express-server-factory`, includes a `database` check against the connection pool ([server/app.ts:96-157](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L96-L157)).
- Swagger UI at `/api-docs` for live API exploration ([README.md:401-407](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L401-L407)).
- Sessions live in the Postgres `user_sessions` table with a 24-hour TTL ([server/app.ts:122-141](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L122-L141)).

### Client
- `cd client && npm run dev` for Vite dev server (default port 3002 in Docker) ([client/package.json:33](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/client/package.json#L33), [README.md:838-845](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L838-L845)).
- Production: static files in `client/dist/` synced to S3, distributed by CloudFront.

### Scheduled jobs (in-process)
- `dailyAggregation` — `0 1 * * *` UTC, rolls up the previous day for every active project ([server/cron/dailyAggregation.ts:32-36](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/cron/dailyAggregation.ts#L32-L36)).
- `partitionMaintenance` — provisions next-month event partitions, drops stale ones ([server/app.ts:35](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L35)).
- `emailReporting` — dispatches daily / weekly / monthly digests via SES ([server/app.ts:36](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L36)).

Because Lambda freezes between invocations, these jobs rely on Lambda being warm; in practice they're triggered by the same in-process scheduler, which means cold-start gaps can drop a tick. (No `systemd` unit — Lambda manages lifecycle.)

## Observability

- **Logs:** stdout/stderr ship to CloudWatch via the Lambda runtime; the boot banner in `server/app.ts:18-26` is the first line to look for in incident triage ([server/app.ts:18-26](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L18-L26)).
- **Diagnostics endpoint:** `GET /api/v1/diagnostics/detailed` exposes system state (mounted at [server/routes/versions/v1/index.ts:89](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/routes/versions/v1/index.ts#L89)).
- **Performance endpoints** (admin only): `/api/v1/performance`, `/performance/queries`, `/performance/cache`, `/performance/database` ([server/routes/versions/v1/index.ts:147-149](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/routes/versions/v1/index.ts#L147-L149)).
- **Partition health:** `/api/v1/partitions/health` and `/partitions/list` for spot-checking the partition rotation ([server/routes/versions/v1/index.ts:143-145](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/routes/versions/v1/index.ts#L143-L145)).
- **Error reporting:** runtime errors land in GitHub Issues for the repo via the error-reporting service ([server/package.json:37](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/package.json#L37)).

## On-call / runbook hints

- Tracking 5xx? Check Pay auth at boot — `setupPayAuth` throws fatally if Pay is unreachable, so failed boots usually mean Pay is down or `PAY_SERVICE_URL` is wrong ([server/app.ts:39-93](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L39-L93)).
- Aggregation missing? The daily cron is idempotent — admin `/api/v1/aggregation/daily/all` re-runs it ([server/routes/versions/v1/index.ts:141](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/routes/versions/v1/index.ts#L141)).
- Rate limits: tracking endpoints cap at 10,000 req/hour per API key; batch capped at 100 events / 100KB ([README.md:557-561](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L557-L561)).
