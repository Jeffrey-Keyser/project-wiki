---
title: Switchboard
description: Serverless feature toggle and configuration management service on AWS Lambda with hybrid caching, audit logging, and a React admin UI.
---

# Switchboard

Switchboard is a feature toggle and configuration management service that lets applications change behavior dynamically without redeploying. It runs on AWS Lambda with PostgreSQL, Upstash Redis, and a React admin dashboard ([README.md:10](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L10)).

## At a glance

- **Purpose:** dynamic feature flags + typed configs (string / number / boolean / json) with hierarchical scopes (user → application → global) ([README.md:14-20](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L14-L20), [README.md:196-220](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L196-L220)).
- **Runtime:** Express 5 wrapped in `serverless-http` on AWS Lambda, single handler exported from `server/lambda.ts` ([server/lambda.ts:1](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/lambda.ts#L1), [server/package.json:38-46](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/package.json#L38-L46)).
- **Storage:** PostgreSQL on RDS via `pg` driver and a DAL pattern; Upstash Redis as L2 cache; `lru-cache` as L1 ([README.md:182-188](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L182-L188), [server/dal/BaseDal.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/dal/BaseDal.ts)).
- **Surfaces:** REST API under `/api/v1/*` ([server/routes/versions/v1/index.ts:46-76](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/routes/versions/v1/index.ts#L46-L76)), React admin UI in `client/`, official SDK in `client-sdk/` published as `@switchboard/client` ([client-sdk/package.json:2-7](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/client-sdk/package.json#L2-L7)).
- **Auth:** API keys (bcrypt) for consumers, JWT/sessions via `@jeffrey-keyser/pay-auth-integration` for admin ([README.md:598-610](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L598-L610), [server/app.ts:38-88](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/app.ts#L38-L88)).
- **Realtime:** SSE endpoint `/api/v1/realtime/events` backed by Redis pub/sub via `EventBus` ([CLAUDE.md:235-260](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L235-L260), [server/services/EventBus.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/services/EventBus.ts)).

## Who uses this

- **Consumer apps** call REST / SDK to read flags and configs; resolution is scope-aware (user override > application > global) ([README.md:196-220](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L196-L220)).
- **Operators / product** use the admin UI in `client/` to create features, configs, applications, and inspect audit logs ([client/src](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/client/src), [server/routes/audit-logs.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/routes/audit-logs.ts)).
- **Other Jeffrey-Keyser services** integrate via the SDK and Pay auth, sharing the central Pay identity service at `pay.jeffreykeyser.net` ([server/app.ts:51](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/app.ts#L51)).

## How work moves through it

Edits in the admin UI hit `/api/v1/features|configs|applications` routes, which call domain services (`FeatureToggleService`, `ConfigService`, `ApplicationService`), which write through DALs to Postgres and publish change events on `EventBus` so connected SSE clients refresh instantly ([server/services](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/services), [CLAUDE.md:222-260](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L222-L260)).

## Wiki pages

- [Architecture](./architecture/) — internal module layout, Lambda app composition, cache + scope resolution.
- [Iteration Loop](./iteration-loop/) — how a change moves from branch to prod (CI, Terraform, Lambda deploy).
- [Services & Dependencies](./services-and-dependencies/) — npm packages, AWS services, and downstream consumers.
- [Operations](./operations/) — deploy commands, runtime ports, health probes, observability.
- [Glossary](./glossary/) — Switchboard-specific terms (scope, hybrid cache, rollout, EventBus, etc.).
