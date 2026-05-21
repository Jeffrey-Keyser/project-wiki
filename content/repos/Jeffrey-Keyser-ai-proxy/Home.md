---
title: AI Proxy — Overview
description: Unified API gateway for AI/LLM providers (OpenAI, Anthropic, Google Gemini) with per-application API keys, quotas, and usage tracking.
---

# AI Proxy

AI Proxy is a Node/Express service that fronts third-party AI providers behind a single API surface. Each consuming application gets its own API key, daily request/token quotas, and an allow-list of models, while the proxy records per-request usage and latency ([README.md:3-12](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L3-L12)).

## At a glance

- TypeScript Express 5 server compiled with `tsc` and started via `node ./dist/bin/www.js` ([server/package.json:6-9](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/package.json#L6-L9)).
- Listens on port `3001` behind Cloudflare Tunnel at `ai-proxy.jeffreykeyser.net` ([CLAUDE.md:171-178](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/CLAUDE.md#L171-L178)).
- Two auth lanes: Pay-service JWT/session for `/v1/applications`, application API keys for `/v1/chat`, `/v1/transcription`, `/v1/tts`, `/v1/image` ([server/app.ts:72-86](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L72-L86)).
- Provider SDKs: `openai`, `@anthropic-ai/sdk`, plus Gemini via REST for image generation ([server/package.json:17-38](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/package.json#L17-L38)).
- PostgreSQL session + data store; sessions backed by `connect-pg-simple` via the database-base-config package ([server/app.ts:137-157](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L137-L157)).
- Self-hosted on a Beelink homelab as a systemd user unit `ai-proxy`; legacy AWS Lambda/ECR/Terraform paths remain in the repo as reference only ([CLAUDE.md:159-185](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/CLAUDE.md#L159-L185)).

## Who uses it

End-user-facing apps under the `jeffreykeyser.net` umbrella call `https://api.ai-proxy.jeffreykeyser.net` with an issued `app_live_*` key to reach chat, transcription, TTS, and image-generation endpoints without holding direct provider credentials ([README.md:160-261](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L160-L261)). Application lifecycle (create/update/delete, quota changes) is performed by an admin authenticated against the Pay service ([README.md:32-39](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L32-L39)).

## How work moves through it

1. Admin signs in via Pay and creates an application — server returns the plaintext API key once ([README.md:166-189](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L166-L189)).
2. Client sends a request with the API key; `applicationAuth` middleware resolves the application and attaches it to the request ([server/middleware/applicationAuth.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/middleware/applicationAuth.ts)).
3. Rate limit, quota, and (where applicable) response-cache middleware run before the controller dispatches to a provider SDK ([server/middleware/rateLimit.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/middleware/rateLimit.ts), [server/middleware/responseCache.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/middleware/responseCache.ts)).
4. After response, `usageTracking` writes a row through `RequestLogDal` for billing/quota aggregation ([server/middleware/usageTracking.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/middleware/usageTracking.ts), [server/dal/RequestLogDal.ts](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/dal/RequestLogDal.ts)).

## Wiki pages

- [Architecture](./architecture/) — module layout and request flow.
- [Iteration Loop](./iteration-loop/) — how a change reaches `main`.
- [Services and Dependencies](./services-and-dependencies/) — inbound/outbound integrations.
- [Operations](./operations/) — deploy, runtime, logs, health.
- [Glossary](./glossary/) — repo-specific terms.
