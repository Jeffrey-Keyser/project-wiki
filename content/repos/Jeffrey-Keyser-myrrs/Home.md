---
title: Myrrs — Repo Overview
description: Full-stack web app for probability-based routine scheduling with streaks and a rule engine.
---

# Myrrs

Myrrs ("My Random Routine Scheduler") is a full-stack web app for dynamic routine scheduling. Probability-based selection plus streak tracking and a rule engine produce varied-but-structured daily routines ([CLAUDE.md:7](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L7)).

## At a glance

- **Shape**: npm workspaces monorepo, `src/client` + `src/server` ([package.json:4-7](https://github.com/Jeffrey-Keyser/myrrs/blob/main/package.json#L4-L7))
- **Frontend**: React 19 + Vite + Redux Toolkit / RTK Query ([src/client/package.json:5-30](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/client/package.json#L5-L30))
- **Backend**: Node.js + Express + TypeScript, served by `dist/bin/www.js` ([src/server/package.json:5-14](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/package.json#L5-L14))
- **Persistence**: PostgreSQL, schema `myrrs` inside shared `jkeyser` DB ([CLAUDE.md:174-181](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L174-L181))
- **Auth**: PayAuth proxy integration, `@jeffrey-keyser/pay-auth-integration` ([src/server/app.ts:38-51](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/app.ts#L38-L51))
- **Runtime**: Beelink homelab, systemd user units `myrrs-api` (:3035) and `myrrs-frontend` (:3036) ([CLAUDE.md:148-160](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L148-L160))

## Who uses it

Single-user / small-group personal productivity tool. End users are humans following gamified routines; the operator is the repo owner (`jkeyser`) running on a self-hosted homelab ([CLAUDE.md:140-148](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L140-L148)).

## How work moves through it

Feature lands as TS code in `src/server` (service, repository, route) and/or `src/client` (component, RTK Query slice, page). Build via `npm run build` in each workspace, then `deploy.sh` pulls main, rebuilds, restarts both systemd units ([deploy.sh:1-23](https://github.com/Jeffrey-Keyser/myrrs/blob/main/deploy.sh#L1-L23)).

## Wiki pages

- [Architecture](./architecture/) — internal module layout, request path, rule engine
- [Iteration Loop](./iteration-loop/) — how a change becomes a deploy
- [Services & Dependencies](./services-and-dependencies/) — inbound / outbound integrations
- [Operations](./operations/) — deploy commands, systemd units, health, logs
- [Glossary](./glossary/) — repo-specific terms
