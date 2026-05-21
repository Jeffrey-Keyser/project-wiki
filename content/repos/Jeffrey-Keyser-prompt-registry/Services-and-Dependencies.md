---
title: Services and Dependencies
description: Inbound consumers and outbound integrations for the prompt-registry service.
---

# Services and dependencies

## Depends on

### Runtime services

- **PostgreSQL** — primary store, accessed via native `pg` driver behind `@jeffrey-keyser/database-base-config` ([CLAUDE.md:147](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L147), [server/package.json:18](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/package.json#L18)). Schema lives at `server/db/schema/001_prompts_table.sql`.
- **RabbitMQ (optional)** — topic exchange `prompt.events` published to via `amqplib`. Disabled when `AMQP_URL` is unset, so the service degrades gracefully ([server/services/promptEventPublisher.ts:15-29](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/services/promptEventPublisher.ts#L15-L29), [server/package.json:20](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/package.json#L20)).
- **Cloudflare Tunnel** — terminates TLS at `prompt-api.jeffreykeyser.net` and forwards to the local Express port. Used as the source of real client IP via `CF-Connecting-IP` for rate-limit keying ([server/middleware/rateLimiting.ts:8-14](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/middleware/rateLimiting.ts#L8-L14)).

### Internal packages

- `@jeffrey-keyser/express-server-factory` — composes the Express app, health check, Swagger, error handling ([server/app.ts:1-5](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/app.ts#L1-L5)).
- `@jeffrey-keyser/database-base-config` — Postgres pool + config validation ([CLAUDE.md:147](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L147)).
- `@jeffrey-keyser/api-errors` — standardized error envelope ([CLAUDE.md:280-282](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L280-L282)).

### Third-party libraries

`express`, `express-rate-limit`, `express-validator`, `swagger-jsdoc`, `swagger-ui-express`, `amqplib`, `zod`, `dotenv` ([server/package.json:16-34](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/package.json#L16-L34)).

### CI dependencies

- `jeffrey-keyser/github-actions` private composite-action repo, pulled via `PRIVATE_ACTIONS_TOKEN` ([.github/workflows/ci-cd-pipeline.yml:18-34](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/.github/workflows/ci-cd-pipeline.yml#L18-L34)).

## Consumed by

- **Jeffrey-Keyser ecosystem agents** — fetch prompt text and ADRs at runtime using the namespaced keys (e.g. `adrs/prompt-registry`) instead of vendoring them ([README.md:334](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/README.md#L334)).
- **Swagger UI / curl clients** — direct human use against `/api-docs` and `/api/v1/prompts` ([CLAUDE.md:90-93](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L90-L93)).
- **RabbitMQ subscribers** — any consumer that binds to the `prompt.events` topic exchange and listens for `prompt.created|updated|deleted` routing keys ([server/types/events.ts:1-10](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/types/events.ts#L1-L10)).

## Public surface

- `GET /` and `/ping` — root + health utility ([server/routes/index.ts:6-16](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/routes/index.ts#L6-L16)).
- `GET /health` — provided by the server factory, wired to a Postgres ping ([server/app.ts:75-83](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/app.ts#L75-L83)).
- `GET /api-docs` — Swagger UI ([server/app.ts:85-98](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/app.ts#L85-L98)).
- `GET|POST|PUT|DELETE /api/v1/prompts[/{key}]` — primary CRUD ([CLAUDE.md:90-94](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L90-L94)).
- `GET /api/v1/diagnostics/detailed` — system diagnostics ([CLAUDE.md:48](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L48)).
- Legacy `/v1/*` → `/api/v1/*` 301 redirects ([CLAUDE.md:62](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L62)).
