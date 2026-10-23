---
title: "Glossary"
description: "Project-specific terms used in Prompt Registry, with source citations."
---

# Glossary

**Prompt.** A stored template with a unique `key`, `value`, optional `description`, and timestamps. The current row is in `prompt_registry.prompts`, and the model says it holds the latest version ([server/types/models.ts:L36-L59](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/types/models.ts#L36-L59), [server/db/schema/001_prompts_table.sql:L6-L13](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/db/schema/001_prompts_table.sql#L6-L13)).

**PromptKey.** The list-view shape: `key`, `version`, `tags`, and `updated_at` ([server/types/models.ts:L64-L73](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/types/models.ts#L64-L73)).

**Namespace.** A slash-separated key prefix. Keys with `/` must be URL-encoded as `%2F` in paths ([README.md:L337-L339](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/README.md#L337-L339)). The namespace for events is the key minus its last segment ([server/services/promptEventPublisher.ts:L77-L81](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/services/promptEventPublisher.ts#L77-L81)).

**ADR.** An architecture decision record stored as a prompt under `adrs/` ([README.md:L337](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/README.md#L337)).

**Version and restore.** Each create or update writes a row to `prompt_versions`. Restore copies a historical version into a new current version with `updated_by` set to null ([server/dal/prompts.ts:L155-L158](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/dal/prompts.ts#L155-L158), [server/routes/promptVersions.ts:L231-L237](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/routes/promptVersions.ts#L231-L237)).

**Parameter.** A template variable definition with a name matching `{{name}}`, a type, and optional constraints ([server/types/models.ts:L5-L30](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/types/models.ts#L5-L30)).

**Tag.** A lowercase label. Tags must start with a letter, can use hyphens and colons, and are limited to 10 per prompt and 50 characters each ([server/services/tagValidator.ts:L4-L23](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/services/tagValidator.ts#L4-L23)).

**Description limit.** Descriptions are capped at 180 characters by the validator ([server/services/descriptionValidator.ts:L14](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/services/descriptionValidator.ts#L14)).

**Batch fetch.** A bulk lookup by keys with a limit of 100 keys ([server/routes/prompts.ts:L25-L28](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/routes/prompts.ts#L25-L28), [server/dal/prompts.ts:L31-L38](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/dal/prompts.ts#L31-L38)).

**Dry run.** `POST /api/v1/prompts/import?dryRun=true` validates items without writing ([server/routes/prompts.ts:L351-L353](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/routes/prompts.ts#L351-L353)).

**API-Version.** The negotiated API version. It comes from `Accept-Version`, defaults to 1, and is echoed in the `API-Version` response header ([server/middleware/versioning.ts:L23-L40](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/middleware/versioning.ts#L23-L40)).

**Legacy redirect.** A 301 from `/v1/*` to `/api/v1/*` ([server/middleware/versioning.ts:L55-L70](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/middleware/versioning.ts#L55-L70)).

**CF-Connecting-IP.** The Cloudflare header used as the client IP for rate limiting ([server/middleware/rateLimiting.ts:L8-L14](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/middleware/rateLimiting.ts#L8-L14)).

**Read and write limiters.** 100 requests per minute for GET and 20 for POST, PUT, DELETE, and PATCH ([server/middleware/rateLimiting.ts:L28-L46](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/middleware/rateLimiting.ts#L28-L46), [server/app.ts:L127-L131](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/app.ts#L127-L131)).

**PromptEvent.** The published payload with `type`, `key`, `namespace`, `version`, `timestamp`, and `actor` ([server/types/events.ts:L1-L10](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/types/events.ts#L1-L10)).

**prompt.events.** The durable RabbitMQ topic exchange. Publishing is a no-op when no channel exists ([server/services/promptEventPublisher.ts:L17](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/services/promptEventPublisher.ts#L17), [server/services/promptEventPublisher.ts:L96](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/services/promptEventPublisher.ts#L96)).

**Health gate.** The post-restart `/health` poll in `deploy.sh` ([deploy.sh:L36-L46](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/deploy.sh#L36-L46)).

**Analytics Pulse.** The external telemetry endpoint configured by `ANALYTICS_PULSE_URL` ([server/services/telemetry.ts:L15-L16](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/services/telemetry.ts#L15-L16)).

**Cloudflare Tunnel.** The public access path for `prompt-api.jeffreykeyser.net` ([CLAUDE.md:L9](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/CLAUDE.md#L9)).

**DAL.** The data access layer in `server/dal/`, which holds SQL ([server/dal/prompts.ts:L1-L4](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/dal/prompts.ts#L1-L4)).

**prompt-registry.service.** The systemd unit in the repo ([prompt-registry.service:L1-L16](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/prompt-registry.service#L1-L16)).
