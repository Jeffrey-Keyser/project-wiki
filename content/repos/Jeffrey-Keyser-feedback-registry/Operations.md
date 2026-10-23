---
title: "Operations"
description: "How Feedback Registry is started, configured, health checked and observed, with clear separation of source-verified and documented-only runtime facts."
---

# Operations

Feedback Registry is a long-running Express service, not a library. The server package is private, has a `start` script and listens on a port ([server/package.json:L3-L7](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/package.json#L3-L7), [server/bin/www.ts:L23](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/bin/www.ts#L23)). The only published package in these sources is the widget.

## Start and build

From `server/`:

- `npm run build` compiles TypeScript to `dist` ([server/package.json:L9](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/package.json#L9)).
- `npm start` runs `node ./dist/bin/www.js` ([server/package.json:L7](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/package.json#L7)).
- `npm run dev` runs `ts-node ./bin/www.ts` ([server/package.json:L8](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/package.json#L8)).

On startup the process logs the port and environment, then listens and logs the health and API-docs URLs ([server/bin/www.ts:L18-L26](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/bin/www.ts#L18-L26)). Exit on `EADDRINUSE` or `EACCES` is explicit ([server/bin/www.ts:L40-L46](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/bin/www.ts#L40-L46)).

## Configuration

- `PORT` defaults to 3001 ([server/config/env.ts:L79-L80](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/config/env.ts#L79-L80)).
- Startup fails when `ORIGIN_BASE_URL`, `CORS_ALLOWED_ORIGINS`, `SESSION_SECRET`, `JWT_SECRET` or `PAY_SERVICE_URL` is missing ([server/config/env.ts:L161-L176](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/config/env.ts#L161-L176)).
- Warnings are logged when GitHub, RabbitMQ or SMTP settings are absent ([server/config/env.ts:L188-L213](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/config/env.ts#L188-L213)).
- Database variables accept `DATABASE_*` or legacy `DB_*` names ([server/config/env.ts:L96-L100](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/config/env.ts#L96-L100)).

## Health and diagnostics

- `GET /health` is registered by the server factory with a database check ([server/app.ts:L150-L158](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/app.ts#L150-L158)).
- `GET /ping` returns `pong` ([server/routes/index.ts:L15-L17](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/routes/index.ts#L15-L17)).
- `GET /api/v1/diagnostics/detailed` is public and documents backend, database and auth sections ([server/routes/diagnostics.ts:L92](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/routes/diagnostics.ts#L92), [server/app.ts:L55](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/app.ts#L55)).

## Observability

- Request logging uses the `dev` format, and each request gets a correlation ID ([server/app.ts:L117](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/app.ts#L117), [server/app.ts:L222](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/app.ts#L222)).
- Services log through `console`; webhook and email failures are logged without throwing ([server/services/GlobalWebhookService.ts:L56-L60](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/services/GlobalWebhookService.ts#L56-L60)).
- Unhandled 5xx errors can create deduplicated GitHub issues when enabled through its environment variables ([server/app.ts:L215-L218](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/server/app.ts#L215-L218)).
- Service log destination (for example a journal) is not visible in these sources. The runtime-incidents guide mentions a systemd drop-in for the service ([docs/runtime-incidents.md:L97](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/docs/runtime-incidents.md#L97)).

## Deployment: documented versus verified

- **Verified in source**: push to `main` posts to a deploy webhook ([.github/workflows/ci-cd-pipeline.yml:L80-L85](https://github.com/Jeffrey-Keyser/feedback-registry/blob/e21e9339c65151a9f0e1293bfc071a2b3ed034f8/.github/workflows/ci-cd-pipeline.yml#L80-L85)).
- **Documented only**: the webhook pulls code and restarts a unit on the homelab. The webhook implementation is outside these sources.
- **Unknown**: the live host, port mapping and public routing.
