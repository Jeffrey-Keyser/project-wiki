---
title: "AI Proxy — Overview"
description: "Unified gateway for AI/LLM providers with per-application API keys, quotas, model controls and usage tracking, self-hosted behind Cloudflare Tunnel."
---

# AI Proxy

AI Proxy is a TypeScript/Express service that gives internal applications one API in front of several AI providers. Each application gets its own API key, daily quotas and allowed-model list, and every request is tracked ([README.md:L3-L11](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/README.md#L3-L11)). The README says it "currently" supports OpenAI. The current config, however, also reads credentials for Google, Meta, OpenRouter, Anthropic, ElevenLabs and TypeSafe ([server/config/env.ts:L93-L112](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/config/env.ts#L93-L112)).

## At a glance

- **Server:** an Express 5 app assembled by `@jeffrey-keyser/express-server-factory`. It is built with `tsc` and started with `node ./dist/bin/www.js` ([server/package.json:L5-L9](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/package.json#L5-L9), [server/app.ts:L290-L295](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/app.ts#L290-L295)).
- **Hosting (documented):** a homelab Ubuntu server running a systemd **system** unit named `ai-proxy`, with public ingress through Cloudflare Tunnel. The AWS Lambda material is legacy reference only ([CLAUDE.md:L158](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/CLAUDE.md#L158), [CLAUDE.md:L181](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/CLAUDE.md#L181), [CLAUDE.md:L187](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/CLAUDE.md#L187)). The README's "deployed on AWS" section is outdated ([README.md:L171-L179](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/README.md#L171-L179)).
- **Port:** the code defaults to `3001` ([server/config/env.ts:L134](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/config/env.ts#L134)). CLAUDE.md documents `3005` in production ([CLAUDE.md:L179](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/CLAUDE.md#L179)). The live value has not been verified here.
- **Three authentication lanes:**
  - Pay-service JWT for `/v1/applications` ([server/routes/applications.ts:L97](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/routes/applications.ts#L97)).
  - Per-application keys for chat, transcription, image, TTS and System One routes.
  - A service-wide `AI_PROXY_API_KEY` for everything else that is not public ([server/middleware/serviceApiKey.ts:L22-L29](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/middleware/serviceApiKey.ts#L22-L29), [server/middleware/serviceApiKey.ts:L46-L76](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/middleware/serviceApiKey.ts#L46-L76)).
- **Storage:** a local PostgreSQL instance holds applications, request logs, async jobs, the response cache and sessions ([docs/deployment.md:L9](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/deployment.md#L9)).

## Who uses it

Source comments name several callers:

- **Life and image-studio** are named as legitimate application-key callers ([server/middleware/serviceApiKey.ts:L14-L17](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/middleware/serviceApiKey.ts#L14-L17)).
- **Image Studio** uses the Agent Services application key ([docs/image-model-setup.md:L33-L35](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/docs/image-model-setup.md#L33-L35)).
- **dev-inbox failover and Agency HQ** read the Claude budget on the host ([server/routes/anthropicBudget.ts:L5-L8](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/routes/anthropicBudget.ts#L5-L8)).

Administrators manage applications through Pay-authenticated endpoints ([README.md:L32-L38](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/README.md#L32-L38)). See [Services and Dependencies](../services-and-dependencies/) for which callers are confirmed and which are unknown.

## Main flow

1. An admin creates an application. The response includes the plaintext `app_live_…` key, which is shown only once ([README.md:L189-L208](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/README.md#L189-L208)).
2. A client calls an endpoint such as `POST /v1/chat` with that key as a Bearer token ([README.md:L211-L223](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/README.md#L211-L223)).
3. The request passes through middleware in this order before the controller calls the provider ([server/routes/chat.ts:L351-L360](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/routes/chat.ts#L351-L360)):
   - application authentication
   - rate limiting
   - managed-model resolution
   - Claude budget guard
   - response cache
   - usage tracking
4. Usage is written to `llm_requests` and `daily_usage_summary` after the response is sent ([server/dal/RequestLogDal.ts:L25-L28](https://github.com/Jeffrey-Keyser/ai-proxy/blob/bdbfe33bbacd4b9ca75b10e845c2ed11fc3f79df/server/dal/RequestLogDal.ts#L25-L28)).

## Wiki pages

- [Architecture](../architecture/): components, middleware order and contracts.
- [Iteration Loop](../iteration-loop/): local development, tests and the deploy script.
- [Services and Dependencies](../services-and-dependencies/): upstream providers and known callers.
- [Operations](../operations/): starting, deploying, health checks and logs.
- [Glossary](../glossary/): project-specific terms.
