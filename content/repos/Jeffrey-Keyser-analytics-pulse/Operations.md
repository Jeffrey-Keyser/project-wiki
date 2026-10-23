---
title: "Operations"
description: "Start, deploy, test, and health commands for Analytics-Pulse, plus observability, what is verified from source, and what is documented only."
---

# Operations

Analytics-Pulse is a deployed service, not a pure library. The API and admin client run as services, and the tracking package is a library consumed through npm. Environment-specific deployment shape is unknown from these excerpts ([docs/ARCHITECTURE.md:L90](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/ARCHITECTURE.md#L90)).

## Start

- **API, development:** `cd server && npm run dev` runs `ts-node ./bin/www.ts` ([server/package.json:L7](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/package.json#L7)). The port is `PORT`, defaulting to 3001 ([server/config/env.ts:L73](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/config/env.ts#L73)).
- **API, production script:** `node ./dist/bin/www.js` after `tsc` build ([server/package.json:L6, L8](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/package.json#L6-L8)).
- **Client, development:** `cd client && npm run dev` runs Vite on port 3002 ([client/package.json:L33](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/client/package.json#L33), [client/vite.config.js:L7](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/client/vite.config.js#L7)).

Local bring-up order is database bootstrap, then server, then client ([docs/OPERATIONS.md:L9-L28](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/OPERATIONS.md#L9-L28)).

## Database lifecycle

Run from `server`: `npm run db:status`, `npm run db:migrate`, and `npm run db:rollback -- 1` ([docs/OPERATIONS.md:L34-L39](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/OPERATIONS.md#L34-L39)). The destructive reset is `db/teardown.sh` ([docs/OPERATIONS.md:L44](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/OPERATIONS.md#L44)).

## Deploy

- The documented path is `./scripts/new-service-auto.sh <service-name> <domain>` with `GITHUB_TOKEN` set ([CLAUDE.md:L9-L11](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/CLAUDE.md#L9-L11)).
- Pushes are documented to trigger image build, Lambda update, client sync, and CloudFront invalidation ([CLAUDE.md:L354-L359](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/CLAUDE.md#L354-L359)).
- Terraform runs manually ([CLAUDE.md:L240](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/CLAUDE.md#L240)).

The CI workflow files are not in the excerpts. Their contents are unverified.

## Tests and checks

- Server: `npm test`, `npm run lint` ([server/package.json:L10-L11](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/package.json#L10-L11)).
- Client: `npm run test`, `npm run typecheck`, `npm run build` ([client/package.json:L35-L38](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/client/package.json#L35-L38)).
- Tracking library: `npm test`, `npm run build` ([tracking-library/package.json:L13-L20](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/tracking-library/package.json#L13-L20)).

## Health and diagnostics

- **`GET /health`** is the infrastructure probe, with a database check ([server/app.ts:L189-L197](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/app.ts#L189-L197)). It is public ([server/app.ts:L91](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/app.ts#L91)).
- **`GET /api/v1/diagnostics/runtime`** reports background job state ([server/routes/diagnostics.ts:L120-L122](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/routes/diagnostics.ts#L120-L122)). Operators see last start, success, failure, and failure counts there ([docs/OPERATIONS.md:L70-L73](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/OPERATIONS.md#L70-L73)).
- **`GET /api/v1/diagnostics/detailed`** returns deeper diagnostics ([server/routes/diagnostics.ts:L93](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/routes/diagnostics.ts#L93)).

## Scheduled jobs

Documented schedules are daily aggregation at `0 1 * * *`, partition maintenance at `0 2 * * *`, and email reports at 09:00 daily, weekly on Monday, and monthly on the 1st ([docs/OPERATIONS.md:L79-L83](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/OPERATIONS.md#L79-L83)). Each has an enable flag ([server/config/env.ts:L142-L152](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/server/config/env.ts#L142-L152)). The partition job runs daily at 02:00 UTC according to the partition strategy ([docs/PARTITION_STRATEGY.md:L68-L75](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/PARTITION_STRATEGY.md#L68-L75)).

## Verified versus documented

- **Verified from source:** route mounts, health check, runtime route, job schedules, and env defaults.
- **Documented only:** CloudWatch log shipping, Lambda cold-start behavior, backups, and the Redis and SES deployments. The excerpts do not confirm these ([docs/OPERATIONS.md:L103-L105](https://github.com/Jeffrey-Keyser/analytics-pulse/blob/32744d978fd9eb0cd42b8198bd04d3ef4c0f3cea/docs/OPERATIONS.md#L103-L105)).
- **Unknown:** production port and domain, and which runtime hosts the server.

Related pages: [Architecture](../architecture/), [Services and Dependencies](../services-and-dependencies/).
