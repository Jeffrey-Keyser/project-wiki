---
title: Services and Dependencies
description: Inbound and outbound integrations — what AI Proxy depends on and what depends on it.
---

# Services and Dependencies

## Depends on

### External services
- **Pay service** at `https://pay.jeffreykeyser.net` — issues JWT/session for admin auth on `/v1/applications` and `/auth/*`. Configured via `PAY_SERVICE_URL` ([server/app.ts:60-66](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L60-L66), [README.md:128-129](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L128-L129)).
- **OpenAI API** — chat completion across GPT-5/4/o-series models and Whisper transcription. Requires `OPENAI_API_KEY` starting with `sk-` ([README.md:62-83](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L62-L83), [CLAUDE.md:316-318](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/CLAUDE.md#L316-L318)).
- **Anthropic API** — `@anthropic-ai/sdk` serves Claude models through chat endpoints, including `claude-haiku-5-5`, `claude-sonnet-5-5`, and `claude-opus-5-5`. Spend is capped by the monthly credit budget guard described in [Operations](./operations/) ([server/package.json:17](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/package.json#L17), [server/infrastructure/providers/AnthropicClient.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/infrastructure/providers/AnthropicClient.ts), [server/domain/services/AnthropicBudgetService.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/domain/services/AnthropicBudgetService.ts)).
- **Google Gemini** — image generation via `gemini-3.1-flash-image-preview`, requires `GOOGLE_API_KEY` ([README.md:85-86](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L85-L86), [README.md:125-126](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L125-L126)).
- **ElevenLabs** — TTS streaming on `/v1/tts` (added in commit `f02b5e1`) ([server/routes/textToSpeech.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/routes/textToSpeech.ts)).
- **PostgreSQL** — application store, request logs, async jobs, response cache, and Express sessions ([server/app.ts:142-148](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L142-L148)).
- **Cloudflare Tunnel** — public ingress to the homelab; tunnel config sets `connectTimeout` and `keepAliveTimeout` to 120s for image generation ([README.md:284-292](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L284-L292)).

### First-party npm packages
- `@jeffrey-keyser/express-server-factory` — composes the Express app from `ServerConfig` ([server/app.ts:3-7](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L3-L7)).
- `@jeffrey-keyser/pay-auth-integration` v5 — Pay JWT/session middleware and routes ([server/app.ts:48](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L48), [server/package.json:23](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/package.json#L23)).
- `@jeffrey-keyser/database-base-config` — pg pool, session table, BaseDal pattern ([CLAUDE.md:282-285](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/CLAUDE.md#L282-L285)).
- `@jeffrey-keyser/api-errors` — typed HTTP error classes ([server/package.json:18](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/package.json#L18)).
- `@jeffrey-keyser/github-error-issues` — auto-files GitHub issues from uncaught errors ([server/app.ts:25](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L25), [server/app.ts:272-274](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L272-L274)).
- `@jeffrey-keyser/pay-api-types` — shared User/Session TS types from the Pay ecosystem ([server/package.json:22](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/package.json#L22)).

### Third-party libraries
- `express` 5, `express-session`, `cookie-parser`, `cors`, `morgan`, `body-parser` ([server/package.json:27-37](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/package.json#L27-L37)).
- `multer` for multipart uploads (transcription) ([server/package.json:37](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/package.json#L37)).
- `zod` for request validation, `express-validator` legacy ([server/package.json:42](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/package.json#L42)).
- `swagger-jsdoc` + `swagger-ui-express` for `/api-docs` ([server/app.ts:175-195](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L175-L195)).

## Consumed by

- **Client apps in the `jeffreykeyser.net` ecosystem** — they call `https://api.ai-proxy.jeffreykeyser.net` with an `app_live_*` API key for chat, transcription, TTS, and image generation ([README.md:160-261](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L160-L261)).
- **Admin/console UI** — uses Pay-issued JWT to manage applications and quotas via `/v1/applications` ([README.md:32-39](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L32-L39)).
- **Usage aggregation consumers** — `/api/v1/usage` is mounted as a no-auth aggregated endpoint for dashboards ([server/app.ts:85-86](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L85-L86), [server/app.ts:209](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L209)).
- **Loopback callers** — `GET /internal/anthropic-budget` reports Anthropic credit-cycle spend status to requests originating from localhost ([server/routes/anthropicBudget.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/routes/anthropicBudget.ts)).
- **Cross-repo wiki:** see also [Jeffrey-Keyser-pay-auth-integration](https://wiki.jeffreykeyser.net/repos/Jeffrey-Keyser-pay-auth-integration/) for the auth package wired in by `setupPayAuth` ([server/app.ts:48](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L48)).
