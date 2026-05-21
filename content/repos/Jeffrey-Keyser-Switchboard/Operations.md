---
title: Operations
description: Deploying, running, and observing Switchboard — Lambda + RDS + CloudFront with hybrid Redis caching.
---

# Operations

## Runtime topology

Switchboard runs as a single AWS Lambda fronted by API Gateway, with the React admin served from S3 via CloudFront. PostgreSQL on RDS holds persistent state; Upstash Redis is the L2 cache and pub/sub for SSE ([README.md:155-188](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L155-L188)).

- **Lambda handler:** `server/lambda.ts` → `handler` from `server/app.ts` (cached app instance across warm invocations) ([server/app.ts:223-237](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/app.ts#L223-L237)).
- **Local port:** `PORT` env var (defaults via `server/config/env.ts`); README uses `:3001` for server and `:3000` for client ([README.md:457-459](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L457-L459)).
- **No systemd** — there is no long-running VM; serverless only.

## Start commands

| Task | Command |
|------|---------|
| Local dev server | `cd server && npm run dev` ([server/package.json:7](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/package.json#L7)) |
| Local dev client | `cd client && npm run dev` ([README.md:451-454](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L451-L454)) |
| Production server (in container) | `node ./dist/bin/www.js` ([server/package.json:6](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/package.json#L6)) |
| Build server | `npm run build` (tsc) ([server/package.json:8](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/package.json#L8)) |
| DB migrations | `cd server/db && ./deploy.sh` ([CLAUDE.md:81-91](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L81-L91)) |

## Deploy

- **Infra:** `cd terraform && terraform plan && terraform apply` after populating `terraform.tfvars` from `terraform.tfvars.example` ([CLAUDE.md:127-140](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L127-L140), [README.md:511-537](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L511-L537)).
- **App deploy:** push to `main` triggers `.github/workflows/ci-cd-pipeline.yml`, which builds the Docker image, updates Lambda, syncs the client to S3, and invalidates CloudFront ([README.md:540-552](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L540-L552), [.github/workflows/ci-cd-pipeline.yml](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/.github/workflows/ci-cd-pipeline.yml)).
- **Terraform CI:** `gh workflow run terraform_deploy.yml --field auto-apply=true` ([README.md:548-552](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L548-L552)).
- **Pre-deploy gates:** `./scripts/pre-deployment-check.sh`, then production readiness checklist ([README.md:498-509](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L498-L509)).
- **Post-deploy:** `./scripts/validate-deployment.sh` and `./scripts/smoke-tests.sh` with `ADMIN_JWT` set ([README.md:554-565](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L554-L565)).

## Health & probes

- `GET /health` — registered by `express-server-factory` with a `createDatabaseHealthCheck(pool)` probe ([server/app.ts:91-152](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/app.ts#L91-L152)).
- `GET /ping` — returns `pong` ([server/routes/index.ts:22-24](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/routes/index.ts#L22-L24)).
- `GET /api/v1/diagnostics/detailed` — extended diagnostics, public route ([server/routes/diagnostics.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/routes/diagnostics.ts), [server/app.ts:56-65](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/app.ts#L56-L65)).
- `GET /api/v1/cache/health` and `/stats` — Redis + memory cache visibility ([server/routes/cache.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/routes/cache.ts), [server/routes/versions/v1/index.ts:55-56](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/routes/versions/v1/index.ts#L55-L56)).

## Observability

- **Logs:** Winston in app + console.log lines bootstrap config at cold start ([server/app.ts:24-32](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/app.ts#L24-L32), [server/package.json:50](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/package.json#L50)). Lambda forwards to CloudWatch Logs.
- **Metrics:** `@aws-sdk/client-cloudwatch` powers a `middleware/metrics.ts` emitter ([server/middleware/metrics.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/middleware/metrics.ts), [server/package.json:25](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/package.json#L25)).
- **Targets:** p95 < 100ms, p99 < 200ms, cache hit rate > 80%, error rate < 0.5% ([README.md:393-401](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L393-L401)).
- **Dashboards/alerts:** see `docs/MONITORING.md` and `docs/ALERTS.md` for CloudWatch dashboard and alarm definitions ([docs/MONITORING.md](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/docs/MONITORING.md), [docs/ALERTS.md](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/docs/ALERTS.md)).

## On-call notes

- **Cold start config dump** is logged at every Lambda init — grep for `=== SERVER CONFIGURATION ===` to confirm which env hit ([server/app.ts:25-32](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/app.ts#L25-L32)).
- **Pay auth failures** throw with `Pay authentication setup failed:` and prevent boot — usually `PAY_SERVICE_URL` misconfig ([server/app.ts:81-88](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/app.ts#L81-L88)).
- **SSE timeouts:** Lambda caps HTTP at 30s; heartbeats every 30s, client uses exponential backoff up to 5 reconnects. Long-term, consider API Gateway WebSocket ([CLAUDE.md:305-318](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L305-L318)).
- **Rollback:** see `docs/PRODUCTION_DEPLOYMENT_RUNBOOK.md` ([README.md:573-578](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L573-L578)).
