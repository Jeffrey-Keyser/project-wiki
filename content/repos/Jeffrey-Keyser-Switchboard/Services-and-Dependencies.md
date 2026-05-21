---
title: Services & Dependencies
description: Inbound and outbound integrations for Switchboard — libraries, AWS services, and known consumers.
---

# Services & Dependencies

## Depends on

### External services
- **Pay Auth (`pay.jeffreykeyser.net`)** — JWT/session validation for admin endpoints, configured via `PAY_SERVICE_URL` ([server/app.ts:48-88](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/app.ts#L48-L88)).
- **AWS Lambda** — serverless compute runtime; handler in `server/lambda.ts` ([server/lambda.ts:1](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/lambda.ts#L1), [README.md:182-188](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L182-L188)).
- **AWS API Gateway** — HTTP front for Lambda; rate limiting handled here and in `middleware/rateLimit.ts` ([README.md:166-180](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L166-L180), [server/middleware/rateLimit.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/middleware/rateLimit.ts)).
- **AWS RDS (PostgreSQL)** — primary data store, connected via `server/db/connection.ts` ([server/db/connection.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/db/connection.ts), [README.md:182-188](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L182-L188)).
- **AWS S3 + CloudFront** — hosts and serves the React admin bundle ([README.md:182-188](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L182-L188)).
- **AWS ECR** — container registry for the server Docker image; `Dockerfile_Server` is the build target ([Dockerfile_Server](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/Dockerfile_Server), [README.md:540-552](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L540-L552)).
- **AWS CloudWatch** — logs + metrics; SDK imported via `@aws-sdk/client-cloudwatch` ([server/package.json:25](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/package.json#L25)).
- **Upstash Redis** — L2 distributed cache + Pub/Sub for `EventBus`, REST API client ([server/package.json:30](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/package.json#L30), [CLAUDE.md:343-372](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L343-L372)).

### npm packages (server, runtime)
- `@jeffrey-keyser/express-server-factory` — builds the configured Express+Lambda app ([server/app.ts:1-7](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/app.ts#L1-L7)).
- `@jeffrey-keyser/pay-auth-integration` v6.9.1 — JWT/session middleware + admin auth flows ([server/package.json:29](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/package.json#L29)).
- `@jeffrey-keyser/database-base-config` — DB pool + session store wiring ([server/package.json:26](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/package.json#L26), [CLAUDE.md:391-396](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L391-L396)).
- `@jeffrey-keyser/pay-api-types` — shared TS types with Pay service ([server/package.json:28](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/package.json#L28)).
- `express` 5, `serverless-http` 4, `pg` 8, `lru-cache` 11, `@upstash/redis`, `bcrypt`, `zod`, `winston`, `swagger-jsdoc`, `swagger-ui-express` ([server/package.json:24-52](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/package.json#L24-L52)).

### npm packages (client + SDK)
- Client app uses React + Redux Toolkit + RTK Query + Vite + Vitest; styling via CSS Modules and `@jkeyser/ui-kit` ([CLAUDE.md:434-456](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L434-L456)).
- SDK ships ESM + CJS via Rollup, only hard dep is `lru-cache`; React is an optional peer ([client-sdk/package.json:38-48](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/client-sdk/package.json#L38-L48)).

### Tooling
- Terraform 1.13.5+ for infra ([CLAUDE.md:115-125](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L115-L125)).
- Artillery for load tests; scenarios in `load-tests/scenarios/` ([server/package.json:15-22](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/package.json#L15-L22)).
- Private GitHub Actions library `jeffrey-keyser/github-actions` pulled in CI via `PRIVATE_ACTIONS_TOKEN` ([.github/workflows/ci-cd-pipeline.yml:19-24](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/.github/workflows/ci-cd-pipeline.yml#L19-L24)).

## Consumed by

- **`@switchboard/client` SDK consumers** — any app that imports `@switchboard/client` for `isFeatureEnabled`, `getConfig`, `batchCheckFeatures`, or the React hooks ([README.md:36-152](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L36-L152), [client-sdk/package.json:2-7](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/client-sdk/package.json#L2-L7)).
- **Backend services** — direct REST calls to `/api/v1/features/check`, `/api/v1/features/batch-check`, `/api/v1/configs/value`, `/api/v1/configs/batch` ([README.md:273-302](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L273-L302)).
- **Switchboard admin UI** (`client/`) — CRUD + audit-log viewing on the same v1 API ([server/routes/versions/v1/index.ts:46-76](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/routes/versions/v1/index.ts#L46-L76)).
- **SSE subscribers** — any client opening `GET /api/v1/realtime/events` to stream `feature.*` / `config.*` / `application.*` events ([CLAUDE.md:269-303](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L269-L303)).
