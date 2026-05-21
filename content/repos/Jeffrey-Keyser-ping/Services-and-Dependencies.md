---
title: Ping Services and Dependencies
description: Inbound and outbound integrations — packages, services, and external consumers.
---

# Services and Dependencies

## Depends on

### Internal `@jeffrey-keyser/*` packages (GitHub Packages registry)

- **`@jeffrey-keyser/pay-auth-integration`** — auth client + server middleware; pinned `^6.10.1`, only public subpaths allowed ([AGENTS.md:6-18](https://github.com/Jeffrey-Keyser/ping/blob/main/AGENTS.md#L6-L18), [server/package.json:30](https://github.com/Jeffrey-Keyser/ping/blob/main/server/package.json#L30), [client/package.json:10](https://github.com/Jeffrey-Keyser/ping/blob/main/client/package.json#L10)).
- **`@jeffrey-keyser/express-server-factory`** — `createServerlessAppSync`, `createDatabaseHealthCheck`, `ServerConfig` ([server/app.ts:1-5](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L1-L5), [server/package.json:26](https://github.com/Jeffrey-Keyser/ping/blob/main/server/package.json#L26)).
- **`@jeffrey-keyser/api-errors`** — `correlationIdMiddleware`, typed error responses ([server/app.ts:7](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L7), [server/package.json:23](https://github.com/Jeffrey-Keyser/ping/blob/main/server/package.json#L23)).
- **`@jeffrey-keyser/database-base-config`** — PG pool / session-store config ([server/package.json:24](https://github.com/Jeffrey-Keyser/ping/blob/main/server/package.json#L24), [CLAUDE.md:341-347](https://github.com/Jeffrey-Keyser/ping/blob/main/CLAUDE.md#L341-L347)).
- **`@jeffrey-keyser/express-middleware-suite`** — shared middleware ([server/package.json:25](https://github.com/Jeffrey-Keyser/ping/blob/main/server/package.json#L25)).
- **`@jeffrey-keyser/github-error-issues`** — opens GitHub issues from caught errors ([server/app.ts:8](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L8), [server/package.json:27](https://github.com/Jeffrey-Keyser/ping/blob/main/server/package.json#L27)).
- **`@jeffrey-keyser/message-contracts`** — shared `PingEvent`, `BluetoothEvent`, `DriveEvent` types and routing keys ([server/services/EventPublisher.ts:2](https://github.com/Jeffrey-Keyser/ping/blob/main/server/services/EventPublisher.ts#L2), [server/package.json:28](https://github.com/Jeffrey-Keyser/ping/blob/main/server/package.json#L28)).
- **`@jeffrey-keyser/pay-api-types`** — Pay API DTO types ([server/package.json:29](https://github.com/Jeffrey-Keyser/ping/blob/main/server/package.json#L29), [client/package.json:9](https://github.com/Jeffrey-Keyser/ping/blob/main/client/package.json#L9)).
- **`@jeffrey-keyser/personal-ui-kit`**, **`redux-app-toolkit`**, **`feedback-widget`** — client-side UI / state ([client/package.json:8-12](https://github.com/Jeffrey-Keyser/ping/blob/main/client/package.json#L8-L12)).
- **`@jeffrey-keyser/github-actions`** — shared workflow actions (root dep) ([package.json:3](https://github.com/Jeffrey-Keyser/ping/blob/main/package.json#L3)).

### Third-party runtime

- **PostgreSQL** via `pg` (no Sequelize at runtime despite README mention; DAL uses raw SQL) ([server/package.json:22-35](https://github.com/Jeffrey-Keyser/ping/blob/main/server/package.json#L22-L35)).
- **RabbitMQ** via `amqplib` ([server/package.json:31](https://github.com/Jeffrey-Keyser/ping/blob/main/server/package.json#L31), [server/services/EventPublisher.ts:1](https://github.com/Jeffrey-Keyser/ping/blob/main/server/services/EventPublisher.ts#L1)).
- **Express 5**, **express-session**, **ws** for WebSocket drive tracking ([server/package.json:40-54](https://github.com/Jeffrey-Keyser/ping/blob/main/server/package.json#L40-L54)).
- **Pino** structured logger, **Morgan** access logs ([server/package.json:46-47](https://github.com/Jeffrey-Keyser/ping/blob/main/server/package.json#L46-L47)).
- **Leaflet / react-leaflet / Recharts** for maps and charts on the client ([client/package.json:21-30](https://github.com/Jeffrey-Keyser/ping/blob/main/client/package.json#L21-L30)).

### External services

- **Pay service** (`https://pay.jeffreykeyser.net`) — JWT/session issuer; auth flows proxied through `payAuthSetup` ([server/app.ts:81](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L81), [README.md:40](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L40)).
- **Apple Shortcuts** — primary inbound client; uses `X-Ping-Key` header ([README.md:93-108](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L93-L108)).
- **Cloudflare Tunnel** — public ingress to Beelink ([README.md:37](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L37)).
- **`beelink-deploy` webhook** — receives push events and runs `deploy.sh` ([README.md:61-63](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L61-L63)).
- **GitHub Packages** — npm registry for `@jeffrey-keyser/*`; `GITHUB_TOKEN` required ([AGENTS.md:20-28](https://github.com/Jeffrey-Keyser/ping/blob/main/AGENTS.md#L20-L28)).

## Consumed by

- **Apple Shortcuts** on Jeff's iPhone — call versioned API for pings, drives, mood, weight, expenses, workouts ([README.md:67-73](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L67-L73)).
- **Ping React SPA** — the web dashboard; same `/api/v1/*` ([client/src](https://github.com/Jeffrey-Keyser/ping/blob/main/client/src), [README.md:34-35](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L34-L35)).
- **Downstream RabbitMQ consumers** — anything subscribing to `PingExchange` routing keys (e.g. `ping.workout.session.completed`); intended consumer noted as `openclaw-bridge` ([server/services/EventPublisher.ts:11-24](https://github.com/Jeffrey-Keyser/ping/blob/main/server/services/EventPublisher.ts#L11-L24)).
- **Analytics Pulse** — receives fire-and-forget endpoint-hit telemetry from `telemetryMiddleware` ([server/app.ts:283](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L283)).
- **Future native iOS app** — planned consumer of the same `X-Ping-Key` + JSON protocol ([README.md:75-91](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L75-L91)).
