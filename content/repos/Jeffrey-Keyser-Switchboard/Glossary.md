---
title: "Glossary"
description: "Switchboard project terms with the source files that define them."
---

# Glossary

### Feature toggle
A boolean flag resolved per request. The service handles CRUD, toggling, and batch checks ([FeatureToggleService.ts:L21-L28](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/FeatureToggleService.ts#L21-L28), [FeatureToggleService.ts:L288-L325](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/FeatureToggleService.ts#L288-L325)).

### Config value
A typed value stored under a key. The supported types are string, number, boolean, and json ([ConfigService.ts:L19-L24](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/ConfigService.ts#L19-L24), [ConfigService.ts:L258-L294](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/ConfigService.ts#L258-L294)).

### Scope
Resolution priority is user, then application, then global ([ScopeResolver.ts:L17-L20](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/ScopeResolver.ts#L17-L20)).

### Application
A consumer identified by an API key. Keys are generated as random hex and stored as bcrypt hashes ([ApplicationService.ts:L11-L14](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/ApplicationService.ts#L11-L14), [ApplicationService.ts:L208-L218](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/ApplicationService.ts#L208-L218)).

### Rollout strategy
A rule that enables a feature for part of its audience. The types are percentage, whitelist, blacklist, and gradual ([RolloutEvaluator.ts:L8-L14](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/RolloutEvaluator.ts#L8-L14), [RolloutEvaluator.ts:L45-L60](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/RolloutEvaluator.ts#L45-L60)).

### Bucket
The 0 to 99 value from SHA-256 of the identifier and feature key, used for percentage rollouts ([RolloutEvaluator.ts:L290-L302](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/RolloutEvaluator.ts#L290-L302)).

### Hybrid cache
The L1 in-memory cache backed by L2 Upstash. It is one of four strategies: `memory`, `upstash`, `hybrid`, or `none` ([cache/index.ts:L43-L54](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/cache/index.ts#L43-L54), [HybridCacheClient.ts:L5-L13](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/cache/HybridCacheClient.ts#L5-L13)).

### EventBus
The service that publishes change events and buffers them for replay. Its buffer is capped at 1000 events for one hour ([EventBus.ts:L7-L19](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/EventBus.ts#L7-L19), [EventBus.ts:L32-L33](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/EventBus.ts#L32-L33)).

### SSE stream
`GET /api/v1/realtime/events` streams events over Server-Sent Events. It accepts type, application, and entity-key filters ([realtime.ts:L88-L96](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/routes/realtime.ts#L88-L96)).

### Pay auth
Admin authentication delegated to the Pay service through `setupPayAuth`. The default URL is `https://pay.jeffreykeyser.net` ([app.ts:L59](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/app.ts#L59), [app.ts:L86](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/app.ts#L86)).

### API key
A secret sent as `X-API-Key` or `Authorization: ApiKey`, validated by `apiKeyAuth` ([apiKeyAuth.ts:L5-L10](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/middleware/apiKeyAuth.ts#L5-L10), [apiKeyAuth.ts:L18-L35](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/middleware/apiKeyAuth.ts#L18-L35)).

### Audit log
A record written on feature mutations when a user ID is supplied ([FeatureToggleService.ts:L73-L80](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/services/FeatureToggleService.ts#L73-L80), [AuditLogDal.ts:L34](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/dal/AuditLogDal.ts#L34)).

### DAL
Data access layer. `BaseDal` wraps the `pg` pool and provides transactions ([BaseDal.ts:L4-L13](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/dal/BaseDal.ts#L4-L13)).

### API versioning
Versioned routes live under `/api/v1`. Legacy `/v1/*` requests get a 301 redirect ([versioning.ts:L58-L62](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/server/middleware/versioning.ts#L58-L62)).

### Beelink deployment
The documented self-hosted deployment target on a mini-PC, replacing the retired AWS path ([DEPLOYMENT_BEELINK.md:L3-L6](https://github.com/Jeffrey-Keyser/Switchboard/blob/f730264d34f112e64d6ba76a2efcd846c762d5bd/docs/DEPLOYMENT_BEELINK.md#L3-L6)).
