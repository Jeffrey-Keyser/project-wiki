---
title: "Prompt Registry Overview"
description: "Overview of the Prompt Registry API: what it stores, what is confirmed about its users, and how a request moves through it."
---

# Prompt Registry

Prompt Registry is an API-only Express service for storing, retrieving, updating, and deleting prompt templates and snippets by string key. It exposes REST endpoints under `/api/v1/prompts`, serves Swagger UI at `/api-docs`, and persists data in PostgreSQL ([README.md:L3](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/README.md#L3), [CLAUDE.md:L84](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/CLAUDE.md#L84), [CLAUDE.md:L216](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/CLAUDE.md#L216)). An optional RabbitMQ publisher exists, but the source states it currently has no active subscribers ([server/services/promptEventPublisher.ts:L4-L12](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/services/promptEventPublisher.ts#L4-L12)).

## At a glance

- **Runtime**: Express 5 application. The server package declares Node `>=20.0.0` ([server/package.json:L25](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/package.json#L25), [server/package.json:L62](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/package.json#L62)), while the root package declares `>=18.0.0` ([package.json:L41-L43](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/package.json#L41-L43)).
- **Storage**: PostgreSQL through a pool created by `@jeffrey-keyser/database-base-config` ([server/db/connection.ts:L1-L4](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/db/connection.ts#L1-L4)).
- **Access**: No authentication. Authentication is set to disabled in the server config ([server/app.ts:L74-L76](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/app.ts#L74-L76)). Per-IP rate limits are 100 reads and 20 writes per minute ([server/middleware/rateLimiting.ts:L28-L46](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/middleware/rateLimiting.ts#L28-L46)).
- **Versioning**: URL prefix `/api/v1/`. Unsupported path versions return 404 ([server/app.ts:L141](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/app.ts#L141), [server/middleware/versioning.ts:L88-L97](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/middleware/versioning.ts#L88-L97)).
- **Deployment**: Documented as a systemd unit on the Beelink homelab behind Cloudflare Tunnel ([CLAUDE.md:L9](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/CLAUDE.md#L9), [prompt-registry.service:L9-L10](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/prompt-registry.service#L9-L10)). Whether it is live is not verifiable from this snapshot.
- **Events**: Optional topic exchange `prompt.events`, active only when `AMQP_URL` is set ([server/services/promptEventPublisher.ts:L17](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/services/promptEventPublisher.ts#L17), [server/services/promptEventPublisher.ts:L29-L33](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/services/promptEventPublisher.ts#L29-L33)).

## Who uses it

Confirmed in source: the API is documented for direct HTTP use with curl and Swagger UI ([README.md:L29](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/README.md#L29), [CLAUDE.md:L130](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/CLAUDE.md#L130)). No named downstream client is confirmed by this snapshot. Agent-style consumers that fetch prompts at runtime are plausible given the `adrs/` key convention ([README.md:L337](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/README.md#L337)), but they are unknown here. See [Services and Dependencies](../services-and-dependencies/).

## Main flow

1. A client calls a versioned prompt endpoint such as `GET /api/v1/prompts/{key}` ([CLAUDE.md:L163-L168](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/CLAUDE.md#L163-L168)).
2. Custom middleware runs before routing: rate limiter, legacy redirect, version negotiation, and version validation ([server/app.ts:L120-L142](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/app.ts#L120-L142)).
3. The route calls the data access layer, which runs parameterized SQL ([server/dal/prompts.ts:L11-L19](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/dal/prompts.ts#L11-L19)).
4. Create and update run inside a transaction that also writes a version row ([server/dal/prompts.ts:L127-L169](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/dal/prompts.ts#L127-L169)). A best-effort event is published after commit ([server/dal/prompts.ts:L170](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/dal/prompts.ts#L170)).

## Wiki pages

- [Architecture](../architecture/): components, contracts, and request pipeline.
- [Iteration Loop](../iteration-loop/): contributor workflow, tests, CI, and deploy steps.
- [Services and Dependencies](../services-and-dependencies/): what the service depends on and who is confirmed to call it.
- [Operations](../operations/): start, deploy, health, and observability.
- [Glossary](../glossary/): project-specific terms.
