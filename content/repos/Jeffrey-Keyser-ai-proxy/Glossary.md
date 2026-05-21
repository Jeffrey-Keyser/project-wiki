---
title: Glossary
description: Repo-specific terms used in the AI Proxy codebase and docs.
---

# Glossary

**Application.** A named tenant holding an API key, daily request/token limits, and an allow-list of models. Created via `POST /v1/applications`; the plaintext API key is returned exactly once at creation ([README.md:166-189](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L166-L189), [server/dal/ApplicationDal.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/dal/ApplicationDal.ts)).

**Application API key.** A bearer credential of the form `app_live_*` that authorizes a client to call provider endpoints. Validated by the `applicationAuth` middleware, which resolves the key to an `Application` and attaches it to the request ([server/middleware/applicationAuth.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/middleware/applicationAuth.ts), [README.md:184-189](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L184-L189)).

**Service API key (`AI_PROXY_API_KEY`).** A coarse-grained shared secret enforced by `serviceApiKey` middleware on non-public routes — a perimeter check in addition to the per-application key ([server/middleware/serviceApiKey.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/middleware/serviceApiKey.ts), [server/app.ts:254-256](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L254-L256)).

**Pay auth.** JWT/session-based authentication proxied to the external Pay service at `https://pay.jeffreykeyser.net`. Configured by `setupPayAuth` with `authEndpoints` mapping to `/api/v1/auth/{ping,me,login,logout}` ([server/app.ts:60-99](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L60-L99)).

**Public routes.** Paths exempted from Pay auth: `/health`, `/ping`, `/`, `/api-docs`, `/v1/diagnostics`, plus all provider endpoints that use `applicationAuth` instead (`/v1/chat`, `/v1/chat/async`, `/v1/transcription`, `/v1/tts`, `/v1/image`) ([server/app.ts:72-86](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L72-L86)).

**Quota.** Daily request and token limits stored on each Application (`dailyRequestLimit`, `dailyTokenLimit`). Enforced before provider dispatch and surfaced via `GET /v1/applications/:id/quotas` ([README.md:175-180](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L175-L180), [server/middleware/rateLimit.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/middleware/rateLimit.ts)).

**Request log.** A row written for every billable request — request ID, application ID, model, tokens, latency, status. Source of usage aggregation. Managed by `RequestLogDal` and the `usageTracking` middleware ([server/dal/RequestLogDal.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/dal/RequestLogDal.ts), [server/middleware/usageTracking.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/middleware/usageTracking.ts)).

**Response cache.** An opt-in cache of provider responses keyed by request shape, skipped for empty or truncated outputs (commit `ac0bc07`) ([server/middleware/responseCache.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/middleware/responseCache.ts), [server/dal/ResponseCacheDal.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/dal/ResponseCacheDal.ts)).

**Async job.** A queued chat request submitted via `POST /v1/chat/async` and processed out-of-band by `worker.ts`, persisted through `AsyncJobDal`. Lets clients hand off long completions without holding an HTTP connection ([server/routes/chatAsync.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/routes/chatAsync.ts), [server/dal/AsyncJobDal.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/dal/AsyncJobDal.ts), [server/worker.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/worker.ts)).

**Correlation ID.** Per-request identifier set by the first middleware and propagated through logs to tie provider calls back to a client request ([server/middleware/correlationId.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/middleware/correlationId.ts), [server/app.ts:250-253](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L250-L253)).

**Word-level timestamps.** Whisper pass-through feature: when the client supplies `response_format=verbose_json` and `timestamp_granularities[]=word`, the transcription response includes a `words` array of `{word, start, end}` ([README.md:215-241](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L215-L241), [CHANGELOG.md:10-25](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/CHANGELOG.md#L10-L25)).

**Pay service.** The external authentication and user-profile service at `https://pay.jeffreykeyser.net` that this proxy depends on for admin auth. Configured via `PAY_SERVICE_URL` ([server/app.ts:60-66](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L60-L66), [CLAUDE.md:271](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/CLAUDE.md#L271)).
