---
title: Services and Dependencies
description: External services, libraries, and consumers wired to Analytics-Pulse.
---

# Services and Dependencies

## Depends on

### Runtime services
- **Pay service** (`https://pay.jeffreykeyser.net`) — external user / session authority; the server validates JWTs and resolves user profiles against it via `@jeffrey-keyser/pay-auth-integration/server` ([server/app.ts:32-93](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L32-L93), [README.md:574-580](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L574-L580)).
- **PostgreSQL (RDS)** — primary datastore; events table is monthly-partitioned for performance and the `analytics_daily` rollups are pre-computed by the daily cron ([README.md:67-71](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L67-L71)).
- **Redis** — distributed cache via `ioredis`, with an in-memory fallback when Redis is unreachable ([server/package.json:36](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/package.json#L36), [README.md:69](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L69)).
- **AWS SES** — outbound email transport for scheduled analytics reports ([server/package.json:17](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/package.json#L17)).
- **GitHub API** — used by `services/githubIssue.ts` and `@octokit/rest` to file runtime errors as repository issues ([server/package.json:37](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/package.json#L37)).

### Jeffrey-Keyser internal packages
- `@jeffrey-keyser/express-server-factory` — assembles the Express + Lambda app ([server/app.ts:1-5](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L1-L5)).
- `@jeffrey-keyser/pay-auth-integration` — server middleware + React provider for Pay auth ([server/app.ts:32](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L32), [client/package.json:8](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/client/package.json#L8)).
- `@jeffrey-keyser/database-base-config` — connection pooling, DAL base classes, session table ([README.md:953-955](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L953-L955)).
- `@jeffrey-keyser/api-errors` — uniform error envelope for handlers ([server/package.json:18](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/package.json#L18)).
- `@jeffrey-keyser/pay-api-types` — shared Pay type definitions ([server/package.json:21](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/package.json#L21)).
- `@jeffrey-keyser/personal-ui-kit` — React component library used by the dashboard ([client/package.json:9](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/client/package.json#L9)).
- `@jeffrey-keyser/redux-app-toolkit` — store / slice scaffolding ([client/package.json:10](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/client/package.json#L10)).

### Notable third-party libraries
- `express@5`, `body-parser`, `cors`, `express-session`, `express-rate-limit`, `express-validator`, `morgan`, `cookie-parser` ([server/package.json:25-34](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/package.json#L25-L34)).
- `bcrypt`, `jsonwebtoken` for API-key hashing and JWT verification ([server/package.json:23,38](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/package.json#L23)).
- `node-cron` for scheduled jobs ([server/package.json:40](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/package.json#L40)).
- `geoip-lite`, `ua-parser-js` for visitor enrichment ([server/package.json:34,43](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/package.json#L34)).
- `swagger-jsdoc`, `swagger-ui-express` for `/api-docs` ([server/package.json:41-42](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/package.json#L41-L42)).
- `react@19`, `react-router-dom@7`, `@reduxjs/toolkit@2`, `recharts`, `styled-components`, `i18next` on the client ([client/package.json:18-27](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/client/package.json#L18-L27)).

### Infrastructure dependencies
- **AWS:** Lambda, ECR, API Gateway, S3, CloudFront, Route 53, ACM, CloudWatch, IAM, VPC, RDS ([README.md:1028-1043](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L1028-L1043)).
- **GitHub Actions OIDC** as the trust anchor for AWS deploys ([README.md:353-380](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L353-L380)).
- **Terraform ≥ 1.13.5** with shared state in `tf-state-jeffrey-keyser-prod` ([README.md:307-317](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L307-L317), [README.md:341-346](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L341-L346)).

## Consumed by

- **Sites running the tracking snippet** — anything embedding `@analytics-pulse/tracking-library` posts to `/api/v1/track/event` and `/api/v1/track/batch` with an `ap_*` API key ([README.md:104-135](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L104-L135), [README.md:477-500](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L477-L500)).
- **The Analytics-Pulse dashboard** (this repo's `client/`) — uses bearer-token APIs at `/api/v1/projects/*` for management and analytics queries ([README.md:411-475](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L411-L475)).
- **Email recipients** — opted-in users receive daily / weekly / monthly digests scheduled by `server/cron/emailReporting.ts` ([README.md:45-50](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L45-L50), [server/app.ts:36](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/app.ts#L36)).
- **External error sinks** — runtime errors flow into GitHub Issues for the repo via `services/githubIssue.ts` ([server/package.json:37](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/server/package.json#L37)).
- **Programmatic API clients** — any consumer of the REST API documented at `/api-docs` ([README.md:401-407](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/main/README.md#L401-L407)).
