---
title: "Myrrs Overview"
description: "What Myrrs is, who uses it, the main user flow, and where to find the other wiki pages."
---

# Myrrs

Myrrs ("My Random Routine Scheduler") is a full-stack web app for dynamic routine scheduling. It combines probability-based selection, streak tracking, and a rule engine to produce varied but structured daily routines ([CLAUDE.md:L7](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/CLAUDE.md#L7)).

## At a glance

- **Shape**: npm workspaces for `src/client` and `src/server` ([package.json:L4-L7](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/package.json#L4-L7)).
- **Frontend**: React, Redux Toolkit, and Vite ([src/client/package.json:L10-L27](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/client/package.json#L10-L27)).
- **Backend**: Express with TypeScript; the production start script runs `dist/bin/www.js` ([src/server/package.json:L6-L8](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/package.json#L6-L8)).
- **Data**: PostgreSQL through a shared `pg` pool; the schema name comes from `DATABASE_SCHEMA` ([src/server/db/config.ts:L7-L10](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/db/config.ts#L7-L10), [src/server/app.ts:L87](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L87)).
- **Auth**: PayAuth routes mounted at `/auth` ([src/server/app.ts:L38-L51](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L38-L51), [L125](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L125)).
- **Deployment**: documented as systemd user units on a Beelink homelab ([CLAUDE.md:L221](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/CLAUDE.md#L221)). The unit files are in the repo ([myrrs-api.service:L8](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/myrrs-api.service#L8), [myrrs-frontend.service:L8](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/myrrs-frontend.service#L8)), but whether they are running today is unknown from source.

## Who uses it

Signed-in users. The SPA guards `/` and `/configure` behind authentication ([src/client/src/App.tsx:L67-L82](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/client/src/App.tsx#L67-L82)). Guest sign-in is enabled in the client auth config ([src/client/src/config/auth.ts:L26](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/client/src/config/auth.ts#L26), [L34](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/client/src/config/auth.ts#L34)). Each authenticated request is tied to a local numeric user record ([src/server/middleware/resolveUserData.ts:L21-L29](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/middleware/resolveUserData.ts#L21-L29)).

The README frames Myrrs as a personal productivity tool ([src/README.md:L5](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/README.md#L5)). The operator is the repo owner running a homelab ([CLAUDE.md:L221](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/CLAUDE.md#L221)). How many people use the instance is unknown from these excerpts.

## Main flow

1. A user signs in through the PayAuth routes. The server resolves the PayAuth identity to a local user id on each authenticated request ([src/server/middleware/resolveUserData.ts:L16-L29](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/middleware/resolveUserData.ts#L16-L29)).
2. The user manages routines, scheduling preferences, rules, and profile in the configuration page ([src/client/src/pages/ConfigurationPage.tsx:L38-L47](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/client/src/pages/ConfigurationPage.tsx#L38-L47)).
3. A day's schedule is generated with `POST /api/schedule/generate`, and each placed routine is saved as a task ([src/server/routes/schedule.ts:L152-L157](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/routes/schedule.ts#L152-L157), [L91-L99](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/routes/schedule.ts#L91-L99)). The placement is sequential with a 15-minute gap, not a full rule-driven optimizer ([src/server/routes/schedule.ts:L39-L43](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/routes/schedule.ts#L39-L43), [L105](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/routes/schedule.ts#L105)).
4. Completion statistics are served from `GET /api/analytics/completion-stats` ([src/server/routes/analytics.ts:L71-L77](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/routes/analytics.ts#L71-L77)).

Completion and regret helpers exist in `routes/routines.ts` ([L190-L264](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/routes/routines.ts#L190-L264)), but the full endpoint list is in a section these excerpts do not show, so the complete wiring is unknown.

## Wiki pages

- [Architecture](../architecture/): components, contracts, and request path.
- [Iteration Loop](../iteration-loop/): contributor workflow, scripts, and CI files.
- [Services & Dependencies](../services-and-dependencies/): confirmed and unknown callers.
- [Operations](../operations/): commands, health, and documented versus verified runtime.
- [Glossary](../glossary/): project-specific terms.
