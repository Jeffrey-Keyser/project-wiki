---
title: Operations
description: Deploy, runtime, logging, and health for the Pantry Manager service.
---

# Operations

## Runtime surface

- **Process** — Node 20+, single Express instance; compiled entry `dist/bin/www.js` ([package.json:9](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/package.json#L9), [package.json:37-40](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/package.json#L37-L40))
- **Port** — 3052 (configurable via `PORT`) ([src/config/env.ts:24](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/config/env.ts#L24), [pantry-manager.service:18](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/pantry-manager.service#L18))
- **Public URL** — `https://pantry-manager.jeffreykeyser.net` ([README.md:57](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/README.md#L57))

## systemd unit

User-level unit `pantry-manager.service`:

- `ExecStart=/usr/bin/node /home/jkeyser/pantry-manager/dist/bin/www.js` ([pantry-manager.service:8](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/pantry-manager.service#L8))
- `Restart=always`, `RestartSec=5`, burst 5/60s ([pantry-manager.service:11-13](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/pantry-manager.service#L11-L13))
- `NODE_ENV=production`, `EnvironmentFile=/home/jkeyser/pantry-manager/.env` for secrets incl. `PANTRY_MANAGER_API_KEY` ([pantry-manager.service:17-20](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/pantry-manager.service#L17-L20))
- Graceful stop via `SIGTERM`, 15s timeout ([pantry-manager.service:9-10](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/pantry-manager.service#L9-L10))

`SIGTERM` is handled in-process by closing the HTTP listener before exit ([src/bin/www.ts:33-39](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/bin/www.ts#L33-L39)).

## Deploy

```bash
npm run build
systemctl --user restart pantry-manager
```

([README.md:51-56](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/README.md#L51-L56))

Migrations run separately: `npm run migrate` (forward) / `npm run migrate:down` (rollback) ([README.md:44-45](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/README.md#L44-L45)).

## Health probe

`GET /health` — wired by `express-server-factory` with a database probe via `createDatabaseHealthCheck(pool)` ([src/app.ts:25](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/app.ts#L25), [src/app.ts:90-98](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/app.ts#L90-L98)). Path is whitelisted by API-key auth so monitors don't need credentials ([src/middleware/api-key-auth.ts:4-7](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/middleware/api-key-auth.ts#L4-L7)).

## Logging

- `morgan` "dev" format via server factory; `/health` excluded from access log ([src/app.ts:69-72](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/app.ts#L69-L72))
- Boot banner logs service name, version, env, port ([src/app.ts:18-23](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/app.ts#L18-L23))
- Errors logged with method + path context, stack traces only when `NODE_ENV=development` ([src/app.ts:106-115](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/app.ts#L106-L115))
- New-user provisioning logged when pay-auth creates a `pantry.users` row ([src/app.ts:45-47](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/app.ts#L45-L47))

Tail logs with `journalctl --user -u pantry-manager -f`.

## Required env

`NODE_ENV`, `PORT`, `PAY_URL`, `TAGGUN_API_KEY`, `PANTRY_MANAGER_API_KEY`, plus database vars (`DATABASE_HOST`/`_NAME`/`_USER`/`_PASSWORD`/`_PORT`, optional `DB_SSLMODE`) ([src/config/env.ts:9-55](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/config/env.ts#L9-L55)). Boot fails closed if `PANTRY_MANAGER_API_KEY` missing ([src/config/env.ts:52-55](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/config/env.ts#L52-L55)).
