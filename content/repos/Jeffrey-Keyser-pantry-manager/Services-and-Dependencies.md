---
title: Services and Dependencies
description: Inbound and outbound integrations for Pantry Manager.
---

# Services and Dependencies

## Depends on

**Runtime libraries**

- `@jeffrey-keyser/express-server-factory` — composes app, health check, CORS, error handler ([package.json:17](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/package.json#L17), [src/app.ts:1-5](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/app.ts#L1-L5))
- `@jeffrey-keyser/database-base-config` — `createPool` + `validateConfig` for pg ([package.json:16](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/package.json#L16), [src/db/connection.ts:1-4](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/db/connection.ts#L1-L4))
- `@jeffrey-keyser/pay-auth-integration` — user resolution middleware + `/auth` proxy routes ([package.json:18](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/package.json#L18), [src/app.ts:7-10](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/app.ts#L7-L10))
- `express` 5, `pg` 8, `multer` (file uploads for receipts), `form-data`, `dotenv`, `node-pg-migrate` ([package.json:19-25](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/package.json#L19-L25))

**External services**

- **PostgreSQL 17** — `pantry_manager` database, `pantry` schema; required at boot, healthcheck wired ([README.md:15](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/README.md#L15), [src/app.ts:25](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/app.ts#L25))
- **Pay auth service** (URL via `PAY_URL`) — proxied for login, used to resolve `pay_uuid` → local user ([src/app.ts:27-53](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/app.ts#L27-L53), [src/config/env.ts:49](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/config/env.ts#L49))
- **Taggun OCR API** — receipt line-item extraction; key from `TAGGUN_API_KEY` ([src/config/env.ts:13](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/config/env.ts#L13), [src/dal/receipts.ts:39-40](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/dal/receipts.ts#L39-L40))

**Client-side**

- React 19, Redux Toolkit, react-router-dom 7, Vite 6 ([client/package.json:11-25](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/client/package.json#L11-L25))

## Consumed by

- **Agency HQ morning briefing** — already wired to pull stock data ([README.md:9](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/README.md#L9))
- **Ping** (transaction layer) — line-item extraction roadmap feeds receipt + product data back from Ping transactions ([README.md:10](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/README.md#L10))
- **Roadmap consumers** — meal planning, grocery list generation (planned, not yet integrated) ([README.md:9](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/README.md#L9))
- **Pantry Manager SPA** (this repo's `client/`) — primary UI ([client/package.json:1-7](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/client/package.json#L1-L7))

All consumers must present `X-API-Key: $PANTRY_MANAGER_API_KEY` (or `Authorization: Bearer …`) on every `/api/*` request ([src/middleware/api-key-auth.ts:11-19](https://github.com/Jeffrey-Keyser/pantry-manager/blob/main/src/middleware/api-key-auth.ts#L11-L19)).
