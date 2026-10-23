---
title: "Switchboard"
description: "Overview of Switchboard, a feature toggle and configuration service with an Express API, React admin UI, and TypeScript client SDK."
---

# Switchboard

Switchboard is a feature toggle and configuration management service. Applications read flags and typed configuration values at runtime, so behavior can change without a redeploy ([README.md:L10](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/README.md#L10)).

Older wiki text described an AWS Lambda deployment. The current deployment guide says Switchboard is no longer on Lambda and runs as a systemd-managed Node/Express process behind a Cloudflare Tunnel ([DEPLOYMENT_BEELINK.md:L3-L6](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/docs/DEPLOYMENT_BEELINK.md#L3-L6)). This is a documented deployment, not something the source excerpts alone prove.

## At a glance

- **Feature toggles:** enable or disable features without code deployments ([README.md:L14](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/README.md#L14)).
- **Typed configs:** string, number, boolean, and JSON values ([README.md:L15](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/README.md#L15)).
- **Scopes:** user overrides win over application values, which win over global defaults ([ScopeResolver.ts:L17-L20](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/ScopeResolver.ts#L17-L20)).
- **Caching:** hybrid in-memory plus Upstash strategy, selected by `CACHE_STRATEGY` ([cache/index.ts:L43-L54](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/cache/index.ts#L43-L54)).
- **Auth:** API keys for consumer endpoints, Pay-service integration for admin routes ([apiKeyAuth.ts:L14-L35](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/middleware/apiKeyAuth.ts#L14-L35), [app.ts:L86](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/app.ts#L86)).
- **Audit trail:** feature mutations write audit log entries when a user ID is supplied ([FeatureToggleService.ts:L73-L80](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/FeatureToggleService.ts#L73-L80)).
- **Realtime:** an SSE endpoint streams update events ([v1/index.ts:L74-L76](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/routes/versions/v1/index.ts#L74-L76)).
- **Client SDK:** `SwitchboardClient` and React hooks are exported from `client-sdk/` ([client-sdk/src/index.ts:L9](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/client-sdk/src/index.ts#L9), [client-sdk/src/react/index.ts:L6-L10](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/client-sdk/src/react/index.ts#L6-L10)).

## Who uses it

- **Consumer applications** call the REST API or the SDK to check features and configs. Consumer routes accept an optional API key ([API.md:L63](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/docs/API.md#L63)).
- **Operators** use the admin UI. Page modules exist for dashboard, features, config, applications, and audit logs ([pages/admin/index.ts:L1-L5](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/client/src/pages/admin/index.ts#L1-L5)).
- **Confirmed external callers:** unknown. The source excerpts do not identify any specific consuming application.

## Main flow

A consumer request reaches the Express app, passes version and API-key middleware, and then reaches a v1 route. The service layer resolves the value through the cache and database. Mutations publish events to the EventBus ([app.ts:L212-L216](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/app.ts#L212-L216), [EventBus.ts:L134-L136](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/EventBus.ts#L134-L136)).

## Wiki pages

- [Architecture](../architecture/): components and contracts.
- [Iteration Loop](../iteration-loop/): contributor workflow and CI.
- [Services & Dependencies](../services-and-dependencies/): what Switchboard depends on and who calls it.
- [Operations](../operations/): commands, health checks, and observability.
- [Glossary](../glossary/): project terms with source references.
