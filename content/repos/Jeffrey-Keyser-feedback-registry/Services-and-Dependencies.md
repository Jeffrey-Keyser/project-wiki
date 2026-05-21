---
title: Services and Dependencies
description: Inbound consumers (apps + widgets) and outbound integrations (Pay, GitHub, Postgres, Struct, SMTP, AMQP) for feedback-registry.
---

# Services and Dependencies

Feedback Registry is a hub: it pulls user identity from Pay, classification from Struct, persists in Postgres, pushes issues to GitHub, emails users via SMTP, and fans events out to per-app + global webhook subscribers ([README.md:117-148](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L117-L148)).

## Depends on

### Shared `@jeffrey-keyser/*` packages

- `@jeffrey-keyser/express-server-factory` — Express bootstrap, health checks, graceful shutdown ([server/app.ts:1-5](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/app.ts#L1-L5)).
- `@jeffrey-keyser/pay-auth-integration` — JWT validation + user resolution against the Pay service ([server/app.ts:32-34](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/app.ts#L32-L34)).
- `@jeffrey-keyser/database-base-config` — Postgres pool + migrations + session table support ([README.md:101-110](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L101-L110)).
- `@jeffrey-keyser/api-errors` — standardized error responses + correlation IDs ([server/app.ts:6](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/app.ts#L6)).
- `@jeffrey-keyser/express-middleware-suite` — logging, tracing, validation ([server/package.json:19-23](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/package.json#L19-L23)).
- `@jeffrey-keyser/github-error-issues` — middleware that auto-files GitHub issues for uncaught server errors ([server/app.ts:7](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/app.ts#L7)).
- `@jeffrey-keyser/message-contracts` — typed event names + payloads (e.g., `feedback.triaged`) ([server/services/FeedbackService.ts:57](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/services/FeedbackService.ts#L57)).
- `@jeffrey-keyser/pay-api-types` — shared Pay user/session types ([server/package.json:24-25](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/package.json#L24-L25)).

### External services

- **Pay service** (`PAY_SERVICE_URL`, default `https://pay.jeffreykeyser.net`) — identity provider for both end-user JWTs and admin auth ([server/app.ts:27](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/app.ts#L27), [CLAUDE.md:223-229](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/CLAUDE.md#L223-L229)).
- **PostgreSQL** with `feedback` schema (`apps`, `submissions`, `comments`, `notifications`) ([README.md:344-446](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L344-L446)).
- **GitHub REST API** — `GitHubService` creates issues in `feedback.apps.github_repo` and consumes `issues.closed` / `issue_comment.created` webhooks at `/api/v1/webhooks/github` ([README.md:335-342](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L335-L342)).
- **Struct service** — internal AI classifier at port 3032, used by `AutoTriageService` for schema-conformant labeling. When `STRUCT_URL` is unset, falls back to keyword triage ([CLAUDE.md:174-179](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/CLAUDE.md#L174-L179)).
- **SMTP** via `nodemailer` — outbound user notifications driven by `feedback.notifications` rows ([server/package.json:30](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/package.json#L30), [README.md:430-446](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L430-L446)).
- **AMQP broker** via `amqplib` — async event publishing for downstream consumers using `message-contracts` schemas ([server/package.json:18-19](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/package.json#L18-L19)).

### Direct npm runtime deps worth noting

`express@5`, `express-session`, `express-validator`, `express-rate-limit`, `jsonwebtoken`, `swagger-jsdoc` + `swagger-ui-express`, `pg`, `uuid`, `bcrypt` ([server/package.json:18-46](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/package.json#L18-L46)).

## Consumed by

- **Every ecosystem frontend** via `@jeffrey-keyser/feedback-widget` (peer React 18+, exported ESM+CJS). Widgets POST to `/api/v1/feedback` from Travel Map, Workout, Pay Portal, Pantry, Solo Vault, etc. ([packages/feedback-widget/package.json:1-30](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/packages/feedback-widget/package.json#L1-L30), [README.md:118-127](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L118-L127)).
- **Admin SPA** (`client/` in this repo) — internal dashboard for triage, comments, resolution ([client/package.json:1-5](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/client/package.json#L1-L5)).
- **Per-app webhook subscribers** — each registered app receives `feedback.triaged` / `feedback.resolved` callbacks via `WebhookDispatchService` ([server/services/FeedbackService.ts:463-516](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/services/FeedbackService.ts#L463-L516)).
- **Global subscribers** — `GlobalWebhookService` fires `feedback.created` / `feedback.resolved` for ecosystem-wide listeners (e.g., dashboards, analytics) ([server/services/GlobalWebhookService.ts:19](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/services/GlobalWebhookService.ts#L19)).
- **`github-error-issues`** consumes failures via shared middleware in this repo and tracks issues in the same GitHub repos that Feedback Registry targets ([server/app.ts:7](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/app.ts#L7), [README.md:8-14](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L8-L14)).
