---
title: "Solo Vault — Repo Overview"
description: "Overview of Solo Vault, a self-hosted secrets service with an Express API for Lambda and a companion CLI."
---

# Solo Vault

Solo Vault is a lightweight, self-hosted secrets management service for the Jeffrey-Keyser ecosystem. It stores sensitive configuration values, such as API keys, database credentials, and tokens, behind a REST API and a command-line tool ([README.md:L3](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/README.md#L3), [README.md:L7](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/README.md#L7)).

## At a glance

- **Two packages in one repo**: the server `@jeffrey-keyser/solo-vault-server` in `server/` and the CLI `@jeffrey-keyser/solo-vault-cli` in `cli/` ([server/package.json:L2](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/package.json#L2), [cli/package.json:L2](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/package.json#L2)). The root package is marked private ([package.json:L5](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/package.json#L5)).
- **Encryption**: secret values use AES-256-GCM ([server/services/encryption.ts:L3](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/services/encryption.ts#L3)). The key is derived with scrypt from `VAULT_ENCRYPTION_KEY` ([server/services/encryption.ts:L17-L19](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/services/encryption.ts#L17-L19)).
- **Authentication**: Bearer API keys. The full key is hashed with SHA-256 before storage ([server/services/api-key-utils.ts:L13-L15](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/services/api-key-utils.ts#L13-L15)). Permissions are `read`, `write`, `delete`, and `admin` ([server/types/index.ts:L74](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/types/index.ts#L74)).
- **Storage**: PostgreSQL with default schema `vault` ([server/config/env.ts:L99](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/config/env.ts#L99), [CLAUDE.md:L58-L61](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/CLAUDE.md#L58-L61)).
- **Runtime**: an Express app exported as a Lambda handler ([server/app.ts:L147-L150](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/app.ts#L147-L150)). Node.js 20 or later is required ([server/package.json:L65-L66](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/package.json#L65-L66)).
- **Documented base URL**: `https://vault.jeffreykeyser.net/api/v1` ([README.md:L66](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/README.md#L66)). The excerpts do not verify that this deployment is live.

## Who uses it

- **Developers** use the CLI. Commands include `get`, `set`, `list`, `pull`, `push`, and the rotation commands ([cli/src/index.ts:L37-L43](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/src/index.ts#L37-L43), [cli/src/index.ts:L127-L132](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/src/index.ts#L127-L132), [cli/src/index.ts:L142-L151](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/src/index.ts#L142-L151)).
- **Administrators** manage API keys, webhooks, rotation policies, and audit exports. These routes check for admin access ([server/routes/api-keys.ts:L12](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/routes/api-keys.ts#L12), [server/routes/webhooks.ts:L9-L10](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/routes/webhooks.ts#L9-L10), [server/routes/audit.ts:L84](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/routes/audit.ts#L84)).
- **CI/CD jobs and deployed services** are the documented audience ([README.md:L7](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/README.md#L7)). The excerpts show no concrete consumer. See the Services page.

## Main flow

1. A client sends `Authorization: Bearer <key>`. The middleware extracts the key ([server/middleware/api-key-auth.ts:L12-L25](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/middleware/api-key-auth.ts#L12-L25)).
2. The key's `key_id` prefix is looked up. The hash, active flag, and expiry are then checked ([server/dal/api-keys.ts:L61-L92](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/dal/api-keys.ts#L61-L92)).
3. Routes validate input with `express-validator` and call data modules ([server/routes/webhooks.ts:L58-L66](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/routes/webhooks.ts#L58-L66)).
4. Encrypted values are decrypted and re-encrypted with a new IV. The rotation DAL shows this pattern ([server/dal/rotation.ts:L40-L45](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/dal/rotation.ts#L40-L45)). The secrets routes are not in the excerpts.
5. The audit DAL provides the write path for `audit_log` entries ([server/dal/audit.ts:L21-L35](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/dal/audit.ts#L21-L35)). Which routes call it is not shown in the excerpts.

## Wiki pages

- [Architecture](../architecture/): components, contracts, and component map.
- [Iteration Loop](../iteration-loop/): local workflow, scripts, and CI gates.
- [Services and Dependencies](../services-and-dependencies/): dependencies and confirmed versus expected callers.
- [Operations](../operations/): start, deploy, test, and health commands.
- [Glossary](../glossary/): project-specific terms.
