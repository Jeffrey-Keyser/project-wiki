---
title: Operations
description: Build, deploy, runtime, and observability notes for the Beelink homelab.
---

# Operations

Myrrs is a deployable service, not a library. Two systemd user units on a Beelink homelab — one for the API, one for the static frontend ([CLAUDE.md:140-160](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L140-L160)).

## Ports

| Service  | Port | Source |
|----------|------|--------|
| API      | 3035 | [myrrs-api.service:8](https://github.com/Jeffrey-Keyser/myrrs/blob/main/myrrs-api.service#L8), [CLAUDE.md:146](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L146) |
| Frontend | 3036 | [myrrs-frontend.service:8](https://github.com/Jeffrey-Keyser/myrrs/blob/main/myrrs-frontend.service#L8) |

Dev ports differ: client `vite` defaults via `vite.config.js`, server `dev` script runs `ts-node ./bin/www.ts` and respects `PORT` env ([src/client/vite.config.js](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/client/vite.config.js), [src/server/package.json:8](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/package.json#L8)).

## Start commands

- API: `node dist/bin/www.js` from `src/server`, with `EnvironmentFile=src/server/.env` ([myrrs-api.service:7-11](https://github.com/Jeffrey-Keyser/myrrs/blob/main/myrrs-api.service#L7-L11))
- Frontend: `npx serve -s dist -l 3036` from `src/client` ([myrrs-frontend.service:7-11](https://github.com/Jeffrey-Keyser/myrrs/blob/main/myrrs-frontend.service#L7-L11))
- Both: `Restart=on-failure`, `RestartSec=5` ([myrrs-api.service:9-10](https://github.com/Jeffrey-Keyser/myrrs/blob/main/myrrs-api.service#L9-L10))

## Deploy

One-shot script on the box:

```bash
./deploy.sh
```

Sequence: `git pull origin main` → `npm ci --production && npm run build` in `src/server` → same in `src/client` → `systemctl --user restart myrrs-api myrrs-frontend` ([deploy.sh:5-21](https://github.com/Jeffrey-Keyser/myrrs/blob/main/deploy.sh#L5-L21)).

First-time bootstrap of the schema:

```bash
cd src/server/db
./deploy_complete_schema.sh --backup
```

Then apply migrations in order from `src/server/db/migrations/` ([CLAUDE.md:36-44](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L36-L44), [src/server/db](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/db)).

## Health probe

`GET /health` — exposed by `createExpressApp` with `createDatabaseHealthCheck(pool)`. Service name `Myrrs API`, version `1.0.0` ([src/server/app.ts:109-117](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/app.ts#L109-L117)). It is in the PayAuth public route list, so no auth needed ([src/server/app.ts:42](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/app.ts#L42)).

## Logs

`journalctl --user -u myrrs-api -f` and `journalctl --user -u myrrs-frontend -f` ([CLAUDE.md:165-167](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L165-L167)). HTTP access logs go through `morgan` in `dev` format ([src/server/app.ts:77](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/app.ts#L77)).

## Sessions

Sessions are persisted to PostgreSQL via `connect-pg-simple` against the `session` table in `process.env.DATABASE_SCHEMA` (defaults to `public`); cookies are `httpOnly`, `secure` in prod, 30-day max age ([src/server/app.ts:81-98](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/app.ts#L81-L98)).

## Environment

`src/server/.env` is required (referenced both by `dotenv.config()` and by the systemd `EnvironmentFile`); template in `src/server/.env.example` per CLAUDE notes ([src/server/app.ts:1-2](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/app.ts#L1-L2), [myrrs-api.service:11](https://github.com/Jeffrey-Keyser/myrrs/blob/main/myrrs-api.service#L11), [CLAUDE.md:179-198](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L179-L198)). Client production build reads `src/client/.env.production` for `VITE_API_BASE_URL` ([CLAUDE.md:225-227](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L225-L227)).

## On-call

Solo-operator homelab; there is no formal on-call rotation, paging integration, or alert config in-repo. The only liveness signal is `GET /health` plus the systemd `Restart=on-failure` directive ([src/server/app.ts:109-117](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/app.ts#L109-L117), [myrrs-api.service:9](https://github.com/Jeffrey-Keyser/myrrs/blob/main/myrrs-api.service#L9)).
