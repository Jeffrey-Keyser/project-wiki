---
title: "Ping Overview"
description: "What Ping is, who uses it, and how a captured signal moves through the self-hosted service."
---

# Ping

Ping is a personal location, health, and life-tracking service. It captures where you go, how you feel, what you do, and what things cost, then correlates that data for personal analytics ([README.md:L3](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L3)). Its design principle is ambient signal, then context inference, then automated action. A passive event such as a car Bluetooth connect can start a drive without manual input ([README.md:L7-L9](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L7-L9)).

## At a glance

- **Backend:** Express 5 with TypeScript, with the app assembled by `express-server-factory` ([server/app.ts:L1-L5](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L1-L5), [server/package.json:L40](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L40)).
- **Frontend:** React 19 single-page app using Redux Toolkit and Vite ([client/package.json:L14](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/package.json#L14), [client/package.json:L23](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/package.json#L23)).
- **Database:** PostgreSQL. The README mentions Sequelize ([README.md:L36](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L36)), but the drive DAL runs parameterized SQL through `pool.query` ([server/dal/DriveDal.ts:L51-L57](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/dal/DriveDal.ts#L51-L57)).
- **Events:** RabbitMQ through `amqplib`, published only for one hard-coded account ([server/services/EventPublisher.ts:L6-L7](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/services/EventPublisher.ts#L6-L7), [server/services/EventPublisher.ts:L105-L107](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/services/EventPublisher.ts#L105-L107)).
- **Auth:** Pay service integration for JWT and session cookies, plus the `X-Ping-Key` header for Shortcuts ([server/app.ts:L70](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L70), [README.md:L73](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L73)).
- **Hosting:** Self-hosted on a Beelink mini PC behind a Cloudflare Tunnel. A push to `main` runs the deploy script through a webhook ([README.md:L35-L37](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L35-L37), [README.md:L63](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L63)).
- **API:** Versioned under `/api/v1/`, with API docs at `/api-docs` ([README.md:L69](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L69), [server/routes/index.ts:L10](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/routes/index.ts#L10)).

## Who uses it

- **Owner account.** Event publishing is limited to a hard-coded account identified in source as Jeff's user ID ([server/services/EventPublisher.ts:L6-L7](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/services/EventPublisher.ts#L6-L7)).
- **Apple Shortcuts.** Pre-built shortcuts post location, mood, health, weight, expense, drive, and session data ([README.md:L119](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L119)). The repo does not verify which shortcuts are installed on any device ([docs/MOBILE_INTEGRATION.md:L353](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/docs/MOBILE_INTEGRATION.md#L353)).
- **Web dashboard.** The React app reads the same API through RTK Query slices ([client/src/reducers/index.ts:L6-L14](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/src/reducers/index.ts#L6-L14)).
- **Planned:** A native iOS app that would replace Shortcuts as the collection layer while keeping the backend ([README.md:L101-L115](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L101-L115)). It is not part of this snapshot.

## Main flow

1. A Shortcut or the web app calls an `/api/v1/*` route with `X-Ping-Key` or a JWT ([README.md:L73](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L73)).
2. Global middleware adds a correlation ID, telemetry, request logging, version headers, and API-key or user resolution ([server/app.ts:L291-L306](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L291-L306)).
3. A route calls a domain service or DAL class, which writes to PostgreSQL ([server/routes/versions/v1/index.ts:L108](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/routes/versions/v1/index.ts#L108), [server/domain/services/index.ts:L18-L20](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/domain/services/index.ts#L18-L20)).
4. Selected events publish to RabbitMQ, and live drive updates go out over WebSocket ([server/services/EventPublisher.ts:L118-L126](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/services/EventPublisher.ts#L118-L126), [server/bin/www.ts:L27-L30](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/bin/www.ts#L27-L30)).

## Wiki pages

- [Architecture](../architecture/): components, contracts, and the request path.
- [Iteration Loop](../iteration-loop/): how a change is checked, pushed, and deployed.
- [Services and Dependencies](../services-and-dependencies/): what Ping depends on and who calls it.
- [Operations](../operations/): start, deploy, test, and health commands.
- [Glossary](../glossary/): project terms with sources.
