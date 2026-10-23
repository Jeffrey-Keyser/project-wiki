---
title: "Services and Dependencies"
description: "What Agency HQ depends on and which callers are confirmed, documented or unknown."
---

# Services and Dependencies

Source presence is not proof that an integration is live. Items below separate what the code calls from what documentation expects.

## Depends on

- **PostgreSQL**, `agency` schema in a shared instance ([CLAUDE.md:L49](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/CLAUDE.md#L49)). The `/health` check includes the database ([src/app.ts:L76-L77](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/app.ts#L76-L77)), and startup exits if schema is missing ([src/bin/www.ts:L133-L138](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/bin/www.ts#L133-L138)).
- **RabbitMQ** via `amqplib` ([package.json:L38](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/package.json#L38)). Six consumers register after connect; startup continues and reconnects if the broker is down ([src/bin/www.ts:L181-L193](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/bin/www.ts#L181-L193)). Agency HQ also documents a `daily.summary` topic exchange it declares at startup ([docs/daily-summary-events.md:L7-L18](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/docs/daily-summary-events.md#L7-L18)).
- **dev-inbox.** Dispatch spawns `/home/jkeyser/dev-inbox/scripts/manager-standalone.sh` and reads its results directory (`DEV_INBOX_RESULTS_DIR` override) ([src/execution/dispatcher.ts:L34-L51](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/execution/dispatcher.ts#L34-L51)). The Runs list reads plan manifests next to those results ([src/services/run-list-context.ts:L67-L69](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/services/run-list-context.ts#L67-L69)). Acceptance readings environments read dev-inbox `results/` and `queue/` read-only ([acceptance/environments/readings-reader.mjs:L1-L11](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/acceptance/environments/readings-reader.mjs#L1-L11), [src/services/project-acceptance.ts:L150-L157](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/services/project-acceptance.ts#L150-L157)).
- **Credentials.** Startup requires `AGENCY_HQ_API_KEY`, a Feedback Registry token and a JWT signing key, exiting on failure ([src/bin/www.ts:L109-L131](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/bin/www.ts#L109-L131)). The signing key comes from Solo Vault or `AGENCY_HQ_JWT_SIGNING_KEY` ([docs/jwt-authentication.md:L25-L34](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/docs/jwt-authentication.md#L25-L34)); acceptance logins are also fetched from Solo Vault ([src/services/project-acceptance.ts:L194-L215](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/services/project-acceptance.ts#L194-L215)).
- **Model-status sources (documented).** NanoClaw `/model-status` at `127.0.0.1:3101` and the AI Proxy inventory at `127.0.0.1:3005`, both overridable ([docs/model-consumers.md:L36](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/docs/model-consumers.md#L36), [docs/model-consumers.md:L46](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/docs/model-consumers.md#L46)); dev-inbox selector receipts in `results/model-status/` ([docs/model-consumers.md:L34](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/docs/model-consumers.md#L34)).
- **NanoClaw IPC.** `build:deploy` writes a reload request file; whether NanoClaw acts on it is outside this repo ([package.json:L10](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/package.json#L10)).
- **Internal packages:** `database-base-config`, `express-server-factory`, `message-contracts`, `pay-auth-integration`, from GitHub Packages ([package.json:L33-L36](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/package.json#L33-L36), [package.json:L59-L61](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/package.json#L59-L61)).

- **Repository-history acceptance checks.** The `repo-history-exec` environment runs owner-declared command argv against a commit and its first parent in disposable worktrees, and caches the outputs for reuse across acceptance passes ([acceptance/environments/repo-history-exec.mjs:1-12](https://github.com/Jeffrey-Keyser/agency-hq/blob/05577e8773ef075ba82c086a84d20243fd3be1a3/acceptance/environments/repo-history-exec.mjs#L1-L12)).

## Consumed by

### Confirmed in source

- **Agency HQ's own dashboard pages.** The Runs list script calls `/api/v1/run-analyses` ([src/routes/dashboard/templates/runs-plan-groups.ts:L58-L66](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/routes/dashboard/templates/runs-plan-groups.ts#L58-L66)); Topology telemetry GETs are exempt from rate limiting ([src/app.ts:L54-L65](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/app.ts#L54-L65)).
- **Webhook ingress** is mounted at `/api/v1/webhook` ([src/routes/versions/v1/index.ts:L45](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/routes/versions/v1/index.ts#L45)); signed Telegram, GitHub and feedback webhooks are open through the gate ([CLAUDE.md:L94](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/CLAUDE.md#L94)). Whether those senders are configured live is not verifiable here.

### Documented or expected

- QA Patrol and frontend clients are the intended OpenAPI audience ([docs/openapi.yaml:L14-L15](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/docs/openapi.yaml#L14-L15)).
- Cron services, business-hq, NanoClaw and external agents are named as cross-process callers to migrate to JWTs ([docs/jwt-authentication.md:L130-L135](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/docs/jwt-authentication.md#L130-L135)).
- External callers such as NanoClaw may increment task dispatch attempts ([src/execution/dispatcher.ts:L244-L249](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/src/execution/dispatcher.ts#L244-L249)).
- Publishers to `daily.summary.*` ([docs/daily-summary-events.md:L3-L5](https://github.com/Jeffrey-Keyser/agency-hq/blob/c107e01386cfa76587ccfd868b861936c4eea8b1/docs/daily-summary-events.md#L3-L5)).

### Unknown

Which of these callers send live traffic today is unknown. The external access gate means public callers must authenticate, so check gateway logs before assuming a consumer.
