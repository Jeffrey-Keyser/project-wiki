---
title: image-studio — Glossary
description: Repo-specific terminology used in code, deploys, and docs.
---

# Glossary

**AI Proxy.** Upstream image-generation service at `api.ai-proxy.jeffreykeyser.net`. Called directly from the browser using a user-supplied API key; the backend never sees the key ([README.md:1-3](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L1-L3), [CLAUDE.md:44-48](https://github.com/Jeffrey-Keyser/image-studio/blob/main/CLAUDE.md#L44-L48)).

**Pay auth.** Session-and-identity service at `pay.jeffreykeyser.net`, integrated via `@jeffrey-keyser/pay-auth-integration`. Single `PayAuth` instance per app is enforced by AGENTS.md ([server/app.ts:84-119](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L84-L119), [AGENTS.md:17](https://github.com/Jeffrey-Keyser/image-studio/blob/main/AGENTS.md#L17)).

**`image_studio` schema.** Postgres schema housing all image-studio tables, including `user_sessions` used by the session store ([server/app.ts:204-208](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L204-L208), [CLAUDE.md:24-27](https://github.com/Jeffrey-Keyser/image-studio/blob/main/CLAUDE.md#L24-L27)).

**Generation.** A prompt-and-result history record persisted via `/api/v1/images/generations`, distinct from a stored `image`. Lives in `generationService.ts` ([README.md:70-77](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L70-L77)).

**Image / Version.** An `image` is a logical asset with one or more `versions`; each version has its own S3 object reachable via `/images/:id/versions/:version/file`. Owned by `imagesService.ts` + `s3.ts` ([README.md:56-68](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L56-L68)).

**Staging batch.** Provenance group of service-imported images sharing a `runId` or `taskId`. Reviewed via `/api/v1/staging/batches[/:groupKey/:groupValue]` ([README.md:88-96](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L88-L96), [CLAUDE.md:53-54](https://github.com/Jeffrey-Keyser/image-studio/blob/main/CLAUDE.md#L53-L54)).

**Service import.** Service-to-service ingestion path at `POST /api/v1/import`, authenticated by `PAY_SERVICE_TOKEN` instead of a Pay session; bypasses Pay session auth via the `publicRoutes` list ([server/app.ts:101-106](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L101-L106)).

**`build-info.json`.** Deterministic release identifier written into `server/dist/` by `deploy.sh`, containing `buildSha` and `builtAt`. Returned by `/api/v1/diagnostics/deploy` and compared against `HEAD` to gate deploys ([deploy.sh:9-32](https://github.com/Jeffrey-Keyser/image-studio/blob/main/deploy.sh#L9-L32)).

**`/api/v1/diagnostics/deploy`.** Lightweight deploy-verification endpoint: DB ping + build SHA + import-readiness flag. Public-routed so `deploy.sh` can hit it without a Pay session ([server/app.ts:95-99](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L95-L99), [README.md:142-153](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L142-L153)).

**Split hostname model.** `images.jeffreykeyser.net` serves only the SPA; `images-api.jeffreykeyser.net` serves only the API. No same-origin `/api/*` proxy exists — `VITE_API_URL` must point at the API host ([README.md:130-134](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L130-L134)).

**Error bridge (`bridgeDomainErrors`).** Middleware that re-wraps `@jeffrey-keyser/api-errors` `DomainError` instances as the `express-server-factory` flavor so ESF's `HttpErrorMapper` `instanceof` checks succeed instead of mapping to 500 ([server/app.ts:147-168](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L147-L168)).

**agents:verify.** Machine-extractable bash block in AGENTS.md that postflight tooling runs in each worker's worktree to confirm pay-auth pin, absence of private subpath imports, single `PayAuth` instance, and green build+test ([AGENTS.md:30-53](https://github.com/Jeffrey-Keyser/image-studio/blob/main/AGENTS.md#L30-L53)).

**`beelink-deploy`.** Webhook service on the Beelink homelab that runs `deploy.sh` on push-to-`main` ([README.md:124-127](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L124-L127), [CLAUDE.md:62-64](https://github.com/Jeffrey-Keyser/image-studio/blob/main/CLAUDE.md#L62-L64)).
