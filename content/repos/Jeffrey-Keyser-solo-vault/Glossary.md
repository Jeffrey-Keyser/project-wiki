---
title: Glossary
description: Repo-specific terms used throughout Solo Vault.
---

# Glossary

## API key
The credential string Solo Vault accepts in `Authorization: Bearer …`. Format: `sv_<project>_<random>.<secret>`. The prefix (`sv_<project>_<random>`) is the `key_id` stored in the database; the `.<secret>` suffix is hashed (SHA-256) and matched at auth time. Keys are scoped by `project`, optionally by `environment`, and carry permissions from the set `read | write | delete | admin` ([CLAUDE.md:60-79](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/CLAUDE.md#L60-L79), [server/middleware/api-key-auth.ts:1-60](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/middleware/api-key-auth.ts#L1-L60)).

## Bootstrap admin key
A one-time, env-supplied key (`BOOTSTRAP_ADMIN_KEY`) that the middleware accepts as a synthetic admin to mint the first real API key on a fresh deployment. Should be removed from the environment afterward ([server/middleware/api-key-auth.ts:55-60](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/middleware/api-key-auth.ts#L55-L60), [CLAUDE.md:71-74](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/CLAUDE.md#L71-L74)).

## Project / Environment
Solo Vault's two-level namespacing. A `secret` is uniquely identified by `(project, environment, key)` in URLs like `/v1/secrets/:project/:env/:key`. API keys may be scoped to a single project, a single environment within that project, or left unscoped (admin) ([README.md:75-89](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/README.md#L75-L89), [CLAUDE.md:64-68](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/CLAUDE.md#L64-L68)).

## EncryptionService
The class wrapping AES-256-GCM encrypt/decrypt for secret values. Each call generates a fresh 16-byte IV and stores it with the ciphertext and GCM auth tag. The key is derived once at construction via `crypto.scryptSync(VAULT_ENCRYPTION_KEY, "solo-vault-salt", 32)` ([server/services/encryption.ts:1-39](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/services/encryption.ts#L1-L39)).

## Vault schema
The Postgres schema (default name `vault`, override via `DATABASE_SCHEMA`) that owns every table: `secrets`, `api_keys`, `audit_log`, plus rotation/webhook/policy tables added by numbered migrations under `server/db/migrations/` ([CLAUDE.md:46-50](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/CLAUDE.md#L46-L50), [server/db/schema](https://github.com/Jeffrey-Keyser/solo-vault/tree/main/server/db/schema)).

## schemaReady / assertSchemaReady
A startup guard that validates the live DB schema against expectations before the app accepts traffic. Runs on Lambda cold start (or local startup) and exits the process on mismatch — exposed as the exported `schemaReady` promise that `bin/www.ts` awaits ([server/app.ts:28-38](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/app.ts#L28-L38), [server/db/schema-check.ts](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/db/schema-check.ts)).

## DAL (Data Access Layer)
Convention name for `server/dal/*.ts` modules. Each file owns CRUD against one logical table family (`secrets`, `api-keys`, `audit`, `rotation`, `rotation-policies`, `expiry-alerts`, `webhooks`, `secrets-health`). Routes call DAL functions; nothing else talks to `pg` directly ([server/dal](https://github.com/Jeffrey-Keyser/solo-vault/tree/main/server/dal)).

## Rotation policy / Rotation history
A `rotation_policy` row defines how often a secret rotates and what generator to use; the scheduler (`rotation-scheduler.ts`) enqueues due rotations into `rotation-queue.ts`, which writes a `rotation_history` entry on each execution ([server/services](https://github.com/Jeffrey-Keyser/solo-vault/tree/main/server/services), [server/db/migrations/008_create_rotation_history_table.sql](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/db/migrations/008_create_rotation_history_table.sql), [server/db/migrations/009_create_rotation_policies_table.sql](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/db/migrations/009_create_rotation_policies_table.sql)).

## Webhook
An outbound HTTPS subscription registered via `/v1/webhooks`; `webhook-delivery.ts` posts JSON payloads to subscriber URLs on rotation/expiry events ([server/services/webhook-delivery.ts](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/services/webhook-delivery.ts), [server/routes/webhooks.ts](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/routes/webhooks.ts)).

## `.solo-vault.json`
Per-project CLI config — sets `project` and `defaultEnvironment` so CLI calls don't need `--project`/`--env` flags every time. Created by `solo-vault init` ([README.md:260-267](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/README.md#L260-L267)).

## Bulk pull
`POST /v1/secrets/bulk` — single request returning multiple decrypted secrets, used by the CLI's `pull` command to materialize an `.env` file and by ecosystem services at deploy/boot ([README.md:83](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/README.md#L83), [cli/src/commands/pull.ts](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/cli/src/commands/pull.ts)).
