---
title: "Operations"
description: "Start, build, test, migrate, deploy, health, and logging for Pantry Manager, with documented versus source-verified runtime facts called out."
---

# Operations

Pantry Manager is a deployed Express service, not a library. Its package is private, exposes `start`, and has a binary entrypoint ([package.json:L4](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/package.json#L4), [package.json:L9](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/package.json#L9)).

## Commands

- `npm install` (documented in [README.md:L41](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/README.md#L41)).
- `npm run dev` runs `ts-node src/bin/www.ts` ([package.json:L7](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/package.json#L7)).
- `npm run build` runs `tsc`, which outputs to `dist` ([package.json:L8](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/package.json#L8), [tsconfig.json:L6-L7](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/tsconfig.json#L6-L7)).
- `npm start` runs `node dist/bin/www.js` ([package.json:L9](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/package.json#L9)).
- `npm test` runs `vitest run` ([package.json:L10](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/package.json#L10)).
- `npm run migrate` and `npm run migrate:down` run the migration helpers ([package.json:L11-L12](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/package.json#L11-L12)).

## Deploy

The README documents `npm run build` followed by `systemctl --user restart pantry-manager` ([README.md:L51-L54](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/README.md#L51-L54)). The unit file in the repo runs `dist/bin/www.js` with `Restart=always` and a 15-second stop timeout ([pantry-manager.service:L8](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/pantry-manager.service#L8), [pantry-manager.service:L10-L12](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/pantry-manager.service#L10-L12)).

The unit sets `NODE_ENV=production` and `PORT=3052`, and loads `.env` ([pantry-manager.service:L17-L20](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/pantry-manager.service#L17-L20)). The README gives the public URL as `https://pantry-manager.jeffreykeyser.net` ([README.md:L57](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/README.md#L57)).

## Health

`GET /health` is enabled with a database check and service name ([src/app.ts:L90-L98](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/app.ts#L90-L98)). It is exempt from API key checks ([src/middleware/api-key-auth.ts:L4](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/middleware/api-key-auth.ts#L4)).

## Logging and shutdown

- Boot logs service name, version, environment, and port ([src/app.ts:L18-L23](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/app.ts#L18-L23)).
- Request logging uses the `dev` format and skips `/health` ([src/app.ts:L69-L72](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/app.ts#L69-L72)).
- Errors log the method and path. Stack traces are included only in development ([src/app.ts:L106-L115](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/app.ts#L106-L115)).
- On `SIGTERM`, the server closes and exits ([src/bin/www.ts:L33-L39](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/bin/www.ts#L33-L39)).

The README suggests `journalctl --user` for logs, but the excerpts do not include that; treat it as documented, not verified.

## Environment names

Required: `NODE_ENV`, `PAY_URL`, `PANTRY_MANAGER_API_KEY`, plus database settings. Optional: `TAGGUN_API_KEY`, `PORT` (default 3052), and `PANTRY_ADMIN_KEY` for the admin route ([src/config/env.ts:L10-L14](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/config/env.ts#L10-L14), [src/routes/versions/v1/admin.ts:L12-L13](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/routes/versions/v1/admin.ts#L12-L13)). Values are intentionally omitted.

## Documented versus verified

- **Verified by source:** port, env validation, health route, SIGTERM handling, and unit file contents.
- **Documented only:** PostgreSQL 17, the public URL, and the systemd install state.
- **Unknown:** the running host, reverse proxy, migration state, and whether the Ping default URL is used anywhere.
