---
title: "Life Wiki Home"
description: "Overview of the Life voice-first journal monorepo: what it does, who uses it, and how a spoken entry becomes a saved, linked record."
---

# Life

Life is a voice-first personal journal. You speak; Life transcribes, structures, and links the entry. The home page has no typing path, and it does not accept pasted or imported text ([README.md:5-7](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/README.md#L5-L7), [README.md:14](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/README.md#L14)).

## At a glance

- **Two workspaces**: a React 19 and Vite client, and an Express 5 and TypeScript server backed by PostgreSQL ([README.md:30-31](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/README.md#L30-L31), [package.json:5-8](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/package.json#L5-L8)).
- **Voice pipeline**: the browser records WebM/Opus, then the server transcribes, structures, resolves ambiguities, and saves ([README.md:18-22](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/README.md#L18-L22)).
- **AI access**: transcription and chat calls go through `server/services/aiProxy.ts`, not directly to OpenAI ([server/services/aiProxy.ts:119](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/services/aiProxy.ts#L119), [README.md:85](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/README.md#L85)).
- **Separate analysis service**: synopses, edge explanations, and insights call a Struct service configured by `STRUCT_URL` ([server/config/env.ts:133-134](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/config/env.ts#L133-L134), [server/services/edges.service.ts:38](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/services/edges.service.ts#L38)).
- **Auth**: Pay SSO middleware guards journal routes ([server/routes/journals/index.ts:16](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/routes/journals/index.ts#L16), [README.md:89](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/README.md#L89)).
- **Production**: documented as self-hosted, behind Cloudflare Tunnel, managed by systemd ([docs/DEPLOYMENT.md:5-12](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/docs/DEPLOYMENT.md#L5-L12)).

## Who uses it

- **Signed-in Pay users.** On first resolution Life creates a local user and a default journal ([server/services/userResolution.ts:36-48](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/services/userResolution.ts#L36-L48)).
- **Guests.** The server exposes a public guest-creation route that calls Pay and provisions a local user ([server/routes/users.ts:102-107](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/routes/users.ts#L102-L107)).
- **Share-token readers.** Owners create tokens under the journal share routes. Holders of a valid token can call unauthenticated public query endpoints ([server/routes/share.routes.ts:14-16](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/routes/share.routes.ts#L14-L16), [server/routes/public.routes.ts:14-18](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/routes/public.routes.ts#L14-L18)).

## Main flow

1. **Speak.** The client records audio and calls the transcribe route ([server/routes/voiceEntry.ts:82-87](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/routes/voiceEntry.ts#L82-L87)).
2. **Structure.** The structure route returns people, tags, title, and ambiguities ([server/routes/voiceEntry.ts:236-241](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/routes/voiceEntry.ts#L236-L241)).
3. **Resolve.** The user confirms uncertain matches; the resolve route is called repeatedly ([server/routes/voiceEntry.ts:310-317](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/routes/voiceEntry.ts#L310-L317)).
4. **Save.** Saving recalculates edges to related entries ([docs/time-tags-era-cloud-design.md:13](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/docs/time-tags-era-cloud-design.md#L13)).
5. **Explore.** Routes exist for person and tag views, and for the debug dashboard behind auth ([client/src/Router.tsx:17-27](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/client/src/Router.tsx#L17-L27)). The Person View proposal reports slices 1 to 4 shipped ([docs/person-view-proposal.md:3](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/docs/person-view-proposal.md#L3)).

Amendments are modeled as child entries. The service attaches an addendum to a parent entry ([server/services/entries.service.ts:96-106](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/services/entries.service.ts#L96-L106)). Its HTTP route is not in the attached excerpts, so it is unknown here.

## Wiki pages

- [Architecture](../architecture/): components and contracts.
- [Iteration Loop](../iteration-loop/): contributor workflow and CI-adjacent scripts.
- [Services and Dependencies](../services-and-dependencies/): confirmed and expected integrations.
- [Operations](../operations/): run, deploy, test, and health.
- [Glossary](../glossary/): project terms with sources.
