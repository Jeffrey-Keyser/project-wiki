---
title: Services & Dependencies
description: What Myrrs depends on and what depends on Myrrs.
---

# Services & Dependencies

## Depends on

**Runtime libraries (server).**
- `@jeffrey-keyser/express-server-factory` — builds the Express app (CORS, sessions, health, swagger) ([src/server/app.ts:4](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/app.ts#L4))
- `@jeffrey-keyser/pay-auth-integration` — PayAuth client routes + middleware ([src/server/app.ts:6](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/app.ts#L6))
- `@jeffrey-keyser/myrrs-domain-core` — `Rule`, `RuleEngine`, scheduling primitives ([src/server/package.json:18](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/package.json#L18))
- `@jeffrey-keyser/database-base-config` — shared Postgres config conventions ([src/server/package.json:16](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/package.json#L16))
- `@jeffrey-keyser/pay-api-types` — typed PayAuth API contracts ([src/server/package.json:19](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/package.json#L19))
- `express`, `express-session`, `connect-pg-simple`, `pg`, `jsonwebtoken`, `express-validator`, `date-fns`, `uuid` ([src/server/package.json:21-37](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/package.json#L21-L37))

**Runtime libraries (client).**
- React 19, React Router 7, Redux Toolkit / RTK Query, react-hook-form + zod, styled-components, react-i18next, react-select, `@jeffrey-keyser/pay-auth-integration` ([src/client/package.json:5-30](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/client/package.json#L5-L30))

**External services.**
- **PayAuth** at `https://pay.jeffreykeyser.net` — identity / session provider; URL falls back to that constant if `PAY_SERVICE_URL` is unset ([src/server/app.ts:39](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/app.ts#L39))
- **PostgreSQL** — shared `jkeyser` DB, schema `myrrs`, peer auth as user `jkeyser` ([CLAUDE.md:174-181](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L174-L181))

**Cross-repo wiki:**
- PayAuth integration → [pay-auth-integration wiki](https://wiki.jeffreykeyser.net/repos/Jeffrey-Keyser-pay-auth-integration/)
- Domain core → [myrrs-domain-core wiki](https://wiki.jeffreykeyser.net/repos/Jeffrey-Keyser-myrrs-domain-core/)
- Express factory → [express-server-factory wiki](https://wiki.jeffreykeyser.net/repos/Jeffrey-Keyser-express-server-factory/)

## Consumed by

- **Browser users** — the SPA at `:3036` is the sole first-class consumer of the API ([myrrs-frontend.service:8](https://github.com/Jeffrey-Keyser/myrrs/blob/main/myrrs-frontend.service#L8)).
- **No cron / no scheduled remote agents in-repo.** No `crontab`, no cron-scheduling code, no background workers shipped with the service unit ([myrrs-api.service:1-15](https://github.com/Jeffrey-Keyser/myrrs/blob/main/myrrs-api.service#L1-L15)).
- **No public SDK published from this repo.** The repo is `"private": true` ([package.json:3](https://github.com/Jeffrey-Keyser/myrrs/blob/main/package.json#L3), [src/server/package.json:4](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/package.json#L4), [src/client/package.json:4](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/client/package.json#L4)).

## Inbound surfaces

Public-ish routes (no PayAuth gate): `/health`, `/auth/login`, `/auth/logout`, `/auth/register`, `/auth/guest`, `/auth/validate-password`, `/auth/forgot-password`, `/auth/reset-password` ([src/server/app.ts:41-50](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/app.ts#L41-L50)).

Authenticated REST surfaces: `/api/profile`, `/api/routines`, `/api/schedule`, `/api/rules`, `/api/user-rule-configurations`, `/api/analytics` ([src/server/app.ts:126-131](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/app.ts#L126-L131)).
