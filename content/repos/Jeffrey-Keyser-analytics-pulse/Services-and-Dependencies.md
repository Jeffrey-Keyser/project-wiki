---
title: "Services and Dependencies"
description: "External services and packages Analytics-Pulse depends on, and the confirmed versus unknown or expected consumers of its API."
---

# Services and Dependencies

## Depends on

### Runtime services

- **Pay auth service** (`https://pay.jeffreykeyser.net` by default). The server configures Pay auth with that URL and public-route list ([server/app.ts:L84-L87](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/app.ts#L84-L87)). The config loader reads `PAY_SERVICE_URL` ([server/config/env.ts:L129-L130](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/config/env.ts#L129-L130)). User data is proxied, not stored locally ([CLAUDE.md:L246](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/CLAUDE.md#L246)).
- **PostgreSQL.** The config loader validates `DATABASE_*` settings and pool sizing ([server/config/env.ts:L32-L36](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/config/env.ts#L32-L36), [server/config/env.ts:L93-L104](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/config/env.ts#L93-L104)). The database health check uses the pool ([server/app.ts:L134](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/app.ts#L134)).
- **Redis (optional).** Config reads `REDIS_URL` or host settings ([server/config/env.ts:L50-L53](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/config/env.ts#L50-L53)), and `ioredis` is a dependency ([server/package.json:L40](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/package.json#L40)). Whether a Redis instance is deployed is unknown.
- **AWS SES.** `@aws-sdk/client-ses` is a server dependency ([server/package.json:L21](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/package.json#L21)). The dependency alone does not confirm that email is sent in any environment.
- **GitHub API.** `@octokit/rest` is a server dependency ([server/package.json:L41](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/package.json#L41)). The v1 router describes GitHub issue integration for error reporting ([server/routes/versions/v1/index.ts:L69-L70](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/routes/versions/v1/index.ts#L69-L70)). Live calls are not visible in these excerpts.

### Packages

- `@jeffrey-keyser/express-server-factory` assembles the Express app ([server/package.json:L24](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/package.json#L24), [server/app.ts:L1-L5](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/app.ts#L1-L5)).
- `@jeffrey-keyser/pay-auth-integration` provides server middleware and client helpers ([server/app.ts:L39](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/app.ts#L39), [client/package.json:L8](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/client/package.json#L8)).
- `@jeffrey-keyser/database-base-config` supplies database config and the DAL base ([server/package.json:L23](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/package.json#L23), [CLAUDE.md:L219](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/CLAUDE.md#L219)).
- `node-cron` schedules background jobs ([server/cron/dailyAggregation.ts:L1](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/cron/dailyAggregation.ts#L1)).
- The client uses `@jeffrey-keyser/redux-app-toolkit` and `@jeffrey-keyser/personal-ui-kit` ([client/package.json:L9-L10](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/client/package.json#L9-L10)).

### Infrastructure

- Terraform 1.13.5 or higher ([README.md:L305](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/README.md#L305)).
- AWS deployment assets are documented, including Lambda, ECR, S3, and CloudFront ([CLAUDE.md:L236-L237](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/CLAUDE.md#L236-L237)). Their live state is not verified here.

## Consumed by

### Confirmed

- **Tracking library callers.** The public track routes are mounted and documented as API-key authenticated ([server/routes/versions/v1/index.ts:L75-L77](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/routes/versions/v1/index.ts#L75-L77)). The published package exports a `Sender` ([tracking-library/src/index.ts:L9](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/tracking-library/src/index.ts#L9)). Its request code is not in these excerpts, so each live site is unknown.
- **Admin client.** RTK Query slices for diagnostics, projects, API keys, analytics, events, and campaigns exist in the client source ([client/src/reducers/index.ts:L1-L6](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/client/src/reducers/index.ts#L1-L6)). The configured base URL is not in these excerpts.

### Expected or unknown

- **Email recipients.** The email reporting job is registered at startup when enabled ([server/app.ts:L72-L76](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/app.ts#L72-L76)). Whether any recipients exist is unknown.
- **Error reporters.** Error ingestion is public with API-key auth ([server/routes/errors.ts:L143-L147](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/routes/errors.ts#L143-L147)). Which applications call it is unknown.
- **Programmatic API clients.** Swagger is served at `/api-docs` when enabled ([server/app.ts:L199-L200](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/app.ts#L199-L200)). External consumers are not known.

Related pages: [Architecture](../architecture/), [Operations](../operations/).
