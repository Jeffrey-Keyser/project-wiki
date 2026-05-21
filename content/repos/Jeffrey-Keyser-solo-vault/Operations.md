---
title: Operations
description: Deploy, runtime, observability, and on-call notes for Solo Vault.
---

# Operations

Solo Vault runs as a single AWS Lambda fronted by API Gateway, deployed by the GitHub Actions pipeline on every push to `main` ([.github/workflows/ci-cd-pipeline.yml:73-119](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/.github/workflows/ci-cd-pipeline.yml#L73-L119)). It is **not** a pure library — both the server image and the CLI npm package are deployable artifacts ([package.json:6-11](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/package.json#L6-L11)).

## Start commands

- **Local dev**: `npm run dev` (repo root → `cd server && npm run dev` → `ts-node ./bin/www.ts`) ([package.json:7](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/package.json#L7), [server/package.json:8](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/package.json#L8)).
- **Container/Lambda**: `node ./dist/bin/www.js` (per `server/package.json` `start` script) — Lambda actually invokes the exported `handler` from `server/app.ts` rather than `bin/www`, so the start script applies only when the image runs as a long-lived process ([server/package.json:7](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/package.json#L7), [server/app.ts:147-150](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/app.ts#L147-L150)).
- **CLI install**: `npm install -g @jeffrey-keyser/solo-vault-cli` (published to GitHub Packages on every merge to `main`) ([README.md:27-32](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/README.md#L27-L32), [.github/workflows/ci-cd-pipeline.yml:121-153](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/.github/workflows/ci-cd-pipeline.yml#L121-L153)).

## Ports and URLs

- **Local port**: `PORT` env, default `3001` ([CLAUDE.md:115-117](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/CLAUDE.md#L115-L117)).
- **Production base URL**: `https://vault.jeffreykeyser.net/api/v1` ([README.md:64-66](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/README.md#L64-L66)).
- **Swagger docs**: `/api-docs` (public, unauthenticated) ([server/middleware/api-key-auth.ts:36-41](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/middleware/api-key-auth.ts#L36-L41), [server/app.ts:92-116](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/app.ts#L92-L116)).

## Health & readiness

- **`GET /health`** is registered by `express-server-factory` with a Postgres ping via `createDatabaseHealthCheck(pool)` — returns service name and version from `package.json` ([server/app.ts:50-90](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/app.ts#L50-L90)).
- **Cold-start schema check**: `assertSchemaReady` runs once before serving traffic; on failure the process exits 1 so Lambda surfaces a hard error rather than serving with a broken DB ([server/app.ts:28-38](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/app.ts#L28-L38)).
- **Operational health dashboard**: `/v1/health` route (separate from `/health` probe) exposes per-domain metrics — see `server/routes/health-dashboard.ts` ([server/app.ts:122](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/app.ts#L122)).

## Logs

- Request logging via `morgan` (`dev` format) configured in the server factory ([server/app.ts:70-72](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/app.ts#L70-L72)). In Lambda these land in CloudWatch under the Lambda's log group.
- Error handler logs `error` with `req.method` and `req.path` for every thrown error ([server/app.ts:129-134](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/app.ts#L129-L134)).
- Cold-start banner prints service, version, `NODE_ENV`, `PORT`, `DATABASE_SCHEMA` ([server/app.ts:40-48](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/app.ts#L40-L48)).

## Rate limits

Two layers: per-IP `authRateLimiter` runs before auth (DDoS / brute-force shield), per-key `writeRateLimiter` runs after auth (per-tenant write cap). Limits are tunable via env vars added in commit `bd7ed5e` ([server/middleware/rate-limit.ts](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/middleware/rate-limit.ts), [server/app.ts:140-143](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/app.ts#L140-L143)).

## Deploys

- **Backend**: `deploy-backend` job (push to `main`) → build `Dockerfile_Server` → push to ECR → update Lambda function name from `vars.AWS_LAMBDA_FUNCTION_NAME` ([.github/workflows/ci-cd-pipeline.yml:73-119](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/.github/workflows/ci-cd-pipeline.yml#L73-L119)).
- **CLI**: `publish-cli` job runs `npm publish` against `https://npm.pkg.github.com` scope `@jeffrey-keyser` ([.github/workflows/ci-cd-pipeline.yml:121-153](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/.github/workflows/ci-cd-pipeline.yml#L121-L153)).
- **Infra**: `terraform_bootstrap.yml` and `terraform_deploy.yml` workflows manage AWS resources ([.github/workflows](https://github.com/Jeffrey-Keyser/solo-vault/tree/main/.github/workflows)).

## On-call notes

- **Rollback**: redeploy the previous Lambda image from ECR (no blue/green, no staging slot).
- **Schema mismatch on cold start**: check CloudWatch for `FATAL:` line; re-run `server/db/deploy.sh` against the right database, then redeploy ([server/app.ts:35-38](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/app.ts#L35-L38)).
- **Bootstrap admin key**: set `BOOTSTRAP_ADMIN_KEY` to mint the first real admin key, then remove it from the Lambda env ([CLAUDE.md:71-74](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/CLAUDE.md#L71-L74)).
- **Encryption key rotation** is non-trivial — secrets are derived from `VAULT_ENCRYPTION_KEY` via scrypt; rotation requires the `migrate-salts` CLI/server tooling (`cli/src/commands/migrate-salts.ts`).
