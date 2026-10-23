---
title: "Services and Dependencies"
description: "What Prompt Registry depends on at runtime and in code, and which callers are confirmed versus unknown or expected."
---

# Services and dependencies

## Depends on

### Runtime services

- **PostgreSQL (required).** The pool is created from `config.databaseConfig` ([server/db/connection.ts:L4](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/db/connection.ts#L4)). Connection settings come from `DATABASE_*` variables with `DB_*` fallbacks ([server/config/env.ts:L70-L75](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/config/env.ts#L70-L75)). Pool size is fixed at 5 in config ([server/config/env.ts:L77](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/config/env.ts#L77)).
- **RabbitMQ (optional).** Read from `AMQP_URL`. When unset, the publisher is disabled ([server/services/promptEventPublisher.ts:L25](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/services/promptEventPublisher.ts#L25), [server/services/promptEventPublisher.ts:L29-L33](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/services/promptEventPublisher.ts#L29-L33)). After a connection close, the code clears state and does not show a reconnect ([server/services/promptEventPublisher.ts:L50-L54](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/services/promptEventPublisher.ts#L50-L54)).
- **Analytics Pulse (configured, optional).** Telemetry posts to `ANALYTICS_PULSE_URL` with a 5-second timeout and ignores failures ([server/services/telemetry.ts:L15-L25](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/services/telemetry.ts#L15-L25)). The default URL is set in config ([server/config/env.ts:L110](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/config/env.ts#L110)). The prompts route imports it, but call sites are not in the excerpt, and the service's reachability is unknown.
- **Cloudflare Tunnel (documented).** Public hostname `prompt-api.jeffreykeyser.net` ([CLAUDE.md:L9](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/CLAUDE.md#L9)). Trust proxy is enabled in production ([server/app.ts:L45](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/app.ts#L45)), and rate limiting reads `CF-Connecting-IP` ([server/middleware/rateLimiting.ts:L8-L14](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/middleware/rateLimiting.ts#L8-L14)). The tunnel's configuration is not in this snapshot.
- **Docker (unit ordering).** The systemd unit orders after and wants `docker.service` ([prompt-registry.service:L3-L4](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/prompt-registry.service#L3-L4)). The application code does not use Docker, and the reason is not documented.

### Packages

- `@jeffrey-keyser/express-server-factory` creates the app, health check, Swagger, and rate limiter ([server/app.ts:L1-L5](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/app.ts#L1-L5), [server/middleware/rateLimiting.ts:L1](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/middleware/rateLimiting.ts#L1)).
- `@jeffrey-keyser/database-base-config` supplies the pool and config validation ([server/config/env.ts:L4-L7](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/config/env.ts#L4-L7)).
- `amqplib` is the RabbitMQ client ([server/services/promptEventPublisher.ts:L14](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/services/promptEventPublisher.ts#L14)).
- `@jeffrey-keyser/api-errors` is listed as a dependency ([server/package.json:L17](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/package.json#L17)). Error classes are defined locally in `server/utils/errors.ts` ([server/utils/errors.ts:L1-L2](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/utils/errors.ts#L1-L2)).

### CI

- The backend job checks out a private actions repository using a secret token ([.github/workflows/ci-cd-pipeline.yml:L18-L23](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/.github/workflows/ci-cd-pipeline.yml#L18-L23)).

## Consumed by

**Confirmed in this snapshot.** No caller is confirmed by code in this repo. The publisher header states no ecosystem service currently binds a queue to `prompt.events`, and it names agency-hq, business-hq, and dev-inbox as not binding ([server/services/promptEventPublisher.ts:L4-L8](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/services/promptEventPublisher.ts#L4-L8)).

**Documented, not verified as deployed:**

- Direct HTTP clients (curl, Swagger UI) against `/api/v1/prompts` ([CLAUDE.md:L130](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/CLAUDE.md#L130), [server/app.ts:L97](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/app.ts#L97)).

**Expected but unknown:**

- Agent tools that fetch prompts or ADRs by namespaced key ([README.md:L337](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/README.md#L337)). No named consumer is in this snapshot.
- Future RabbitMQ subscribers. Event consumers are not documented ([server/types/events.ts:L1](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/types/events.ts#L1)).

## Public surface

- `GET /` and `GET /ping` ([server/routes/index.ts:L6-L16](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/routes/index.ts#L6-L16)).
- `GET /health` with a database check ([server/app.ts:L78-L86](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/app.ts#L78-L86)).
- `/api/v1/prompts` CRUD, versions, and restore ([CLAUDE.md:L163-L168](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/CLAUDE.md#L163-L168), [server/routes/prompts.ts:L30-L32](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/routes/prompts.ts#L30-L32)).
- `GET /api/v1/diagnostics/detailed` ([server/routes/diagnostics.ts:L82-L85](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/routes/diagnostics.ts#L82-L85)).
- `/api-docs` Swagger UI ([CLAUDE.md:L216](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/CLAUDE.md#L216)).
- Legacy `/v1/*` 301 redirects ([server/middleware/versioning.ts:L55-L70](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/middleware/versioning.ts#L55-L70)).
