---
title: "Services and Dependencies"
description: "What Solo Vault depends on, and which callers are confirmed in source versus expected or unknown."
---

# Services and Dependencies

Solo Vault depends on PostgreSQL, a few shared npm packages, and AWS-hosted build and deploy paths. Its confirmed in-repo caller is the CLI. Other consumers are documented but not verified.

## Depends on

### Data and configuration
- **PostgreSQL** holds all persistent state, in the schema named by `DATABASE_SCHEMA` (default `vault`) ([server/config/env.ts:L99](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/config/env.ts#L99), [server/db/README.md:L3](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/db/README.md#L3)).
- **Encryption key**: `VAULT_ENCRYPTION_KEY` is read from the process environment ([server/config/env.ts:L106](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/config/env.ts#L106)). The README says it is stored in AWS Secrets Manager ([README.md:L282](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/README.md#L282)). The excerpts do not show how it reaches the runtime.
- **Config loader**: `server/config/env.ts` implements validation inline ([server/config/env.ts:L26-L151](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/config/env.ts#L26-L151)). A migration doc to a shared loader package lists publishing and template update as unchecked ([docs/CONFIG_LOADER_MIGRATION.md:L239-L240](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/docs/CONFIG_LOADER_MIGRATION.md#L239-L240)).

### Packages
- `@jeffrey-keyser/express-server-factory` builds the app ([server/app.ts:L2-L5](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/app.ts#L2-L5)).
- `@jeffrey-keyser/database-base-config` provides the pool and config validation ([server/db/connection.ts:L1](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/db/connection.ts#L1), [server/config/env.ts:L4-L7](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/config/env.ts#L4-L7)).
- Express 5, `express-rate-limit`, `express-validator`, `pg`, and `serverless-http` are direct server dependencies ([server/package.json:L26-L33](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/package.json#L26-L33)).
- The CLI depends on `commander` ([cli/package.json:L32-L34](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/package.json#L32-L34)).

### External services
- **Outbound HTTPS** from webhook delivery to subscriber URLs ([server/services/webhook-delivery.ts:L59-L67](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/services/webhook-delivery.ts#L59-L67)). No caller is in the excerpts.
- **NanoClaw IPC file** at a hardcoded path, used for Telegram expiry alerts ([server/services/expiry-check.ts:L5](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/services/expiry-check.ts#L5), [server/services/expiry-check.ts:L31-L39](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/services/expiry-check.ts#L31-L39)). Whether that path exists in any deployment is unknown.
- **AWS**: CI configures credentials via OIDC and deploys to ECR and Lambda ([.github/workflows/ci-cd-pipeline.yml:L105-L118](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/.github/workflows/ci-cd-pipeline.yml#L105-L118)).
- **GitHub Actions composites** from `jeffrey-keyser/github-actions`, such as `node-build` and `ecr-lambda-deploy` ([.github/workflows/ci-cd-pipeline.yml:L18-L22](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/.github/workflows/ci-cd-pipeline.yml#L18-L22)). Their source is not in the excerpts.
- **Terraform** lives in `terraform/` ([CLAUDE.md:L25](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/CLAUDE.md#L25)). Those files are not in the excerpts.

## Consumed by

**Confirmed in source**
- **The CLI** calls the secrets endpoints with Bearer auth ([cli/src/lib/api-client.ts:L265-L290](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/src/lib/api-client.ts#L265-L290), [cli/src/lib/api-client.ts:L76-L80](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/src/lib/api-client.ts#L76-L80)).
- **Bulk pull** in the CLI writes `.env` output with mode 0600 ([cli/src/commands/pull.ts:L14-L22](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/src/commands/pull.ts#L14-L22), [cli/src/commands/pull.ts:L65-L68](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/src/commands/pull.ts#L65-L68)).

**Documented, not verified**
- **Ecosystem services** are said to read `.env` values from the API at deploy or boot ([README.md:L7](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/README.md#L7)). No consumer appears in the excerpts.
- **CI/CD jobs** may use environment-scoped keys ([README.md:L331-L334](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/README.md#L331-L334)). The workflows here do not call the API.

**Expected or unknown**
- **A scheduler** for `/v1/cron/expiry-check` and `/v1/cron/audit-cleanup` is expected ([server/routes/cron.ts:L24-L26](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/routes/cron.ts#L24-L26), [server/routes/cron.ts:L60-L62](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/routes/cron.ts#L60-L62)). Its identity is unknown.
- **Webhook subscribers** are registered through the admin API ([server/routes/webhooks.ts:L45-L81](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/routes/webhooks.ts#L45-L81)). No code in the excerpts dispatches events to them.

## Inbound endpoints

Routes are mounted at `/v1/secrets`, `/v1/api-keys`, `/v1/health`, `/v1/cron`, `/v1/audit`, `/v1/webhooks`, and `/v1/rotation-policies`, plus `/health` and `/ping` ([server/app.ts:L118-L127](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/app.ts#L118-L127), [server/routes/index.ts:L46-L52](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/routes/index.ts#L46-L52)). The secrets routes file is not in the excerpts, so its endpoints are documented only in the README ([README.md:L77-L89](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/README.md#L77-L89)).
