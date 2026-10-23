---
title: "Services and Dependencies"
description: "Outbound dependencies and inbound callers of Pantry Manager, separating confirmed source-level links from README-stated or roadmap integrations."
---

# Services and Dependencies

## Depends on

**Runtime libraries**

- `@jeffrey-keyser/express-server-factory` builds the app, health check, and error handling ([package.json:L17](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/package.json#L17), [src/app.ts:L1-L5](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/app.ts#L1-L5)).
- `@jeffrey-keyser/database-base-config` provides `createPool` and `validateConfig` ([src/db/connection.ts:L1](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/db/connection.ts#L1)).
- `@jeffrey-keyser/pay-auth-integration` supplies user resolution and `/auth` proxy routes ([src/app.ts:L7-L10](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/app.ts#L7-L10)).
- `multer` handles receipt uploads, and `form-data` builds the Taggun request ([src/routes/versions/v1/receipts.ts:L2](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/routes/versions/v1/receipts.ts#L2), [src/dal/receipts.ts:L58-L60](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/receipts.ts#L58-L60)).

**External services (code-confirmed outbound calls)**

- **PostgreSQL** — the `pantry` schema is accessed through the pool ([src/db/connection.ts:L4](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/db/connection.ts#L4)). The README documents PostgreSQL 17 ([README.md:L15](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/README.md#L15)); the server version is not verified here.
- **Pay service** — `PAY_URL` is required, and `/auth` is proxied to it ([src/config/env.ts:L49-L52](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/config/env.ts#L49-L52), [src/app.ts:L50-L53](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/app.ts#L50-L53)).
- **Taggun OCR API** — `POST /receipts/parse` calls `api.taggun.io` with the `TAGGUN_API_KEY` ([src/dal/receipts.ts:L62-L65](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/receipts.ts#L62-L65), [src/routes/versions/v1/receipts.ts:L12-L15](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/routes/versions/v1/receipts.ts#L12-L15)).
- **Ping expenses API** — the admin seed route fetches grocery expenses. Its default base URL in code is `http://localhost:3001` ([src/dal/seed-from-ping.ts:L26-L27](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/seed-from-ping.ts#L26-L27), [src/routes/versions/v1/admin.ts:L22](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/routes/versions/v1/admin.ts#L22)). Whether that default is used in any deployment is unknown.

**Client-side:** React 19, Redux Toolkit, react-router-dom, and Vite ([client/package.json:L12-L24](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/client/package.json#L12-L24)).

## Consumed by

**Confirmed in source**

- **Pantry Manager SPA** (`client/`) reads `/api/v1/pantry-items` ([client/src/store/api/pantryItems.ts:L35](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/client/src/store/api/pantryItems.ts#L35)).

**README-stated, not verified in excerpts**

- **Agency HQ morning briefing** — the README says it is already wired to stock data ([README.md:L9](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/README.md#L9)). No caller code is included.

**Expected or planned, unknown status**

- **Ping** — the README describes line-item extraction from Ping transactions as a roadmap item ([README.md:L10](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/README.md#L10)). The seed route pulls from Ping, which is the reverse direction ([src/dal/seed-from-ping.ts:L21-L24](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/dal/seed-from-ping.ts#L21-L24)).
- **Meal planning and grocery list generation** — listed as future integrations ([README.md:L9](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/README.md#L9)).

## Access rules

Non-public `/api/*` requests must present `X-API-Key` or a Bearer token matching `PANTRY_MANAGER_API_KEY` ([src/middleware/api-key-auth.ts:L11-L17](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/middleware/api-key-auth.ts#L11-L17)). The admin seed route uses a separate `x-pantry-admin-key` header ([src/routes/versions/v1/admin.ts:L12-L18](https://github.com/Jeffrey-Keyser/pantry-manager/blob/9293c1392f52c8565c675c9168034b9f77a54d77/src/routes/versions/v1/admin.ts#L12-L18)). Whether the SPA's Pay token is accepted by this check is unresolved.
