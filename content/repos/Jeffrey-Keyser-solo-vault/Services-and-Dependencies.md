---
title: Services and Dependencies
description: Inbound and outbound integrations — what Solo Vault depends on and what depends on it.
---

# Services and Dependencies

Solo Vault sits at the bottom of the Jeffrey-Keyser ecosystem stack: most other services depend on it for runtime configuration, while it itself depends only on PostgreSQL, AWS, and a few shared internal libraries.

## Depends on

### Runtime infrastructure
- **AWS Lambda + API Gateway** — production runtime; the app exports a `handler` via `serverless-http` ([server/app.ts:147-156](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/app.ts#L147-L156)).
- **AWS ECR** — container registry for the Lambda image, pushed from `Dockerfile_Server` ([.github/workflows/ci-cd-pipeline.yml:112-119](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/.github/workflows/ci-cd-pipeline.yml#L112-L119)).
- **AWS Secrets Manager** — holds the `VAULT_ENCRYPTION_KEY` (stated in README security section) ([README.md:277-282](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/README.md#L277-L282)).
- **PostgreSQL** — single source of truth for secrets, api keys, audit, rotation, webhooks; schema name configurable via `DATABASE_SCHEMA` (default `vault`) ([CLAUDE.md:46-50](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/CLAUDE.md#L46-L50), [server/package.json:32](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/package.json#L32)).
- **Terraform** — infrastructure-as-code under `terraform/` provisions the Lambda, API Gateway, and supporting resources ([terraform/](https://github.com/Jeffrey-Keyser/solo-vault/tree/main/terraform)).

### Shared internal npm packages
- `@jeffrey-keyser/express-server-factory` — composes the Express app, swagger, CORS, health checks ([server/package.json:20](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/package.json#L20)).
- `@jeffrey-keyser/express-middleware-suite` — middleware bundle ([server/package.json:19](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/package.json#L19)).
- `@jeffrey-keyser/database-base-config` — DB config helpers ([server/package.json:18](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/package.json#L18)).
- `@jeffrey-keyser/api-errors` — shared error classes ([server/package.json:17](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/package.json#L17)).
- `jeffrey-keyser/github-actions` (composite actions repo) — provides `node-build` and `ecr-lambda-deploy` ([.github/workflows/ci-cd-pipeline.yml:20-22](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/.github/workflows/ci-cd-pipeline.yml#L20-L22)).

### Key third-party libraries
- `express@5`, `express-rate-limit`, `express-validator`, `serverless-http`, `pg`, `commander` (CLI), `swagger-jsdoc`/`swagger-ui-express` ([server/package.json:16-37](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/package.json#L16-L37), [cli/package.json:32-34](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/cli/package.json#L32-L34)).

## Consumed by

- **Any ecosystem service that ships with a `.env`** — services pull config at deploy or boot from `POST /v1/secrets/bulk` or `GET /v1/secrets/:project/:env/:key` ([README.md:80-89](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/README.md#L80-L89)).
- **Developers** — CLI `@jeffrey-keyser/solo-vault-cli`, installed globally or via npx, talks to the same API ([README.md:23-43](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/README.md#L23-L43)).
- **CI/CD jobs** — environment-scoped API keys inject secrets into deploy pipelines for other repos ([README.md:286-316](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/README.md#L286-L316)).
- **Cron / scheduler** — an external trigger calls `/v1/cron` to drive rotation scheduling and expiry checks ([server/app.ts:123](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/app.ts#L123), [server/routes/cron.ts](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/routes/cron.ts)).
- **Webhook subscribers** — outbound HTTPS POSTs from `webhook-delivery.ts` notify subscribers on rotation/expiry events ([server/services/webhook-delivery.ts](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/services/webhook-delivery.ts)).

## Inbound endpoints (public surface)

`GET/PUT/DELETE /v1/secrets/...`, `POST /v1/secrets/bulk`, `POST /v1/secrets/:project/:env/:key/rotate`, `/v1/api-keys`, `/v1/audit`, `/v1/webhooks`, `/v1/rotation-policies`, `/v1/cron`, `/health` ([README.md:75-89](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/README.md#L75-L89), [server/app.ts:118-127](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/app.ts#L118-L127)).
