---
title: image-studio — Home
description: AI image generation web app with Express backend, React SPA, Pay auth, S3 storage, and self-hosted Beelink deploy.
---

# image-studio

Web app for generating AI images via the AI Proxy. Backend handles Pay auth sessions and image/version persistence; the React client calls `api.ai-proxy.jeffreykeyser.net` directly with a user-supplied API key ([README.md:1-7](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L1-L7), [CLAUDE.md:7-11](https://github.com/Jeffrey-Keyser/image-studio/blob/main/CLAUDE.md#L7-L11)).

## At a glance

- Frontend: React 19 + Redux Toolkit + Vite, deployed at `images.jeffreykeyser.net` on port 3002 ([README.md:9-19](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L9-L19), [README.md:126-134](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L126-L134)).
- Backend: Express 5 + TypeScript + Sequelize, deployed at `images-api.jeffreykeyser.net` on port 3001/3030 ([README.md:14-15](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L14-L15), [deploy.sh:43-44](https://github.com/Jeffrey-Keyser/image-studio/blob/main/deploy.sh#L43-L44)).
- Storage: PostgreSQL (`image_studio` schema) for metadata + sessions; AWS S3 for image bytes ([README.md:99-122](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L99-L122)).
- Auth: `@jeffrey-keyser/pay-auth-integration` proxying `pay.jeffreykeyser.net` ([server/app.ts:64-119](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L64-L119)).
- Deploy: self-hosted Beelink, push-to-`main` → `beelink-deploy` webhook → `deploy.sh` → systemd restart ([README.md:124-153](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L124-L153)).
- Users: end users generating images via browser; reviewers triaging service-imported batches under `/api/v1/staging` ([README.md:88-97](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L88-L97)).

## How work moves through it

User signs in via Pay → drops AI Proxy key into client storage → composes prompt → client hits AI Proxy directly → resulting image POSTed back to backend for persistence (DB row + S3 object) → history retrievable via `/api/v1/images/generations` and reviewable via `/api/v1/staging/batches` ([CLAUDE.md:50-60](https://github.com/Jeffrey-Keyser/image-studio/blob/main/CLAUDE.md#L50-L60), [README.md:70-95](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L70-L95)).

## Wiki pages

- [Architecture](./architecture/) — module layout, components, Mermaid map.
- [Iteration Loop](./iteration-loop/) — change cycle from edit to merged deploy.
- [Services and Dependencies](./services-and-dependencies/) — inbound/outbound integrations.
- [Operations](./operations/) — deploy, systemd, health, on-call.
- [Glossary](./glossary/) — repo-specific terms.
