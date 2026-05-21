---
title: Life — Voice-First Personal Journal
description: "Overview of the Life monorepo: a voice-only diary that transcribes, structures, and links spoken entries with AI."
---

# Life

Life is a voice-first personal journal. The user taps the mic, speaks, and the system transcribes, structures with AI, and links the entry to people and tags. There is no keyboard escape hatch on the home flow — the constraint is the product ([README.md:5-7](https://github.com/Jeffrey-Keyser/Life/blob/master/README.md#L5-L7)).

## At a glance

- **Monorepo** with `client/` (React 19 + Vite) and `server/` (Express 5 + TypeScript) workspaces ([package.json:5-13](https://github.com/Jeffrey-Keyser/Life/blob/master/package.json#L5-L13)).
- **Voice pipeline**: MediaRecorder → Whisper transcribe → GPT-4o-mini structure → user disambiguates → save ([README.md:18-23](https://github.com/Jeffrey-Keyser/Life/blob/master/README.md#L18-L23)).
- **Storage**: PostgreSQL with stored procedures; two schemas `public` (app data) and `life` (user mapping) ([CLAUDE.md:118-141](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L118-L141)).
- **Auth**: SSO via `@jeffrey-keyser/pay-auth-integration`, auto-provisioning local users from the Pay UUID ([README.md:87-89](https://github.com/Jeffrey-Keyser/Life/blob/master/README.md#L87-L89)).
- **AI calls** are routed through an external AI Proxy service, never to OpenAI directly ([README.md:84-85](https://github.com/Jeffrey-Keyser/Life/blob/master/README.md#L84-L85)).
- **Production**: self-hosted on a beelink mini-PC behind Cloudflare Tunnel, with `life-api` + `life-frontend` systemd units ([docs/DEPLOYMENT.md:5-13](https://github.com/Jeffrey-Keyser/Life/blob/master/docs/DEPLOYMENT.md#L5-L13)).

## Who uses it

A single end user (the author) speaks entries; Pay auth gates access and Life provisions a local user record on first login ([README.md:87-89](https://github.com/Jeffrey-Keyser/Life/blob/master/README.md#L87-L89)). The diagnostics dashboard is accessible to the authenticated user behind the same access-token flow ([README.md:99](https://github.com/Jeffrey-Keyser/Life/blob/master/README.md#L99)).

## How work moves through it

1. Local dev runs both halves concurrently via `npm run dev` at the repo root ([package.json:8](https://github.com/Jeffrey-Keyser/Life/blob/master/package.json#L8)).
2. Commits to `master` trigger the beelink-deploy webhook listener, which executes `./deploy.sh` on the host ([CLAUDE.md:79-83](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L79-L83)).
3. `deploy.sh` pulls, rebuilds server and client, applies database schema/SP changes, and restarts both systemd services ([deploy.sh:8-37](https://github.com/Jeffrey-Keyser/Life/blob/master/deploy.sh#L8-L37)).

## Wiki pages

- [Architecture](./architecture/) — internal module layout, role contracts.
- [Iteration Loop](./iteration-loop/) — how a change moves from edit to deployed.
- [Services and Dependencies](./services-and-dependencies/) — inbound and outbound integrations.
- [Operations](./operations/) — deploy, runtime, observability, smoke tests.
- [Glossary](./glossary/) — repo-specific terms.
