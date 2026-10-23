---
title: "Operations"
description: "Start, deploy, test, and health commands for Solo Vault, with documented versus verified runtime behavior called out."
---

# Operations

Solo Vault is a deployable service, not a library. The root package is private, and the server exposes a runtime entry point ([package.json:L5](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/package.json#L5), [server/package.json:L7-L8](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/package.json#L7-L8)). The CLI is published as an npm package.

## Start commands

- **Local dev**: `npm run dev` at the root runs `ts-node ./bin/www.ts` in `server/` ([package.json:L7](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/package.json#L7), [server/package.json:L8](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/package.json#L8)).
- **Built server**: `npm start` runs `node ./dist/bin/www.js` ([server/package.json:L7](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/package.json#L7)). This needs `npm run build`, which runs `tsc` into `dist` ([server/package.json:L9](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/package.json#L9), [server/tsconfig.json:L6-L7](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/tsconfig.json#L6-L7)).
- **Lambda**: the handler is exported from `server/app.ts` and re-exported by `server/lambda.ts` ([server/app.ts:L150](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/app.ts#L150), [server/lambda.ts:L1](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/lambda.ts#L1)). The `start` script is not used by Lambda.
- **CLI**: `npm install -g @jeffrey-keyser/solo-vault-cli` ([README.md:L27-L29](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/README.md#L27-L29)).

## Database

- `./deploy.sh` in `server/db/` applies schema and migrations ([CLAUDE.md:L53-L55](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/CLAUDE.md#L53-L55)). It also creates session tables ([server/db/deploy.sh:L57-L59](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/db/deploy.sh#L57-L59)).
- `./teardown.sh` prompts for `yes` before running teardown SQL ([server/db/teardown.sh:L33-L37](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/db/teardown.sh#L33-L37)).
- `server/db/init-docker.sql` creates a `user_sessions` table in a `template_dev` database. It does not create `vault` tables ([server/db/init-docker.sql:L9-L26](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/db/init-docker.sql#L9-L26)). Its use is unknown.

## Ports and URLs

- **Port**: `PORT`, default `3001` ([server/config/env.ts:L61](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/config/env.ts#L61)). The Lambda runtime ignores it.
- **Swagger UI**: `/api-docs` is public and enabled outside test mode ([server/app.ts:L92-L94](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/app.ts#L92-L94)).
- **Production URL**: documented as `https://vault.jeffreykeyser.net/api/v1` ([README.md:L66](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/README.md#L66)).

## Health and readiness

- **`GET /health`** is public and runs a database check ([server/app.ts:L82-L90](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/app.ts#L82-L90), [server/middleware/api-key-auth.ts:L7](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/middleware/api-key-auth.ts#L7)).
- **`GET /ping`** returns a pong ([server/routes/index.ts:L46-L52](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/routes/index.ts#L46-L52)).
- **`GET /v1/health`** is an admin dashboard for stale, expiring, and never-accessed secrets ([server/routes/health-dashboard.ts:L23-L29](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/routes/health-dashboard.ts#L23-L29)).
- **Schema drift** fails startup with a message to rerun `server/db/deploy.sh` ([server/db/schema-check.ts:L106-L109](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/db/schema-check.ts#L106-L109)).

## Logs and observability

- **Startup banner** prints version, `NODE_ENV`, `PORT`, and schema ([server/app.ts:L42-L48](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/app.ts#L42-L48)).
- **Request log** uses the `dev` format ([server/app.ts:L70-L72](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/app.ts#L70-L72)).
- **Errors** are logged with method and path ([server/app.ts:L129-L134](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/app.ts#L129-L134)).
- **Audit logs** are in the database and exportable as CSV by admins ([server/routes/audit.ts:L82-L84](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/routes/audit.ts#L82-L84)). Retention defaults to 90 days ([server/config/env.ts:L108](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/config/env.ts#L108)).
- No metrics or tracing appear in the excerpts. Where Lambda logs land is not configured in the excerpts.

## Rate limits

- **Per-IP auth limiter**: default 20 requests per 15 minutes, with localhost at 5x ([server/middleware/rate-limit.ts:L10-L15](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/middleware/rate-limit.ts#L10-L15), [server/config/env.ts:L109-L110](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/config/env.ts#L109-L110)).
- **Per-key write limiter**: default 60 writes per minute on `/v1/secrets` ([server/middleware/rate-limit.ts:L54-L64](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/middleware/rate-limit.ts#L54-L64), [server/config/env.ts:L111-L112](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/config/env.ts#L111-L112)).

## Tests and deploys

- **Server tests**: `npm test` in `server/` ([server/package.json:L12](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/server/package.json#L12)).
- **CLI tests**: `npm test` in `cli/` ([cli/package.json:L12](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/cli/package.json#L12)).
- **Backend deploy** runs on push to `main` ([.github/workflows/ci-cd-pipeline.yml:L73-L75](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/.github/workflows/ci-cd-pipeline.yml#L73-L75)).
- **CLI publish** runs on push to `main` ([.github/workflows/ci-cd-pipeline.yml:L121-L123](https://github.com/Jeffrey-Keyser/solo-vault/blob/b629632e1fea8586822c2bfd99be1e588e825813/.github/workflows/ci-cd-pipeline.yml#L121-L123)).

## Documented versus verified

- **Verified in source**: start scripts, schema check, health route, rate limits, and workflow triggers.
- **Documented only**: the production URL, Secrets Manager storage of the encryption key, and ecosystem consumers.
- **Unknown**: whether the Lambda is live, whether the `/health` probe is wired to anything, how the cron routes are triggered, and whether the scheduler runs in production. The handler does not start it.
- **Rollback**: no procedure appears in the excerpts. Consult the platform owner.
