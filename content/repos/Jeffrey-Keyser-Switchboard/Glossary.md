---
title: Glossary
description: Switchboard-specific terms and how they map to source files.
---

# Glossary

### Feature toggle
A boolean switch resolvable at request time, scoped global / application / user. CRUD in `FeatureToggleService` and persisted via `FeatureToggleDal` ([server/services/FeatureToggleService.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/services/FeatureToggleService.ts), [README.md:222-235](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L222-L235)).

### Config value
A typed key (string / number / boolean / json) used for runtime tunables like rate limits and URLs. Managed by `ConfigService` ([server/services/ConfigService.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/services/ConfigService.ts), [README.md:238-252](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L238-L252)).

### Scope (hierarchical resolution)
Lookup precedence used when resolving a feature or config: user override > application override > global default. Implemented by `ScopeResolver` ([server/services/ScopeResolver.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/services/ScopeResolver.ts), [README.md:196-220](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L196-L220)).

### Application
A consumer of Switchboard identified by an API key (bcrypt-hashed at rest). Each application can scope its own overrides and allowed CORS origins ([server/services/ApplicationService.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/services/ApplicationService.ts), [README.md:598-624](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L598-L624)).

### Rollout
Progressive enablement of a feature for a subset of users / apps. Evaluated by `RolloutEvaluator`; example strategies documented in `ROLLOUT_STRATEGIES_EXAMPLES.md` ([server/services/RolloutEvaluator.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/services/RolloutEvaluator.ts), [ROLLOUT_STRATEGIES_EXAMPLES.md](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/ROLLOUT_STRATEGIES_EXAMPLES.md)).

### Hybrid cache
The default caching strategy: in-memory `lru-cache` (L1, 1–5 ms) backed by Upstash Redis (L2, 20–30 ms) with DB fallback. Configurable via `CACHE_STRATEGY` env var: `hybrid` | `memory` | `upstash` | `none` ([server/services/cache/HybridCacheClient.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/services/cache/HybridCacheClient.ts), [CLAUDE.md:330-372](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L330-L372)).

### EventBus
Internal pub/sub layer that publishes mutation events (`feature.*`, `config.*`, `application.*`) to Redis and replays via SSE. Buffers the last 1000 events for reconnection ([server/services/EventBus.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/services/EventBus.ts), [CLAUDE.md:227-263](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L227-L263)).

### SSE stream
`GET /api/v1/realtime/events` — long-lived HTTP response that emits `UpdateEvent` records; clients use the `useRealtimeUpdates` React hook for auto-reconnect ([server/routes/realtime.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/routes/realtime.ts), [CLAUDE.md:265-303](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L265-L303)).

### Pay auth
Switchboard does not own user accounts; admin auth is proxied to `pay.jeffreykeyser.net` via `setupPayAuth` from `@jeffrey-keyser/pay-auth-integration` ([server/app.ts:48-88](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/app.ts#L48-L88), [README.md:598-610](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L598-L610)).

### API key (consumer auth)
Per-application secret prefixed `sw_live_...`, bcrypt-hashed in Postgres, validated by `apiKeyAuth` middleware on consumer endpoints ([server/middleware/apiKeyAuth.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/middleware/apiKeyAuth.ts), [README.md:42-52](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L42-L52)).

### Audit log
Immutable record of every mutation (who, what, when, before/after). Served at `/api/v1/audit-logs` ([server/dal/AuditLogDal.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/dal/AuditLogDal.ts), [README.md:626-635](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L626-L635)).

### DAL (BaseDal)
Data Access Layer base class that wraps `pg` with parameterized SQL helpers and a `withTransaction` method. All concrete DALs extend it ([server/dal/BaseDal.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/dal/BaseDal.ts), [CLAUDE.md:469-474](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L469-L474)).

### API versioning
URL-prefixed (`/api/v1/`) with `Accept-Version` header support and 301 legacy redirects from `/v1/*`. Middleware in `server/middleware/versioning.ts` ([server/middleware/versioning.ts](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/middleware/versioning.ts), [CLAUDE.md:147-186](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L147-L186)).
