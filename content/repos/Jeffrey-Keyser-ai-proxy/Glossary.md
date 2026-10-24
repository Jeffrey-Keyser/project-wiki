---
title: "Glossary"
description: "Project-specific terms used in the AI Proxy codebase and docs, with source citations."
---

# Glossary

**Application.** A tenant record holding:
- a bcrypt hash of its API key
- a status of active, inactive or suspended
- daily request and token limits
- `allowed_models`
- metadata, including the batch opt-in fields described under *Batch allowance*

It is stored in the `applications` table ([server/dal/ApplicationDal.ts:L35-L40](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/dal/ApplicationDal.ts#L35-L40), [server/routes/applications.ts:L67-L69](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/routes/applications.ts#L67-L69)).

**Application API key.** A Bearer credential such as `app_live_…`, returned once when the application is created ([README.md:L203-L208](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/README.md#L203-L208)). `applicationAuth` checks it against stored hashes and rejects inactive applications ([server/middleware/applicationAuth.ts:L36-L61](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/middleware/applicationAuth.ts#L36-L61)). If the application's metadata sets `batch_only: true`, the key is limited to `/v1/batches` paths (`server/middleware/applicationAuth.ts`).

**Service API key (`AI_PROXY_API_KEY`).** A service-wide key, sent via `X-API-Key` or Bearer, that gates routes which are neither public nor application-authenticated ([server/middleware/serviceApiKey.ts:L31-L45](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/middleware/serviceApiKey.ts#L31-L45)).

**Application-auth route prefixes.** These paths are skipped by the service-key gate because they authenticate with application keys instead ([server/middleware/serviceApiKey.ts:L22-L29](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/middleware/serviceApiKey.ts#L22-L29)):
- `/v1/chat`
- `/v1/batches`
- `/v1/transcription`
- `/v1/image`
- `/v1/tts`
- `/v1/systemone`
- `/api/v1/usage`

**Pay auth / public routes.** Pay auth is JWT/session authentication proxied to the Pay service. `publicRoutes` lists the paths it skips ([server/app.ts:L75-L92](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/app.ts#L75-L92)).

**Quota / rate limit.** The daily request and token limits on an application. When either is exceeded the proxy returns `429 RATE_LIMIT_EXCEEDED`. Limits reset at midnight UTC ([server/middleware/rateLimit.ts:L94-L110](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/middleware/rateLimit.ts#L94-L110)).

**Managed model / model preference.** An Agency HQ setting named `api:<application UUID>:<operation>` that can replace the model in a request. Preferences never bypass an application's allowed models ([docs/model-controls.md:L5-L7](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/model-controls.md#L5-L7)).

**`X-Model-Source: request`.** A request header that keeps the caller's chosen model instead of the managed preference. `AI_PROXY_MODEL_SOURCE=request` does the same for the whole service ([docs/model-controls.md:L7](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/model-controls.md#L7)). `POST /v1/batches` requires this header, because batch items always carry explicit per-item models.

**Anthropic credit lane.** Claude traffic funded by the monthly API credit included with the Max plan. Every Claude request is priced and capped inside the proxy ([docs/anthropic-credit-lane.md:L3](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/anthropic-credit-lane.md#L3)).

**Credit cycle / budget guard.**
- A credit cycle runs from the most recent `cycleDay` at 00:00 UTC to the same day in the next month ([server/domain/services/AnthropicBudgetService.ts:L49-L57](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/domain/services/AnthropicBudgetService.ts#L49-L57)).
- Once spend reaches the cap, the guard returns `429 ANTHROPIC_BUDGET_EXHAUSTED`. Callers should fall back to another provider when they see that code ([docs/anthropic-credit-lane.md:L33-L35](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/anthropic-credit-lane.md#L33-L35)).
- Spend for the cap includes reserved amounts from unsettled batches, so the check is conservative. It is still not a provider-side hard guarantee for concurrent realtime traffic.

**`PROVIDER_CREDITS_EXHAUSTED`.** A `402` returned when Anthropic itself reports that the credit balance is too low ([server/infrastructure/providers/AnthropicClient.ts:L312-L320](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/infrastructure/providers/AnthropicClient.ts#L312-L320)).

**Message batch.** An application-owned Anthropic Message Batches job, submitted through `POST /v1/batches` and tracked locally by a UUID. It is persisted in `message_batches` with per-item rows in `message_batch_items` (`server/batch/service.ts`, `server/db/migrations/009_create_message_batches.sql`). Results are JSON and are scoped to the owning application.

**Batch allowance.** The per-application budget for batches, set in application metadata: `batch_enabled: true`, a positive `batch_budget_usd`, and a future `batch_budget_until` ISO timestamp. Polling accepted jobs continues after the allowance expires (`server/batch/service.ts`).

**Submission unknown.** The state of a batch whose provider submission timed out or hit a server error, so the provider may or may not have accepted it. Its reservation is kept. It must not be retried under a new key. Operators reconcile it using provider evidence (`server/batch/service.ts`, README).

**Request log (`llm_requests`) and `daily_usage_summary`.** Each tracked request inserts one log row and upserts a per-application, per-day, per-model summary ([server/dal/RequestLogDal.ts:L25-L28](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/dal/RequestLogDal.ts#L25-L28)). Cache hits are recorded with zero tokens ([server/middleware/usageTracking.ts:L57-L68](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/middleware/usageTracking.ts#L57-L68)). Batch rows are marked with `metadata.processing_mode = 'batch'` and store a discounted `cost_usd`.

**Response cache.** A cache of chat responses keyed by a SHA-256 hash.
- It is on by default; set `CACHE_ENABLED=false` to turn it off. The default TTL is 86400 seconds ([server/config/env.ts:L271-L272](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/config/env.ts#L271-L272)).
- Streaming requests, `temperature` above 0 and `top_p` below 1 skip the cache ([server/middleware/responseCache.ts:L40-L46](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/middleware/responseCache.ts#L40-L46)).
- Only complete responses are stored: non-empty content with `finish_reason` of `stop` ([server/middleware/responseCache.ts:L90-L102](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/middleware/responseCache.ts#L90-L102)).

**Async job / ticket.** A chat or image job stored in `async_jobs` and polled using its ticket ID ([server/routes/chatAsync.ts:L5-L11](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/routes/chatAsync.ts#L5-L11)). Cleanup deletes only completed or failed jobs that have expired ([server/dal/AsyncJobDal.ts:L198-L215](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/dal/AsyncJobDal.ts#L198-L215)). Message batches are a separate mechanism and are not handled by this cleanup.

**Correlation ID vs trace ID.** These are two different identifiers:
- The correlation ID appears in `X-Request-ID` and comes from the caller or a new UUID ([server/middleware/correlationId.ts:L23-L27](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/middleware/correlationId.ts#L23-L27)).
- The trace ID (`req_<uuid>`) is set by application auth and written to usage logs ([server/middleware/applicationAuth.ts:L63-L65](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/middleware/applicationAuth.ts#L63-L65)).

**Jev / System One.** TypeSafe's decision model, served at `POST /v1/systemone`. It answers `noul`, `choice` and `score` questions. If no model is given, `jev-latest` is used ([docs/TYPESAFE_SYSTEM_ONE.md:L3-L6](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/TYPESAFE_SYSTEM_ONE.md#L3-L6), [docs/TYPESAFE_SYSTEM_ONE.md:L59-L60](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/TYPESAFE_SYSTEM_ONE.md#L59-L60)).

**Agent Services.** An application record whose key Image Studio uses and which was granted access to Jev models ([docs/image-model-setup.md:L33-L35](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/image-model-setup.md#L33-L35), [docs/TYPESAFE_SYSTEM_ONE.md:L16](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/TYPESAFE_SYSTEM_ONE.md#L16)).

**Shared secrets file.** A secret file kept outside the repository and loaded without overriding values already set in the environment. The default path is `/etc/ai-proxy/secrets.env` ([server/config/env.ts:L26-L35](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/config/env.ts#L26-L35)).

**Word-level timestamps.** A Whisper option on transcription. Send `response_format=verbose_json` together with `timestamp_granularities[]=word` to get a `words` array in the response ([README.md:L236-L262](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/README.md#L236-L262)).

See [Home](../home/) and [Architecture](../architecture/).
