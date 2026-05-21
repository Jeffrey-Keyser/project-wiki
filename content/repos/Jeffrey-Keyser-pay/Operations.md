---
title: Operations
description: Deploy, runtime, observability, and on-call notes for the Pay backend.
---

# Operations

## Deploy target

Pay runs on a VPS as a systemd-managed Node process, **not** a Lambda in the live path ([CLAUDE.md:594-610](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L594-L610)).

- **Service unit**: `pay.service`, executes `node dist/bin/www.js` ([CLAUDE.md:596-599](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L596-L599)).
- **Deploy command**: `./deploy.sh` — `git pull origin main`, `npm install --include=dev`, `npm run build`, kill TCP 3017, `sudo systemctl restart pay` ([deploy.sh:1-17](https://github.com/Jeffrey-Keyser/pay/blob/main/deploy.sh#L1-L17)).
- **Remote trigger**: `ssh <server> "cd /home/jkeyser/pay && ./deploy.sh"` ([CLAUDE.md:602-610](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L602-L610)).

## Runtime

- **Entry**: `server/bin/www.ts` boots `tracing.ts` first then mounts the Express `app` on `PORT` (default `80` in code; `deploy.sh` reserves TCP **3017** as the actual systemd port) ([server/bin/www.ts:10-33](https://github.com/Jeffrey-Keyser/pay/blob/main/server/bin/www.ts#L10-L33), [deploy.sh:14](https://github.com/Jeffrey-Keyser/pay/blob/main/deploy.sh#L14)).
- **Process model**: single Node 20 process, ESM ([server/package.json:5](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L5), [CONTRIBUTING.md:9-13](https://github.com/Jeffrey-Keyser/pay/blob/main/CONTRIBUTING.md#L9-L13)).
- **Backing services**: PostgreSQL + Redis; SMTP, S3, Stripe configurable via env ([CONTRIBUTING.md:59-83](https://github.com/Jeffrey-Keyser/pay/blob/main/CONTRIBUTING.md#L59-L83)).
- **Adapter selection** is environment-driven (`PAYMENT_PROVIDER`, `EMAIL_PROVIDER`, `STORAGE_PROVIDER`, `CACHE_PROVIDER`) ([CLAUDE.md:284-303](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L284-L303)).
- **Migrations** run on deploy host: `npm run migrate` (idempotent), `migrate:mark-baseline` once for existing DBs ([CLAUDE.md:401-413](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L401-L413)).

## Observability

- **Logs**: pino structured logging (`pino`, `pino-http`); systemd journal collects stdout ([server/package.json:70-71](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L70-L71), [server/app.ts:7-9](https://github.com/Jeffrey-Keyser/pay/blob/main/server/app.ts#L7-L9)).
- **Tracing**: OpenTelemetry SDK with auto-instrumentations and OTLP/HTTP exporter — loaded before any instrumented module ([server/bin/www.ts:3-10](https://github.com/Jeffrey-Keyser/pay/blob/main/server/bin/www.ts#L3-L10), [server/package.json:47-50](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L47-L50)).
- **Correlation IDs**: every request gets one via `correlationIdMiddleware`; included in every error response ([CLAUDE.md:758-773](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L758-L773), [server/app.ts:2](https://github.com/Jeffrey-Keyser/pay/blob/main/server/app.ts#L2)).
- **Error mapping**: `HttpErrorMapper` from `@jeffrey-keyser/api-errors`, includes stack/context in dev only ([server/app.ts:45-52](https://github.com/Jeffrey-Keyser/pay/blob/main/server/app.ts#L45-L52)).
- **GitHub auto-issues**: `githubErrorMiddleware` opens issues on uncaught errors ([server/app.ts:3](https://github.com/Jeffrey-Keyser/pay/blob/main/server/app.ts#L3)).
- **Health / docs**: Swagger UI mounted at `/api-docs` ([README.md:140-143](https://github.com/Jeffrey-Keyser/pay/blob/main/README.md#L140-L143)).

## Rollback / on-call

- **Code rollback**: revert the merge on main, rerun `./deploy.sh` ([deploy.sh:5-16](https://github.com/Jeffrey-Keyser/pay/blob/main/deploy.sh#L5-L16)).
- **DB rollback**: `npm run migrate:down` (one step) or `migrate:redo` ([server/package.json:19-22](https://github.com/Jeffrey-Keyser/pay/blob/main/server/package.json#L19-L22)).
- **Token revocation**: `POST /users/admin/revokeToken` blacklists JWTs via Redis ([CLAUDE.md:480-489](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L480-L489)).
- **Stripe payments outage**: set `PAYMENT_PROVIDER=mock` is local-only; in prod, must keep Stripe healthy or implement alternate provider ([CONTRIBUTING.md:78-83](https://github.com/Jeffrey-Keyser/pay/blob/main/CONTRIBUTING.md#L78-L83)).

## Legacy infra (cold path)

Terraform + GitHub Actions workflows for AWS Lambda + API Gateway + ECR + CloudFront still exist (`lambda-push.yml`, `ci-cd-pipeline.yml`, `terraform_deploy.yml`) and could be re-enabled, but the VPS path is the source of truth ([CLAUDE.md:619-630](https://github.com/Jeffrey-Keyser/pay/blob/main/CLAUDE.md#L619-L630), [README.md:156-164](https://github.com/Jeffrey-Keyser/pay/blob/main/README.md#L156-L164)).
