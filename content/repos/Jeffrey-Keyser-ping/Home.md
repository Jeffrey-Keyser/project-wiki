---
title: Ping — Personal Life-Tracking Service
description: Self-hosted Express/React service that captures location, drives, health, mood, weight, workouts, and expenses, primarily via Apple Shortcuts.
---

# Ping

Ping personal location, health, life-tracking service. Captures where you go, how you feel, what you do, what it costs — then correlates for personal analytics ([README.md:1-3](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L1-L3)).

Primary user: Jeff (`JEFF_USER_ID = 7` hard-coded in event publisher) ([server/services/EventPublisher.ts:7](https://github.com/Jeffrey-Keyser/ping/blob/main/server/services/EventPublisher.ts#L7)). Data flows in through Apple Shortcuts automations triggered by passive signals (Bluetooth connect, geofence arrival, NFC tap) ([README.md:93-108](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L93-L108)).

## At a glance

- **Backend** — Express 5 / TypeScript, served by `@jeffrey-keyser/express-server-factory` ([server/app.ts:1-5](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L1-L5)).
- **Frontend** — React 19 / Redux Toolkit / Vite ([client/package.json:22-34](https://github.com/Jeffrey-Keyser/ping/blob/main/client/package.json#L22-L34)).
- **Database** — PostgreSQL via native `pg` driver, DAL pattern ([server/package.json:22-35](https://github.com/Jeffrey-Keyser/ping/blob/main/server/package.json#L22-L35)).
- **Events** — RabbitMQ via `amqplib` for Bluetooth → drive-start and similar async flows ([server/services/EventPublisher.ts:1-32](https://github.com/Jeffrey-Keyser/ping/blob/main/server/services/EventPublisher.ts#L1-L32)).
- **Hosting** — Self-hosted Beelink mini PC, exposed via Cloudflare Tunnel, auto-deploys on push to `main` ([README.md:34-63](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L34-L63)).
- **Auth** — `@jeffrey-keyser/pay-auth-integration` (JWT + session cookies) plus `X-Ping-Key` header for Shortcuts ([server/app.ts:70](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L70), [README.md:73](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L73)).
- **API** — All endpoints under `/api/v1/`, Swagger at `/api-docs` ([README.md:67-71](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L67-L71)).

## Work flow

1. iOS Shortcut fires on passive trigger, calls `/api/v1/*` with `X-Ping-Key` ([README.md:5-19](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L5-L19)).
2. Express route validates, hands to DAL or domain service ([server/routes](https://github.com/Jeffrey-Keyser/ping/blob/main/server/routes), [server/domain/services](https://github.com/Jeffrey-Keyser/ping/blob/main/server/domain/services)).
3. Row written to Postgres; selected events fan out via RabbitMQ for downstream consumers ([server/services/EventPublisher.ts:29-32](https://github.com/Jeffrey-Keyser/ping/blob/main/server/services/EventPublisher.ts#L29-L32)).
4. React dashboard reads same API for visualization (maps, charts, summaries) ([client/package.json:21-31](https://github.com/Jeffrey-Keyser/ping/blob/main/client/package.json#L21-L31)).

## Wiki pages

- [Architecture](./architecture/) — internal module/service layout, Mermaid.
- [Iteration Loop](./iteration-loop/) — how change moves through this repo.
- [Services and Dependencies](./services-and-dependencies/) — what Ping depends on, what depends on it.
- [Operations](./operations/) — deploy, runtime, logs, health probe.
- [Glossary](./glossary/) — repo-specific terms.
