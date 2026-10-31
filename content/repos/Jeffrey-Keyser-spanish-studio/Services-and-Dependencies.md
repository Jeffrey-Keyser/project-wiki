---
title: "Spanish Studio Services and Dependencies"
description: "What spanish-studio depends on, and which callers are confirmed versus expected or unknown."
---

# Services and Dependencies

## Depends on

- **Ping database, `spanish` schema.** Shared with spanish-tutor; this repo owns only its listed migration stream ([README.md:143-151](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L143-L151)). Connection settings come from the database config ([env.ts:142-153](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/config/env.ts#L142-L153)).
- **spanish-tutor.** Its vocabulary and SM-2 tables are reached only through LearnerVocabularyPort ([README.md:153-171](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L153-L171)). Its vocabulary worker and schema are prerequisites for enrichment ([reading-workbench-operations.md:21-27](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/docs/reading-workbench-operations.md#L21-L27)).
- **Azure Speech.** Used for TTS and pronunciation assessment; credentials are configured outside the repo ([README.md:196-197](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L196-L197)). Region defaults to eastus ([env.ts:161](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/config/env.ts#L161)).
- **AI Proxy.** Provides scene generation, coach review, and Whisper transcription ([README.md:198-200](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L198-L200)). The base URL defaults in config ([env.ts:165](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/config/env.ts#L165)).
- **Struct.** Selected by `STRUCTURED_PROVIDER`, which defaults to struct ([env.ts:77-79](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/config/env.ts#L77-L79)). Its base URL defaults to a loopback address ([env.ts:205](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/config/env.ts#L205)).
- **Intonation sidecar.** Reached at a loopback URL; when unavailable, the Azure lanes still persist ([env.ts:58-62](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/config/env.ts#L58-L62), [env.ts:210-211](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/config/env.ts#L210-L211)).
- **RabbitMQ.** Required only when a Reading Tutor messaging flag is enabled ([env.ts:127-132](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/config/env.ts#L127-L132)).
- **Prompt registry.** Supplies named prompts; missing prompts produce an actionable 503 ([env.ts:92-93](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/config/env.ts#L92-L93), [reading-workbench-operations.md:12](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/docs/reading-workbench-operations.md#L12)).
- **Analytics Pulse, optional.** Telemetry is enabled only when both URL and API key are set ([analytics-pulse.ts:113-119](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/lib/analytics-pulse.ts#L113-L119)).
- **Pay auth.** The `/auth` and `/api/auth` proxy routes forward to Pay ([app.ts](https://github.com/Jeffrey-Keyser/spanish-studio/blob/7b92ef833dedd30b770cef4948a1869bd952777c/server/src/app.ts)). The server validates Pay access tokens against Pay `/auth/me` before accepting them ([api-key-auth.ts](https://github.com/Jeffrey-Keyser/spanish-studio/blob/7b92ef833dedd30b770cef4948a1869bd952777c/server/src/middleware/api-key-auth.ts)). The app no longer enables the factory's Pay auth provider. Access is governed by `SPANISH_STUDIO_ALLOWED_USERS`, which is empty by default, in which case the Pay admin role is required, and by `CORS_ORIGINS` ([env.ts](https://github.com/Jeffrey-Keyser/spanish-studio/blob/7b92ef833dedd30b770cef4948a1869bd952777c/server/src/config/env.ts)).
- **Shared Feedback Registry.** The browser-side `FeedbackWidget@1.0.0` posts feedback with app id `spanish-studio`. The default origin is `https://feedback.jeffreykeyser.net`, and `VITE_FEEDBACK_API_URL` overrides it. The server does not call this service ([feedbackConfig.ts](https://github.com/Jeffrey-Keyser/spanish-studio/blob/7b92ef833dedd30b770cef4948a1869bd952777c/client/src/feedback/feedbackConfig.ts), [SpanishStudioFeedback.tsx](https://github.com/Jeffrey-Keyser/spanish-studio/blob/7b92ef833dedd30b770cef4948a1869bd952777c/client/src/feedback/SpanishStudioFeedback.tsx), [.env.example](https://github.com/Jeffrey-Keyser/spanish-studio/blob/7b92ef833dedd30b770cef4948a1869bd952777c/client/.env.example)).

## Consumed by

Confirmed by source or config:

- **Client SPA.** The client calls the API through `/api` ([vite.config.ts:18-19](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/client/vite.config.ts#L18-L19), [api.ts:1](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/client/src/config/api.ts#L1)). It signs in through Pay at `/api/auth` and sends the signed-in user's Pay token. It does not hold the service key ([token.ts](https://github.com/Jeffrey-Keyser/spanish-studio/blob/7b92ef833dedd30b770cef4948a1869bd952777c/client/src/auth/token.ts)).
- **Node server, to the sidecar.** The sidecar documents the Node server as its caller ([app.py:6-7](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/intonation-sidecar/app.py#L6-L7)).
- **Public ingress.** A Cloudflare tunnel routes `/api/*` to the server and other paths to the client ([README.md:224-225](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L224-L225)). This is documented, not verified here.
- **Server-to-server callers with the service key.** The README documents this path for callers such as QA Patrol. The key is sent as `x-api-key` or Bearer ([README.md](https://github.com/Jeffrey-Keyser/spanish-studio/blob/7b92ef833dedd30b770cef4948a1869bd952777c/README.md), [api-key-auth.ts](https://github.com/Jeffrey-Keyser/spanish-studio/blob/7b92ef833dedd30b770cef4948a1869bd952777c/server/src/middleware/api-key-auth.ts)).

Documented but not confirmed in this repo:

- **spanish-tutor vocabulary worker** consumes seed-request queues ([reading-workbench-operations.md:42-45](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/docs/reading-workbench-operations.md#L42-L45)). Its source is not in the excerpts.

Expected or unknown:

- **QA Patrol registry** may store and schedule the workflow definition ([README.md:90-91](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L90-L91)). Whether one is registered is unknown.
- **Other API consumers** are unknown beyond the client.
- **Analytics Pulse consumers** are unknown; only the outbound event path is in source ([analytics-pulse.ts:23](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/lib/analytics-pulse.ts#L23)).
