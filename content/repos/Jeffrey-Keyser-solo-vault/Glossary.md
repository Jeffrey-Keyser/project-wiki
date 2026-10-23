---
title: "Glossary"
description: "Project-specific Solo Vault terms with source citations."
---

# Glossary

## API key
A Bearer credential of the form `sv_<project>_<random>.<secret>`. The prefix is stored as `key_id`, and the full key is hashed with SHA-256 ([server/dal/api-keys.ts:L17-L26](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/dal/api-keys.ts#L17-L26), [CLAUDE.md:L69-L70](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/CLAUDE.md#L69-L70)).

## Permission
One of `read`, `write`, `delete`, or `admin` ([server/types/index.ts:L74](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/types/index.ts#L74)). An `admin` permission passes every permission check ([server/dal/api-keys.ts:L198-L205](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/dal/api-keys.ts#L198-L205)).

## Admin key
A key with `project` set to null and the `admin` permission. Only those keys pass `requireAdmin` ([server/middleware/api-key-auth.ts:L216-L234](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/middleware/api-key-auth.ts#L216-L234)).

## Bootstrap admin key
An environment-supplied key, `BOOTSTRAP_ADMIN_KEY`, that the middleware accepts as a synthetic admin ([server/middleware/api-key-auth.ts:L55-L69](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/middleware/api-key-auth.ts#L55-L69)). The documented practice is to remove it after the first real admin key is created ([CLAUDE.md:L78-L81](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/CLAUDE.md#L78-L81)).

## Project and environment
Two-level namespacing for secrets. API keys can be scoped to a project and, optionally, an environment ([server/dal/api-keys.ts:L210-L229](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/dal/api-keys.ts#L210-L229)). The CLI falls back to `defaultEnvironment` or `development` ([cli/src/lib/config.ts:L98-L100](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/src/lib/config.ts#L98-L100)).

## EncryptionService
The AES-256-GCM wrapper. Each call generates a 16-byte IV and returns the ciphertext, IV, and auth tag ([server/services/encryption.ts:L25-L39](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/services/encryption.ts#L25-L39)). Its key is derived from `VAULT_ENCRYPTION_KEY` with a fixed salt ([server/services/encryption.ts:L6](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/services/encryption.ts#L6)).

## Vault schema
The PostgreSQL schema that holds Solo Vault tables. Its default name is `vault` ([server/config/env.ts:L99](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/config/env.ts#L99), [server/db/schema/001_create_vault_schema.sql:L5](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/db/schema/001_create_vault_schema.sql#L5)).

## assertSchemaReady
The startup check that compares live columns to the expected list and fails on drift ([server/db/schema-check.ts:L97-L110](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/db/schema-check.ts#L97-L110)).

## Rotation policy
A row that attaches a 5-field cron `schedule` to a secret. The provider type is limited to `generic` ([server/types/index.ts:L193-L206](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/types/index.ts#L193-L206), [server/routes/rotation-policies.ts:L77-L83](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/routes/rotation-policies.ts#L77-L83)). The design document describes a different interval-based model, so the source takes precedence ([ROTATION_DESIGN.md:L107-L121](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/ROTATION_DESIGN.md#L107-L121)).

## Rotation queue
An in-memory queue. It skips duplicate jobs for a policy and rotates each secret to a random value ([server/services/rotation-queue.ts:L19-L25](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/services/rotation-queue.ts#L19-L25), [server/services/rotation-queue.ts:L62-L69](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/services/rotation-queue.ts#L62-L69)).

## Rotation history
A row written for each rotation attempt, with method, status, and hashes ([server/dal/rotation.ts:L71-L84](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/dal/rotation.ts#L71-L84)).

## Expiry alert
A Telegram-style message for a secret nearing expiry. Thresholds are 14, 7, and 1 days ([server/dal/expiry-alerts.ts:L7](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/dal/expiry-alerts.ts#L7), [server/services/expiry-check.ts:L16-L26](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/services/expiry-check.ts#L16-L26)).

## NanoClaw IPC
The hardcoded file path to which expiry alerts are appended as JSON lines ([server/services/expiry-check.ts:L5](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/services/expiry-check.ts#L5), [server/services/expiry-check.ts:L31-L39](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/services/expiry-check.ts#L31-L39)).

## Webhook
A subscription with a URL, event list, and secret, managed by admin routes ([server/routes/webhooks.ts:L45-L81](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/routes/webhooks.ts#L45-L81)). Delivery is signed with `X-Webhook-Signature` ([server/services/webhook-delivery.ts:L63](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/services/webhook-delivery.ts#L63)).

## Bulk get
`POST /v1/secrets/bulk`, documented as returning many decrypted values at once ([README.md:L83](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/README.md#L83), [CLAUDE.md:L98](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/CLAUDE.md#L98)). The CLI uses it for `pull` ([cli/src/commands/pull.ts:L21-L22](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/src/commands/pull.ts#L21-L22)).

## `.solo-vault.json`
The project config file. It sets `project` and `defaultEnvironment`, and the CLI searches upward for it ([cli/src/lib/config.ts:L8](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/src/lib/config.ts#L8), [cli/src/lib/config.ts:L28-L41](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/src/lib/config.ts#L28-L41)).

## Global CLI config
`~/.solo-vault/config.json`, which holds the API URL and key. Environment variables take precedence ([cli/src/lib/config.ts:L6-L7](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/src/lib/config.ts#L6-L7), [cli/src/lib/config.ts:L51-L59](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/src/lib/config.ts#L51-L59)).

## rotate-key
A CLI command that reads and rewrites every secret, so the server re-encrypts them under a new key. Operators must update `VAULT_ENCRYPTION_KEY` only after success ([cli/src/commands/rotate-key.ts:L76-L96](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/src/commands/rotate-key.ts#L76-L96), [cli/src/commands/rotate-key.ts:L121-L143](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/src/commands/rotate-key.ts#L121-L143)).
