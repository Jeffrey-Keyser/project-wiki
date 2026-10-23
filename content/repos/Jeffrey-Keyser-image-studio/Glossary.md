---
title: "image-studio — Glossary"
description: "Project-specific terms used in image-studio code, deploys and docs, each tied to the source that defines it."
---

# Glossary

**AI Proxy.** Upstream service for image generation and text chat. The server calls it with a key from Solo Vault ([server/services/generationService.ts:L163](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/generationService.ts#L163), [server/services/explorationAgent.ts:L40](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/explorationAgent.ts#L40)).

**Solo Vault.** Secret store that supplies the AI Proxy key. The key is cached in memory and must start with `app_live_` ([server/services/soloVault.ts:L3](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/soloVault.ts#L3), [server/services/soloVault.ts:L43-L45](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/soloVault.ts#L43-L45)).

**Pay auth.** Session and identity provider integrated through `@jeffrey-keyser/pay-auth-integration`. AGENTS.md requires exactly one `PayAuth` instance per app ([server/app.ts:L64](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/app.ts#L64), [AGENTS.md:L17](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/AGENTS.md#L17)).

**Generation job.** An async server-side image request with states `pending`, `processing`, `completed`, and `failed`. Clients poll it through `/api/v1/generate` ([README.md:L91](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/README.md#L91), [server/routes/versions/v1/generate.ts:L42](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/versions/v1/generate.ts#L42)).

**Generation asset reference.** Storage pointer for a result. An `s3:` prefix marks an S3 object key. Data URLs are also accepted ([server/services/generationAssets.ts:L12-L13](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/generationAssets.ts#L12-L13), [server/services/generationAssets.ts:L24-L27](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/generationAssets.ts#L24-L27)).

**Image and version.** An image is a library asset. It has numbered versions, each with its own S3 object ([server/services/imagesService.ts:L55-L57](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/imagesService.ts#L55-L57), [server/routes/versions/v1/images.ts:L239-L286](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/versions/v1/images.ts#L239-L286)).

**Service import.** Service-authenticated ingest at `POST /api/v1/import`. It is excluded from Pay session auth and guarded by the service token ([server/app.ts:L103-L105](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/app.ts#L103-L105), [server/middleware/serviceAuth.ts:L12-L23](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/middleware/serviceAuth.ts#L12-L23)).

**Staging batch.** Imports grouped by `runId` or `taskId`, under the reserved `dev-inbox` app ID ([server/routes/versions/v1/staging.ts:L7-L13](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/versions/v1/staging.ts#L7-L13), [server/services/imagesService.ts:L13-L16](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/imagesService.ts#L13-L16)).

**Idempotency-Key.** Request header used by imports, explorations and storyboards to make repeated writes return the same result ([server/routes/versions/v1/import.ts:L185](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/versions/v1/import.ts#L185), [server/services/explorationsService.ts:L61-L68](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/explorationsService.ts#L61-L68)).

**Exploration.** A saved design workspace with a brief, rounds, candidates, feedback and an optional preferred direction ([README.md:L248-L252](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/README.md#L248-L252), [server/services/explorationsService.ts:L138-L141](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/explorationsService.ts#L138-L141)).

**Brief.** Four text fields: concept, feeling, constraints and style recipe ([server/services/explorationContract.ts:L53-L58](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/explorationContract.ts#L53-L58)).

**Round and candidate.** A round holds 1–10 candidate plans. A candidate becomes a generation job and then an image version ([server/services/explorationContract.ts:L113-L115](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/explorationContract.ts#L113-L115), [server/services/explorationWorker.ts:L58-L67](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/explorationWorker.ts#L58-L67)).

**Playground token.** A CSS custom property used in HTML prototype controls, limited to color, font or spacing kinds ([server/services/explorationContract.ts:L201-L206](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/explorationContract.ts#L201-L206)).

**Storyboard.** A versioned journey manifest with schema `storyboard/v1`. It must have reachable states and HTTPS application URLs ([server/services/storyboardManifest.ts:L27-L39](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/storyboardManifest.ts#L27-L39), [server/services/storyboardManifest.ts:L76](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/storyboardManifest.ts#L76)).

**Exploration assistant.** Tool-using agent with at most six tool calls. It reads curated guidance from `skills/exploration-assistant/SKILL.md` ([server/services/explorationAssistant.ts:L29](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/explorationAssistant.ts#L29), [server/services/explorationAssistant.ts:L79-L85](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/explorationAssistant.ts#L79-L85)).

**NanoClaw.** Local message gateway. The server posts debounced import notices to it when `NANOCLAW_NOTIFY_ENABLED` is true ([server/config/env.ts:L51-L52](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/config/env.ts#L51-L52), [server/services/importNotifier.ts:L4-L16](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/importNotifier.ts#L4-L16)).

**Error catalog.** Stable error codes mapped to HTTP status and default messages, sent through `sendError` ([server/routes/errorCatalog.ts:L21-L23](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/errorCatalog.ts#L21-L23), [server/routes/errorCatalog.ts:L73-L80](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/errorCatalog.ts#L73-L80)).

**`build-info.json`.** File written by `deploy.sh` with `buildSha` and `builtAt`. The deploy endpoint reads it ([deploy.sh:L24-L26](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/deploy.sh#L24-L26), [server/routes/diagnostics.ts:L20-L25](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/diagnostics.ts#L20-L25)).

**`imports.status`.** Field on the deploy endpoint. It is `ready` when the service token is configured and `not_configured` otherwise. It is a warning, not a failure ([server/routes/diagnostics.ts:L226-L230](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/diagnostics.ts#L226-L230), [deploy.sh:L61-L63](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/deploy.sh#L61-L63)).

**Split hostname model.** The frontend and API use separate hostnames. The SPA cannot reach `/api` on its own host ([README.md:L201-L205](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/README.md#L201-L205)).

**`bridgeDomainErrors`.** Middleware that converts api-errors `DomainError` instances into express-server-factory errors ([server/app.ts:L157-L158](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/app.ts#L157-L158)).

**agents verify.** The fenced block in AGENTS.md that a postflight tool extracts and runs ([AGENTS.md:L33-L36](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/AGENTS.md#L33-L36)).

**beelink-deploy.** Webhook service on the Beelink host that runs `deploy.sh` after a push to `main`, as documented ([README.md:L197](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/README.md#L197)).
