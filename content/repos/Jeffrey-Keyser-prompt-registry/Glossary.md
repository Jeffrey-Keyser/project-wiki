---
title: Glossary
description: Repo-specific terms used in prompt-registry.
---

# Glossary

**Prompt.** A row in `prompt_registry.prompts` consisting of a unique string `key`, a `value` (the prompt text), an optional `description`, plus timestamps and `updated_by`. The keyspace is namespaced by slash convention (e.g. `adrs/...`) ([CLAUDE.md:97-105](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L97-L105), [server/dal/prompts.ts:11-29](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/dal/prompts.ts#L11-L29)).

**PromptKey.** The list-view shape: `{ key, updated_at }` returned by `GET /api/v1/prompts`. Distinct from `Prompt`; the description was deliberately removed from this type (see commit `f08ab5e`) ([CLAUDE.md:46](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L46)).

**Namespace.** The slash-separated prefix of a prompt key used to group related entries. ADRs live under `adrs/`; other categories follow the same convention ([README.md:334](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/README.md#L334)).

**ADR.** Architecture Decision Record, stored as a regular prompt with key prefixed `adrs/` ([README.md:334](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/README.md#L334)).

**API-Version.** The negotiated major version of the API. Defaults to 1, settable via `Accept-Version` request header, echoed via `API-Version` response header ([server/middleware/versioning.ts:23-30](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/middleware/versioning.ts#L23-L30), [CLAUDE.md:55-65](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L55-L65)).

**v1 Router.** The router mounted at `/api/v1` that aggregates `prompts` and `diagnostics` sub-routes ([server/routes/versions/v1/index.ts:17-34](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/routes/versions/v1/index.ts#L17-L34)).

**DAL (Data Access Layer).** Modules in `server/dal/` that own SQL and shape rows into TypeScript types. Mutations go through here before any event publish ([CLAUDE.md:148](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L148), [server/dal/prompts.ts:1-29](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/dal/prompts.ts#L1-L29)).

**PromptEvent.** A `{ type, key, namespace, version, timestamp, actor }` payload published to RabbitMQ on every mutation. `type` is one of `prompt.created | prompt.updated | prompt.deleted` ([server/types/events.ts:1-10](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/types/events.ts#L1-L10)).

**`prompt.events` exchange.** Durable RabbitMQ topic exchange asserted at boot; routing key is the event type. The publisher is a no-op when `AMQP_URL` is unset, so the API still serves without a broker ([server/services/promptEventPublisher.ts:4-29](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/services/promptEventPublisher.ts#L4-L29)).

**CF-Connecting-IP.** The Cloudflare-injected header used as the real client IP for rate-limit keying; falls back to `req.ip` for non-tunneled local dev ([server/middleware/rateLimiting.ts:8-14](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/middleware/rateLimiting.ts#L8-L14)).

**Read limiter / write limiter.** The two rate buckets — 100 rpm for GET, 20 rpm for POST/PUT/DELETE/PATCH — applied via custom middleware before version negotiation ([server/middleware/rateLimiting.ts:31-46](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/middleware/rateLimiting.ts#L31-L46), [server/app.ts:117-138](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/app.ts#L117-L138)).

**Cloudflare Tunnel.** The outbound-only connector from the Beelink homelab to Cloudflare's edge that publishes the service at `prompt-api.jeffreykeyser.net` ([CLAUDE.md:5-7](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L5-L7), [CLAUDE.md:13](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L13)).

**Beelink homelab.** The physical mini-PC running the systemd unit, Postgres, and the cloudflared connector ([CLAUDE.md:5-7](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L5-L7), [prompt-registry.service:8-11](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/prompt-registry.service#L8-L11)).

**`prompt-registry.service`.** The systemd unit file checked into the repo that defines how the service runs in production ([prompt-registry.service:1-16](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/prompt-registry.service#L1-L16)).
