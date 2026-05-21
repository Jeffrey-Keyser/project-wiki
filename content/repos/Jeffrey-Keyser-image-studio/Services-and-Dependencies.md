---
title: image-studio — Services & Dependencies
description: External services, internal libraries, and the upstream/downstream surfaces image-studio touches.
---

# Services and Dependencies

## Depends on

### External services

- **Pay auth (`pay.jeffreykeyser.net`)** — session source of truth. Wired by `setupPayAuth({ payUrl, ... })` in the server bootstrap ([server/app.ts:84-119](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L84-L119), [CLAUDE.md:39-41](https://github.com/Jeffrey-Keyser/image-studio/blob/main/CLAUDE.md#L39-L41)).
- **AI Proxy (`api.ai-proxy.jeffreykeyser.net`)** — actual image generation. Called client-side with a user-held key; backend never proxies the key ([README.md:1-3](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L1-L3), [CLAUDE.md:44-48](https://github.com/Jeffrey-Keyser/image-studio/blob/main/CLAUDE.md#L44-L48)).
- **AWS S3 (`image-studio-jkeyser`, region `us-east-1`)** — image-byte storage via `@aws-sdk/client-s3` ([README.md:99-108](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L99-L108), [server/package.json:20](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/package.json#L20)).
- **PostgreSQL** — `image_studio` schema for sessions, metadata, versions, and generation history ([README.md:110-122](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L110-L122)).
- **Cloudflare Tunnel** — splits `images.jeffreykeyser.net` → `:3002` and `images-api.jeffreykeyser.net` → `:3001` ([README.md:128-134](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L128-L134), [CLAUDE.md:55-60](https://github.com/Jeffrey-Keyser/image-studio/blob/main/CLAUDE.md#L55-L60)).
- **GitHub Packages** — registry for `@jeffrey-keyser/*` scoped packages; install requires `GITHUB_TOKEN` ([AGENTS.md:21-27](https://github.com/Jeffrey-Keyser/image-studio/blob/main/AGENTS.md#L21-L27)).

### Internal libraries (`@jeffrey-keyser/*`)

- `pay-auth-integration` — pinned `^6.10.1`, single instance per app ([AGENTS.md:6-17](https://github.com/Jeffrey-Keyser/image-studio/blob/main/AGENTS.md#L6-L17), [server/package.json:28](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/package.json#L28), [client/package.json:8](https://github.com/Jeffrey-Keyser/image-studio/blob/main/client/package.json#L8)).
- `express-server-factory` — server bootstrap preset ([server/app.ts:1-12](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L1-L12), [server/package.json:24](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/package.json#L24)).
- `express-middleware-suite` — middleware bundle ([server/package.json:23](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/package.json#L23)).
- `database-base-config` — Postgres/Sequelize config helper ([CLAUDE.md:74-76](https://github.com/Jeffrey-Keyser/image-studio/blob/main/CLAUDE.md#L74-L76)).
- `api-errors` — shared `DomainError` hierarchy; bridged to ESF flavor in `app.ts` ([server/app.ts:147-168](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L147-L168)).
- `github-error-issues` — server-side error → GitHub issue middleware ([server/app.ts:301-303](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L301-L303)).
- `message-contracts`, `pay-api-types` — shared message and type contracts ([server/package.json:26-27](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/package.json#L26-L27)).
- `personal-ui-kit`, `redux-app-toolkit` — client UI + Redux scaffolding ([client/package.json:9-11](https://github.com/Jeffrey-Keyser/image-studio/blob/main/client/package.json#L9-L11)).
- `github-actions` — root dev-tooling dependency ([package.json:3](https://github.com/Jeffrey-Keyser/image-studio/blob/main/package.json#L3)).

### Notable third-party

Express 5, Sequelize sessions (`connect-session-sequelize`), Multer for uploads, Swagger UI + JSDoc, RTK Query, React Router 7, styled-components, Vitest ([server/package.json:19-72](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/package.json#L19-L72), [client/package.json:5-27](https://github.com/Jeffrey-Keyser/image-studio/blob/main/client/package.json#L5-L27)).

## Consumed by

- **End-user browsers** at `images.jeffreykeyser.net` — primary downstream surface ([README.md:5-7](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L5-L7)).
- **Service-to-service imports** (e.g. dev-inbox automation) via `POST /api/v1/import`, authenticated by `PAY_SERVICE_TOKEN` rather than Pay session ([server/app.ts:74-106](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L74-L106), [README.md:88-95](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L88-L95)).
- **Staging reviewers** consuming `GET /api/v1/staging/batches[/:groupKey/:groupValue]` to triage imported runs ([README.md:88-96](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L88-L96)).
- **`beelink-deploy` webhook + uptime monitors** polling `/api/v1/diagnostics/deploy` ([README.md:142-153](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L142-L153), [deploy.sh:42-65](https://github.com/Jeffrey-Keyser/image-studio/blob/main/deploy.sh#L42-L65)).
- **Skill consumers** — `skills/ai-image-generation.md` and `skills/ui-redesign-mockup.md` are machine-readable contracts other tools can pull from this repo ([CLAUDE.md:78-83](https://github.com/Jeffrey-Keyser/image-studio/blob/main/CLAUDE.md#L78-L83)).
