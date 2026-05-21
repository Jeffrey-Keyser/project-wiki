---
title: Ping Glossary
description: Repo-specific terms used in the Ping codebase.
---

# Glossary

**Ping** — Both the product name and a discrete location record (GPS sample) ingested via `/api/v1/location-pings` or `/api/v1/pings`. Stored by `PingDal` ([README.md:1-3](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L1-L3), [server/dal/PingDal.ts](https://github.com/Jeffrey-Keyser/ping/blob/main/server/dal/PingDal.ts)).

**Zone** — Named geographic region (e.g. "Home", "Gym"). Pings are resolved into zone membership by `ZoneResolutionService`, producing **Visits** ([server/domain/services/ZoneResolutionService.ts](https://github.com/Jeffrey-Keyser/ping/blob/main/server/domain/services/ZoneResolutionService.ts), [README.md:22-24](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L22-L24)).

**Visit** — Time-bounded stay inside a zone, with arrival/departure timestamps. Backed by `VisitDal` ([server/dal/VisitDal.ts](https://github.com/Jeffrey-Keyser/ping/blob/main/server/dal/VisitDal.ts), [README.md:24](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L24)).

**Drive** — A car trip composed of a `Drive` record plus a sequence of `DriveWaypoint`s. Started automatically by Bluetooth-connect event, tracked live over WebSocket ([server/dal/DriveDal.ts](https://github.com/Jeffrey-Keyser/ping/blob/main/server/dal/DriveDal.ts), [server/services/DriveWebSocketService.ts](https://github.com/Jeffrey-Keyser/ping/blob/main/server/services/DriveWebSocketService.ts), [README.md:9-10](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L9-L10)).

**Bluetooth event** — Inbound signal that a known Bluetooth peer connected/disconnected; used to infer drive start/end. Route at `/api/v1/bluetooth`, contract from `@jeffrey-keyser/message-contracts` ([server/routes/bluetooth.ts](https://github.com/Jeffrey-Keyser/ping/blob/main/server/routes/bluetooth.ts), [server/services/EventPublisher.ts:2](https://github.com/Jeffrey-Keyser/ping/blob/main/server/services/EventPublisher.ts#L2)).

**Compound signal context** — Composition of multiple ambient signals (WiFi + Bluetooth + time + location) to infer specific context with high confidence ([README.md:11-16](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L11-L16)).

**X-Ping-Key** — HTTP header carrying the API key for Apple Shortcuts authentication; alternative to JWT for the same endpoints ([server/app.ts:165](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L165), [README.md:73](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L73)).

**Pay service / PayAuth** — External auth service at `https://pay.jeffreykeyser.net`. Issues JWT + session cookie. Ping uses one `PayAuth` instance per app via `@jeffrey-keyser/pay-auth-integration` ([server/app.ts:70](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L70), [AGENTS.md:17-18](https://github.com/Jeffrey-Keyser/ping/blob/main/AGENTS.md#L17-L18)).

**PayUser** — User type from `pay-api-types`; Ping resolves it to a local user via `resolveUserData` middleware ([server/middleware/auth.ts](https://github.com/Jeffrey-Keyser/ping/blob/main/server/middleware/auth.ts), [server/app.ts:42](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L42)).

**JEFF_USER_ID** — Hard-coded user ID `7`; `EventPublisher` only publishes RabbitMQ events for this account ([server/services/EventPublisher.ts:7](https://github.com/Jeffrey-Keyser/ping/blob/main/server/services/EventPublisher.ts#L7)).

**PingExchange** — RabbitMQ exchange + routing-key registry defined in `@jeffrey-keyser/message-contracts`; covers `BluetoothEvent`, `DriveEvent`, etc. ([server/services/EventPublisher.ts:2](https://github.com/Jeffrey-Keyser/ping/blob/main/server/services/EventPublisher.ts#L2)).

**DAL (Data Access Layer)** — Per-table class extending a shared base, exposing typed methods over raw parameterized SQL plus transaction support ([server/dal](https://github.com/Jeffrey-Keyser/ping/blob/main/server/dal), [CLAUDE.md:341-345](https://github.com/Jeffrey-Keyser/ping/blob/main/CLAUDE.md#L341-L345)).

**Shortcut link** — iCloud sharing URL for a pre-built Apple Shortcut. Served unauthenticated at `/api/v1/shortcuts/links` ([README.md:99-108](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L99-L108), [server/routes/shortcuts.ts](https://github.com/Jeffrey-Keyser/ping/blob/main/server/routes/shortcuts.ts)).

**Analytics Pulse** — External telemetry sink; `telemetryMiddleware` posts endpoint hit counts fire-and-forget ([server/app.ts:283](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L283), [server/services/telemetry.ts](https://github.com/Jeffrey-Keyser/ping/blob/main/server/services/telemetry.ts)).

**beelink-deploy** — Webhook service on the Beelink that pulls `main` and runs `deploy.sh` after each push ([README.md:37](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L37), [deploy.sh:1-29](https://github.com/Jeffrey-Keyser/ping/blob/main/deploy.sh#L1-L29)).

**agents:verify block** — Machine-extracted bash block in `AGENTS.md` between `<!-- agents:verify -->` markers; executed by `postflight-verify.sh` before a coding-agent task is marked done ([AGENTS.md:33-53](https://github.com/Jeffrey-Keyser/ping/blob/main/AGENTS.md#L33-L53)).
