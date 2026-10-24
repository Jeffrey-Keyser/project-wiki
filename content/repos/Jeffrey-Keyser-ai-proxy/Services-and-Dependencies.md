---
title: "Services and Dependencies"
description: "Upstream providers, infrastructure and packages AI Proxy depends on, and the callers named in source versus unknown or proposed consumers."
---

# Services and Dependencies

Having source code for an integration does not mean it is configured in production. Many provider keys default to an empty string when unset ([server/config/env.ts:L253-L269](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/config/env.ts#L253-L269)).

## Depends on

### Infrastructure

- **PostgreSQL.** Stores applications, async jobs, the response cache, request logs, daily summaries and durable message batches (`message_batches`, `message_batch_items`). Batch rows are added by migration `009_create_message_batches.sql`. ([server/dal/ApplicationDal.ts:L35-L40](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/dal/ApplicationDal.ts#L35-L40), [server/dal/RequestLogDal.ts:L37-L42](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/dal/RequestLogDal.ts#L37-L42)). It also holds sessions in `public.user_sessions` ([server/app.ts:L143-L153](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/app.ts#L143-L153)).
- **Pay service.** Handles JWT/session authentication. The URL defaults to `https://pay.jeffreykeyser.net` ([server/app.ts:L63-L74](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/app.ts#L63-L74)).
- **Cloudflare Tunnel.** Provides public ingress. Its configuration lives outside this repository ([docs/deployment.md:L130-L134](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/deployment.md#L130-L134)).
- **Agency HQ dispatch registry (optional).** Read on each request for per-application model preferences.
  - Default address: `http://127.0.0.1:3040`.
  - Timeout: 1.5 seconds.
  - If the registry is unreachable, the model named in the request is kept ([docs/model-controls.md:L5](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/model-controls.md#L5)).

### AI providers

| Provider | What it is used for | Status in the provided source |
|---|---|---|
| OpenAI | Chat and Whisper transcription | Key is required and must start with `sk-` ([server/config/env.ts:L317-L321](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/config/env.ts#L317-L321)) |
| Anthropic | Claude chat, and the Message Batches API for application batches | Budgeted credit lane ([docs/anthropic-credit-lane.md:L3](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/anthropic-credit-lane.md#L3)). Batch submission uses `server/batch/provider.ts` with SDK retries disabled. The batch path is documented in the README and was not verified against the live provider. |
| Google Gemini | Image generation | Listed in the README ([README.md:L84-L85](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/README.md#L84-L85)) |
| Meta Model API, OpenRouter | `muse-image-1.0`, `mai-image-2.6` | Rollout steps are documented, but completion is not recorded ([docs/image-model-setup.md:L30-L37](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/image-model-setup.md#L30-L37)) |
| ElevenLabs | TTS streaming | Default voice and model are set in the route ([server/routes/textToSpeech.ts:L29-L37](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/routes/textToSpeech.ts#L29-L37)) |
| TypeSafe | Jev decisions via `/v1/systemone` | Reported verified in a dated document ([docs/TYPESAFE_SYSTEM_ONE.md:L10-L16](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/TYPESAFE_SYSTEM_ONE.md#L10-L16)) |

### Packages

The server depends on these first-party packages ([server/package.json:L18-L23](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/package.json#L18-L23)):
- `@jeffrey-keyser/express-server-factory` ^2.0.1
- `@jeffrey-keyser/pay-auth-integration` 6.10.2 (exact pin; previously `^6.10.1`)
- `@jeffrey-keyser/database-base-config`
- `@jeffrey-keyser/api-errors`
- `@jeffrey-keyser/github-error-issues`
- `@jeffrey-keyser/pay-api-types`

It also uses `openai`, `@anthropic-ai/sdk` and the OpenTelemetry SDK and exporter packages ([server/package.json:L17](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/package.json#L17), [server/package.json:L24-L27](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/package.json#L24-L27), [server/package.json:L42](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/package.json#L42)). Where traces are exported is unknown.

For the auth package, see the cross-repo wiki: [Jeffrey-Keyser-pay-auth-integration](/repos/jeffrey-keyser-pay-auth-integration/home/).

## Consumed by

### Callers named in source

These are named in code comments or docs. None of them was observed at runtime for this page.

- **Life and image-studio** are described as application-key callers ([server/middleware/serviceApiKey.ts:L14-L17](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/middleware/serviceApiKey.ts#L14-L17)).
- **Image Studio** uses the proxy's model IDs and the Agent Services key ([docs/image-model-setup.md:L3-L6](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/image-model-setup.md#L3-L6), [docs/image-model-setup.md:L33-L35](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/image-model-setup.md#L33-L35)).
- **Agent Services** made the recorded `/v1/systemone` verification calls ([docs/TYPESAFE_SYSTEM_ONE.md:L28-L30](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/TYPESAFE_SYSTEM_ONE.md#L28-L30)).
- **dev-inbox failover and Agency HQ** read `/internal/anthropic-budget` from loopback ([server/routes/anthropicBudget.ts:L5-L12](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/routes/anthropicBudget.ts#L5-L12)).
- **Agency HQ's Models page** uses `/internal/model-consumers` ([docs/model-controls.md:L3](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/model-controls.md#L3), [docs/model-controls.md:L9](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/model-controls.md#L9)).
- **Batch consumers** call `POST /v1/batches` with an application key that has `batch_enabled` set. The README names the wiki-refresh style payload as an example. No consumer is confirmed in source.

### Unknown or expected

- **Other applications.** Any other application holding a key is unknown. The full list of applications lives in the database, not in source.
- **The `/api/v1/usage` aggregation endpoint.**
  - `app.ts` marks it public with the comment "no auth required" ([server/app.ts:L91](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/app.ts#L91)).
  - The service-key gate treats it as an application-auth route instead ([server/middleware/serviceApiKey.ts:L28](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/middleware/serviceApiKey.ts#L28)).
  - The route file was not provided, so both its consumers and its auth behaviour are unknown. Its cost totals now separate batch spend from realtime token pricing (`server/routes/usageAggregation.ts`).
- **Proposed Jev consumers.** The queue manager, Feedback Registry, Logos, Agency HQ admission and Pantry are listed as proposals, not implemented integrations ([docs/TYPESAFE_SYSTEM_ONE.md:L72-L80](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/TYPESAFE_SYSTEM_ONE.md#L72-L80)).

See [Architecture](../architecture/) for how calls flow through the proxy.
