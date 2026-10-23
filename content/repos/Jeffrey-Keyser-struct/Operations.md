---
title: "Struct Operations"
description: "How Struct is started, deployed, tested, and observed, with a clear split between documented and verified runtime facts."
---

# Operations

Struct is a long-running HTTP service, not a library. Its package entry point is `dist/bin/www.js` ([server/package.json:L5](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/package.json#L5)).

## Start

- Production-style: `npm run build`, then `npm start`, which runs `node ./dist/bin/www.js` ([server/package.json:L7](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/package.json#L7)).
- Development: `npm run dev` ([server/package.json:L8](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/package.json#L8)).
- Port: `PORT` defaults to 3032 ([server/config/env.ts:L160](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/config/env.ts#L160)). The systemd unit in the repo does not set `PORT`, and loads an optional `.env` ([struct.service:L26](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/struct.service#L26)). The effective port on any host is unknown from source.
- Startup logs report the provider, executable, default model, queue policy, and readiness ([server/bin/www.ts:L10-L48](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/bin/www.ts#L10-L48)).

## Deploy

The repo's deploy script runs from the checkout. It pulls `master`, runs `npm ci` only when the lockfile hash changed, builds, and installs the unit if it differs ([deploy.sh:L23-L45](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/deploy.sh#L23-L45)). It waits for `/metrics` to show no active or queued work, up to `IDLE_TIMEOUT_SECS` (default 300), then restarts and gates on `/health` ([deploy.sh:L47-L78](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/deploy.sh#L47-L78)).

The unit runs `npm start` from the server directory with `Restart=on-failure` ([struct.service:L8-L10](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/struct.service#L8-L10)).

## Test

- `npm run test:coverage` and `npm run lint` from `server/` ([README.md:L53-L55](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/README.md#L53-L55)).
- CI runs build, lint, and coverage ([.github/workflows/server-ci.yml:L30-L37](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/.github/workflows/server-ci.yml#L30-L37)).

## Health and observability

- `GET /health` returns service health from the factory ([server/app.ts:L29-L34](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/app.ts#L29-L34)). Health requests are excluded from request logs ([server/app.ts:L26](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/app.ts#L26)).
- `GET /ready` returns 503 when the CLI or Prompt Registry check fails ([server/routes/index.ts:L35-L38](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/routes/index.ts#L35-L38)).
- `GET /metrics` returns a JSON snapshot ([server/routes/index.ts:L27-L33](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/routes/index.ts#L27-L33)).
- `GET /runtime-config` reports the applied provider, model, and sync status ([server/routes/index.ts:L23-L25](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/routes/index.ts#L23-L25)).
- Logs use pino, at `LOG_LEVEL` or `info` ([server/lib/logger.ts:L4-L12](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/server/lib/logger.ts#L4-L12)).

## Documented versus verified

- **Verified in source:** scripts, CI steps, deploy script behavior, and endpoint definitions.
- **Documented, not verified here:** that pushes to `master` deploy automatically on the Beelink host, and that the installed unit matches the repo file ([CLAUDE.md:L75](https://github.com/Jeffrey-Keyser/struct/blob/bc94f30f2343c96088092304214eda45a68c596f/CLAUDE.md#L75)).
- **Unknown:** the live host's env file, port, provider, and whether `/health` currently returns 200. These require checking the running host.
