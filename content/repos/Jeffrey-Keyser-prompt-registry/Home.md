---
title: Prompt Registry — Overview
description: REST API for storing and retrieving prompt templates, deployed on the Beelink homelab behind Cloudflare Tunnel.
---

# Prompt Registry

Lightweight prompt-storage service. Exposes CRUD over HTTP for prompt templates, snippets, and ADR text keyed by string namespaces. Backed by PostgreSQL, fronted by Swagger UI, optionally fans out change events via RabbitMQ.

## At a glance

- **Runtime**: Express 5 + TypeScript on Node 20+ ([server/package.json:25-26](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/package.json#L25-L26), [server/package.json:62](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/package.json#L62))
- **Storage**: PostgreSQL via native `pg` and the `@jeffrey-keyser/database-base-config` package ([CLAUDE.md:147](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L147))
- **Public surface**: `https://prompt-api.jeffreykeyser.net` via Cloudflare Tunnel ([CLAUDE.md:13](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L13))
- **Auth**: None — disabled by design; rate-limited per IP ([server/app.ts:71-73](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/app.ts#L71-L73), [server/middleware/rateLimiting.ts:31-46](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/middleware/rateLimiting.ts#L31-L46))
- **Versioning**: URL-prefix and `Accept-Version` header, current version v1 ([CLAUDE.md:55-65](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L55-L65))
- **Events**: Optional RabbitMQ topic exchange `prompt.events` ([server/services/promptEventPublisher.ts:4-29](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/services/promptEventPublisher.ts#L4-L29))
- **Deploy**: systemd unit `prompt-registry.service` on the Beelink homelab ([prompt-registry.service:1-16](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/prompt-registry.service#L1-L16))

## Who uses it

Consumers are personal Jeffrey-Keyser ecosystem agents and tools that read prompt templates at runtime instead of vendoring them. ADRs live under the `adrs/` namespace key prefix ([README.md:334](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/README.md#L334)).

## How work flows through it

1. Client (curl, Swagger UI, or downstream agent) hits a `/api/v1/prompts` endpoint ([CLAUDE.md:46-50](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L46-L50)).
2. Rate limit + version negotiation middleware run, then the v1 router dispatches to a route handler ([server/app.ts:117-138](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/app.ts#L117-L138)).
3. Route delegates to the DAL, which executes parameterized SQL against `prompt_registry.prompts` ([server/dal/prompts.ts:11-29](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/dal/prompts.ts#L11-L29)).
4. On mutation, the event publisher emits a `prompt.created|updated|deleted` event to RabbitMQ when `AMQP_URL` is configured ([server/types/events.ts:1-10](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/types/events.ts#L1-L10), [server/services/promptEventPublisher.ts:15-29](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/services/promptEventPublisher.ts#L15-L29)).

## Wiki pages

- [Architecture](./architecture/) — module layout, request pipeline, DAL.
- [Iteration Loop](./iteration-loop/) — how a change moves from edit to deploy.
- [Services and Dependencies](./services-and-dependencies/) — inbound/outbound integrations.
- [Operations](./operations/) — start command, systemd, logs, health, tunnel.
- [Glossary](./glossary/) — repo-specific terms.
