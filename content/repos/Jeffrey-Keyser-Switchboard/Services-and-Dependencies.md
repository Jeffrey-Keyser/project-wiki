---
title: "Services and Dependencies"
description: "What Switchboard depends on at runtime and which callers are confirmed versus expected."
---

# Services & Dependencies

## Depends on

### Runtime services

- **Pay auth service.** Admin authentication is delegated to the Pay service. `PAY_SERVICE_URL` is read from config, and the code falls back to `https://pay.jeffreykeyser.net` ([app.ts:L49-L59](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/app.ts#L49-L59)).
- **PostgreSQL.** A pool is created from `config.databaseConfig` through `@jeffrey-keyser/database-base-config` ([connection.ts:L1-L4](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/db/connection.ts#L1-L4)). The session store uses the `user_sessions` table ([app.ts:L136-L139](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/app.ts#L136-L139)).
- **Upstash Redis (optional).** It is used as L2 cache when `CACHE_STRATEGY` is `upstash` or `hybrid`, reading `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` ([cache/index.ts:L72-L89](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/cache/index.ts#L72-L89)). The default is `memory` ([cache/index.ts:L54](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/cache/index.ts#L54)).
- **RabbitMQ (optional).** `bin/www.ts` starts a CronEventSubscriber, which disables itself when RabbitMQ or amqplib is unavailable ([www.ts:L22-L29](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/bin/www.ts#L22-L29)). Whether it is deployed is unknown.
- **CloudWatch (conditional).** Metrics are sent only in production or when `ENABLE_CLOUDWATCH` is `true` ([metrics.ts:L36](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/middleware/metrics.ts#L36)). The metrics middleware is not in the app's `customMiddleware` list ([app.ts:L205-L236](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/app.ts#L205-L236)).

### Key packages

- `@jeffrey-keyser/express-server-factory` builds the Express app ([server/package.json:L28](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/package.json#L28), [app.ts:L1-L5](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/app.ts#L1-L5)).
- `@jeffrey-keyser/pay-auth-integration` provides `setupPayAuth` ([server/package.json:L30](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/package.json#L30), [app.ts:L43-L46](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/app.ts#L43-L46)).
- `@upstash/redis` backs the L2 client ([server/package.json:L31](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/package.json#L31)).
- The SDK's only runtime dependency is `lru-cache`, and React is an optional peer ([client-sdk/package.json:L38-L43](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/client-sdk/package.json#L38-L43)).

## Consumed by

### Confirmed by source

- **The Switchboard admin UI** has page modules for features, config, applications, and audit logs ([pages/admin/index.ts:L1-L5](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/client/src/pages/admin/index.ts#L1-L5)). The excerpts do not show the exact endpoints it calls.
- **The SDK** exports `SwitchboardClient` and React hooks for consuming applications ([client-sdk/src/index.ts:L9](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/client-sdk/src/index.ts#L9), [client-sdk/src/react/index.ts:L6-L10](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/client-sdk/src/react/index.ts#L6-L10)).

### Expected, not confirmed

- **Backend services** calling `/api/v1/features/check`, `/api/v1/features/batch-check`, and `/api/v1/configs/value` ([API.md:L126-L128](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/docs/API.md#L126-L128)). These are documented, but no specific caller is identified.
- **SSE subscribers** on `/api/v1/realtime/events` ([realtime.ts:L15-L18](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/routes/realtime.ts#L15-L18)).
- **Webhook receivers.** `WebhookDeliveryService` is started by the entrypoint, but its source is not in the excerpts, so it is unknown whether any application has a webhook configured ([www.ts:L31-L39](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/bin/www.ts#L31-L39)).

**Unknown:** any specific downstream applications. Do not treat the SDK's presence as proof of adoption.
