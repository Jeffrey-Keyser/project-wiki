---
title: "Ping Architecture"
description: "Components, request path, and external contracts of the Ping server, web client, data layer, and event publisher."
---

# Architecture

Ping has two runtime parts: an Express API in `server/` and a Vite-built React single-page app in `client/` ([README.md:L34-L35](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L34-L35)). The diagram shows components that the excerpts confirm. Production wiring beyond these excerpts is not shown.

```mermaid
flowchart LR
  ios["Apple Shortcuts"]
  spa["React SPA"]
  api["Express app in server app.ts"]
  mw["Middleware pipeline"]
  v1["Routers under api v1"]
  dom["Domain services and ports"]
  dal["DAL classes"]
  pg["PostgreSQL"]
  pub["EventPublisher"]
  mq["RabbitMQ exchange"]
  ws["DriveWebSocketService at ws drives"]
  pay["Pay auth service"]
  ios -->|"X-Ping-Key"| api
  spa -->|"JWT or session"| api
  api --> mw
  mw --> v1
  v1 --> dom
  v1 --> dal
  dom --> dal
  dal --> pg
  v1 --> pub
  pub --> mq
  api --> ws
  ws -->|"live drive updates"| spa
  mw -.->|"auth proxy"| pay
```

## Components

- **Entry points.** `server/app.ts` builds a `ServerConfig` and calls `createServerlessAppSync` ([server/app.ts:L1-L5](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L1-L5), [server/app.ts:L319](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L319)). `server/bin/www.ts` listens on `config.PORT` and attaches the drive WebSocket and cron subscriber ([server/bin/www.ts:L23](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/bin/www.ts#L23), [server/bin/www.ts:L27-L34](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/bin/www.ts#L27-L34)).
- **Routers.** The root router serves `/` and `/ping` ([server/routes/index.ts:L6-L16](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/routes/index.ts#L6-L16)). The v1 router mounts feature routers, including location pings, drives, and Bluetooth events ([server/routes/versions/v1/index.ts:L108](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/routes/versions/v1/index.ts#L108), [server/routes/versions/v1/index.ts:L207](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/routes/versions/v1/index.ts#L207), [server/routes/versions/v1/index.ts:L220](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/routes/versions/v1/index.ts#L220)).
- **Auth.** `setupPayAuth` supplies auth middleware and `/auth` routes ([server/app.ts:L70](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L70), [server/app.ts:L252](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L252)). Shortcut-facing routes such as location pings and health sync are public to Pay auth but check `X-Ping-Key` ([server/app.ts:L100-L104](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L100-L104)).
- **User resolution guard.** `resolveUserData` in `server/middleware/auth.ts` wraps the library's user-resolution middleware. A Pay principal whose id is not a UUID, such as the system admin token with id `admin-system`, cannot map to a Ping user. Per the merged PR description, passing that id to `ping.get_or_create_user($1::uuid)` failed with Postgres 22P02 and returned 500. The guard returns 401 with `success: false` on user-scoped `/api` routes. On public routes and `/auth/*` it skips resolution and calls `next()` ([server/middleware/auth.ts:L61-L88](https://github.com/Jeffrey-Keyser/ping/blob/4251764f43dc5cf7c361dc50848d3035afaab269/server/middleware/auth.ts#L61-L88); test coverage in [server/tests/__tests__/unit/middleware/resolveUserData.test.ts](https://github.com/Jeffrey-Keyser/ping/blob/4251764f43dc5cf7c361dc50848d3035afaab269/server/tests/__tests__/unit/middleware/resolveUserData.test.ts)).
- **Sessions.** `express-session` uses a database store in the `ping` schema with a 24-hour TTL ([server/app.ts:L178-L188](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L178-L188)).
- **Domain.** Ports declare repository and publisher contracts such as `PingRepository` and `DriveEventPublisher` ([server/domain/ports/index.ts:L17](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/domain/ports/index.ts#L17), [server/domain/ports/index.ts:L95-L97](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/domain/ports/index.ts#L95-L97)). `ZoneResolutionService` matches coordinates to zones by haversine distance ([server/domain/services/ZoneResolutionService.ts:L9](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/domain/services/ZoneResolutionService.ts#L9)).
- **Data access.** DAL classes are static, require `userId` on each call, and use raw SQL ([server/dal/DriveDal.ts:L37-L40](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/dal/DriveDal.ts#L37-L40)). `VisitDal.create` depends on a partial unique index and returns `null` when another arrival wins ([server/dal/VisitDal.ts:L49-L58](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/dal/VisitDal.ts#L49-L58)).
- **Events.** `EventPublisher` connects to `RABBITMQ_URL` and publishes to the `PingExchange` ([server/services/EventPublisher.ts:L64](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/services/EventPublisher.ts#L64), [server/services/EventPublisher.ts:L118-L121](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/services/EventPublisher.ts#L118-L121)). Publish failures are logged, not rethrown ([server/services/EventPublisher.ts:L130-L131](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/services/EventPublisher.ts#L130-L131)).
- **Live drives.** `DriveWebSocketService` handles upgrades on `/ws/drives` and checks the API key before upgrading ([server/services/DriveWebSocketService.ts:L119](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/services/DriveWebSocketService.ts#L119), [server/services/DriveWebSocketService.ts:L131-L136](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/services/DriveWebSocketService.ts#L131-L136)).
- **Telemetry.** `sendTelemetryEvent` posts fire-and-forget events to `ANALYTICS_PULSE_URL` ([server/services/telemetry.ts:L11-L22](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/services/telemetry.ts#L11-L22)).
- **Operational scripts.** `scripts/seed-grocery-zones.ts` loads `server/.env`, opens its own pool, and delegates to `server/scripts/groceryZoneProvisioning.ts` ([scripts/seed-grocery-zones.ts:L36](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/scripts/seed-grocery-zones.ts#L36), [scripts/seed-grocery-zones.ts:L49](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/scripts/seed-grocery-zones.ts#L49)).
- **Client.** Containers are exported from `client/src/containers/index.ts` ([client/src/containers/index.ts:L1-L15](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/src/containers/index.ts#L1-L15)).
- **Lambda fallback.** `server/lambda.ts` re-exports the handler ([server/lambda.ts:L1](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/lambda.ts#L1)). The README describes the Terraform stack as unused and kept for fallback ([README.md:L139](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L139)).

## Contracts

- Mobile clients receive a `success` plus `data` envelope, and errors use `success: false` ([docs/MOBILE_INTEGRATION.md:L21-L37](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/docs/MOBILE_INTEGRATION.md#L21-L37)).
- Location submissions accept an optional `X-Idempotency-Key` for safe retransmission ([docs/MOBILE_INTEGRATION.md:L78](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/docs/MOBILE_INTEGRATION.md#L78)).
- Event shapes and routing keys come from `@jeffrey-keyser/message-contracts` ([server/services/EventPublisher.ts:L2](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/services/EventPublisher.ts#L2)).
- A Pay principal with a non-UUID id receives `401` with `error: "Unauthorized"` and the message `Token is not associated with a Ping user` on user-scoped `/api` routes ([server/middleware/auth.ts:L61-L88](https://github.com/Jeffrey-Keyser/ping/blob/4251764f43dc5cf7c361dc50848d3035afaab269/server/middleware/auth.ts#L61-L88)).
