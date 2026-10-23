---
title: "Music Store Operations"
description: "How music-store is started, deployed, tested, health-checked, and observed, with documented versus verified runtime behavior."
---

# Operations

music-store is a service plus a CLI, not a library. Its shared types are imported internally ([shared/types/index.ts:L1](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/shared/types/index.ts#L1)).

## Start

- **Server dev.** `npm run dev` ([server/package.json:L7](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/package.json#L7)).
- **Server production.** `npm start` runs `node dist/bin/www.js` ([server/package.json:L8](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/package.json#L8)). The unit runs `npm start` with `NODE_ENV=production` ([music-store.service:L9](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/music-store.service#L9), [L12](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/music-store.service#L12)).
- **Client.** `dev` runs Vite ([client/package.json:L19](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/client/package.json#L19)). The frontend unit serves `dist` on port 3023 ([music-store-frontend.service:L9](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/music-store-frontend.service#L9)).
- **Required env.** `DATABASE_NAME`, `DATABASE_HOST`, `S3_BUCKET`, and `PAY_SERVICE_URL` must be set ([server/src/config/env.ts:L7-L14](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/config/env.ts#L7-L14)). Values are not recorded here.

## Deploy

`deploy.sh` runs `git pull origin master` ([deploy.sh:L17](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/deploy.sh#L17)). It runs `npm ci --include=dev` and builds server and client ([deploy.sh:L23-L31](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/deploy.sh#L23-L31)). It stops and restarts the systemd units and frees ports ([deploy.sh:L35-L38](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/deploy.sh#L35-L38)).

The health gate polls `HEALTH_URL`, defaulting to `http://127.0.0.1:3022/health`, for 45 seconds ([deploy.sh:L11-L12](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/deploy.sh#L11-L12), [L43-L50](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/deploy.sh#L43-L50)). On failure it prints recent journal lines ([deploy.sh:L52-L54](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/deploy.sh#L52-L54)).

## Test and migrate

- `npm test` at root runs the server suite ([package.json:L8](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/package.json#L8)). Test files are not in the excerpts.
- `db:migrate` and `db:migrate:status` are defined ([server/package.json:L12-L13](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/package.json#L12-L13)).

## Health and observability

- `GET /health` is public and returns `status ok` with service `music-store` ([server/src/app.ts:L47-L49](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/app.ts#L47-L49)).
- Logs use pino, level from `LOG_LEVEL`, default `info` ([server/src/logger.ts:L3-L5](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/logger.ts#L3-L5)). Server errors of 5xx are logged ([server/src/app.ts:L83-L85](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/app.ts#L83-L85)).
- Startup logs use the `debug` namespace `music-store:server` ([server/src/bin/www.ts:L7](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/server/src/bin/www.ts#L7)).

## Documented versus verified

- **Verified in source:** ports in code, the health route, deploy steps, and unit files.
- **Documented only:** hostnames and the 3022/3023/3024 layout in `CLAUDE.md` ([CLAUDE.md:L15-L39](https://github.com/Jeffrey-Keyser/music-store/blob/9c5d7976a3a48460b7cf94b676bf879bff00fd54/CLAUDE.md#L15-L39)).
- **Unknown:** whether these units are installed on a host, whether deploy runs automatically, and whether the GitHub error middleware is enabled.
