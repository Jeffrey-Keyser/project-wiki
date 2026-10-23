---
title: "image-studio — Home"
description: "Overview of AI Image Studio: a React SPA and Express API that generate images through a server-side AI Proxy call, with Pay auth, PostgreSQL metadata and S3 storage."
---

# image-studio

AI Image Studio is a web app for generating AI images through the AI Proxy service. Users sign in with Pay auth and submit prompts to the backend, which calls AI Proxy server-side using a service key from Solo Vault. No API key is entered or stored in the browser ([README.md:L3](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/README.md#L3)).

## At a glance

- **Frontend:** React 19 and TypeScript with Redux Toolkit / RTK Query, built with Vite ([README.md:L13](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/README.md#L13)). The dev server uses port 3002 ([client/vite.config.js:L10](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/client/vite.config.js#L10)).
- **Backend:** Express 5 API that mounts `/auth`, `/health`, and `/api/v1` ([server/app.ts:L268-L272](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/app.ts#L268-L272), [server/app.ts:L233-L235](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/app.ts#L233-L235)).
- **Data:** PostgreSQL `image_studio` schema for sessions and metadata ([server/app.ts:L209-L213](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/app.ts#L209-L213)). Image bytes go to an S3 bucket, defaulting to `image-studio-jkeyser` ([server/config/env.ts:L136-L137](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/config/env.ts#L136-L137)).
- **Auth:** `@jeffrey-keyser/pay-auth-integration` is set up once with `setupPayAuth` ([server/app.ts:L64](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/app.ts#L64), [server/app.ts:L123](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/app.ts#L123)).
- **Deploy:** `deploy.sh` pulls, builds, restarts systemd services, and verifies the backend ([deploy.sh:L8-L39](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/deploy.sh#L8-L39)). The README documents a push-to-`main` webhook trigger ([README.md:L197](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/README.md#L197)), but that webhook is not in the source excerpts.

## Who uses it

- **Signed-in users** who generate, review, and save images in the SPA ([client/src/App.tsx:L14-L44](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/client/src/App.tsx#L14-L44)).
- **Reviewers** of service-imported batches under the staging routes ([server/routes/versions/v1/staging.ts:L30](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/versions/v1/staging.ts#L30)).
- **Non-browser callers.** `POST /api/v1/import` accepts a service token ([server/routes/versions/v1/import.ts:L103-L108](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/versions/v1/import.ts#L103-L108)), and the exploration service routes accept a named owner header ([server/routes/versions/v1/explorations.ts:L230-L238](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/versions/v1/explorations.ts#L230-L238)). Other callers are unknown from this repo.

## Main flow

1. The user signs in through Pay. The SPA gates routes on `usePayAuth` ([client/src/App.tsx:L15-L23](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/client/src/App.tsx#L15-L23)).
2. The SPA posts `prompt` and `model` to `POST /api/v1/generate`, which returns `202` with a `jobId` ([server/routes/versions/v1/generate.ts:L42-L57](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/versions/v1/generate.ts#L42-L57), [server/routes/versions/v1/generate.ts:L89-L95](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/versions/v1/generate.ts#L89-L95)).
3. The server fetches the AI Proxy key, submits the job, and polls in the background ([server/services/generationService.ts:L154-L163](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/generationService.ts#L154-L163), [server/services/generationService.ts:L216-L229](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/generationService.ts#L216-L229)).
4. A completed result is stored as a private asset. The owner can open it or save it into the library ([server/services/generationService.ts:L248-L250](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/generationService.ts#L248-L250), [server/routes/versions/v1/generate.ts:L15-L27](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/versions/v1/generate.ts#L15-L27)).
5. The client restores history from `/api/v1/images/generations` and in-flight jobs from `/api/v1/generate/jobs` ([client/src/services/historyService.ts:L10-L12](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/client/src/services/historyService.ts#L10-L12), [server/routes/versions/v1/generate.ts:L145-L153](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/versions/v1/generate.ts#L145-L153)).

Design explorations and storyboards are also present in source ([server/routes/versions/v1/index.ts:L49-L52](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/versions/v1/index.ts#L49-L52)). Their deployment state is unknown.

## Wiki pages

- [Architecture](../architecture/): components, contracts, and a component map.
- [Iteration Loop](../iteration-loop/): contributor workflow from edit to deploy.
- [Services and Dependencies](../services-and-dependencies/): what image-studio depends on and who calls it.
- [Operations](../operations/): commands, health checks, and runtime facts.
- [Glossary](../glossary/): project-specific terms.
