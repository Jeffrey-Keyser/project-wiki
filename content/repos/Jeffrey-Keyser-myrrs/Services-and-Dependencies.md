---
title: "Myrrs Services and Dependencies"
description: "What Myrrs depends on, and which callers are confirmed in source versus expected or unknown."
---

# Services & Dependencies

## Depends on

**Server libraries.** The server depends on the Express app factory, the PayAuth integration, domain-core, the database base config, and PayAuth API types ([src/server/package.json:L16-L20](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/package.json#L16-L20)). It also declares session, Postgres, and parsing packages ([src/server/package.json:L22](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/package.json#L22), [L30](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/package.json#L30), [L36](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/package.json#L36)).

**Client libraries.** React 19, Redux Toolkit, react-redux, React Router, the PayAuth client package, and the shared feedback widget package `@jeffrey-keyser/feedback-widget` ([src/client/package.json:L5-L27](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/client/package.json#L5-L27), [L8](https://github.com/Jeffrey-Keyser/myrrs/blob/763c73a821b091c836c69fc3ee961a252fe10bd6/src/client/package.json#L8)).

**Cross-repo wiki:**
- PayAuth integration: [pay-auth-integration wiki](/repos/jeffrey-keyser-pay-auth-integration/home/)
- Domain core: [myrrs-domain-core source](https://github.com/Jeffrey-Keyser/myrrs-domain-core)
- Express factory: [express-server-factory source](https://github.com/Jeffrey-Keyser/express-server-factory)

**External: PayAuth.** The base URL comes from `PAY_SERVICE_URL`, defaulting to `https://pay.jeffreykeyser.net` ([src/server/app.ts:L38-L40](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L38-L40)). The profile router proxies reads and updates to the PayAuth users API ([src/server/routes/profile.ts:L11](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/routes/profile.ts#L11), [L27-L28](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/routes/profile.ts#L27-L28), [L106](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/routes/profile.ts#L106)).

**External: shared feedback registry.** The client's `FeedbackWidget` sends user-initiated reports directly to the shared feedback registry. The app id is `myrrs`, and the registry origin defaults to `https://feedback.jeffreykeyser.net`. The widget appends the fixed path `/api/v1/feedback` to that origin, and trailing slashes are stripped ([src/client/src/config/feedback.ts:L9](https://github.com/Jeffrey-Keyser/myrrs/blob/763c73a821b091c836c69fc3ee961a252fe10bd6/src/client/src/config/feedback.ts#L9), [L17-L19](https://github.com/Jeffrey-Keyser/myrrs/blob/763c73a821b091c836c69fc3ee961a252fe10bd6/src/client/src/config/feedback.ts#L17-L19)). The origin is overridable with `VITE_FEEDBACK_API_BASE_URL`. The optional reporter email is sent only when the user enters one ([feedback.ts:L4-L6](https://github.com/Jeffrey-Keyser/myrrs/blob/763c73a821b091c836c69fc3ee961a252fe10bd6/src/client/src/config/feedback.ts#L4-L6)). This diff adds no server-side proxy or route for feedback.

**External: PostgreSQL.** The pool is built from `validateConfig` and `createPool` in the database base config ([src/server/db/config.ts:L1-L10](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/db/config.ts#L1-L10)). Host and database values are not hard-coded. CLAUDE.md documents the shared `jkeyser` database and `myrrs` schema ([CLAUDE.md:L259-L263](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/CLAUDE.md#L259-L263)). The DB deploy script defaults to `myrrs_db` ([src/server/db/deploy_complete_schema.sh:L17-L19](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/db/deploy_complete_schema.sh#L17-L19)). These values disagree, so check the live environment.

## Consumed by

**Confirmed in this repo.**
- The React SPA sends requests to a base URL from `VITE_API_BASE_URL`, defaulting to `http://localhost:3000` ([src/client/src/config/auth.ts:L6-L8](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/client/src/config/auth.ts#L6-L8)). Auth paths are appended to it ([L10-L21](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/client/src/config/auth.ts#L10-L21)).
- Client components import RTK Query hooks from `routinesApi`, `rulesApi`, and `preferencesApi` ([src/client/src/components/config/RoutineForm.tsx:L2-L8](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/client/src/components/config/RoutineForm.tsx#L2-L8)). Those slice files are not in the excerpts.

**Expected but not confirmed.**
- Browsers reaching the static frontend on port 3036 ([myrrs-frontend.service:L8](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/myrrs-frontend.service#L8)). The unit exists, but nothing shows it is running.
- The production API URL. CLAUDE.md says `.env.production` sets it ([CLAUDE.md:L290](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/CLAUDE.md#L290)), but that file is not in the excerpts.
- Other applications reading the `myrrs` schema: unknown.
- Scheduled or background callers: no job code appears in the excerpts. That is not proof none exists, since the excerpts are partial.

**Not published.** The root and both workspace packages are marked private ([package.json:L3](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/package.json#L3), [src/server/package.json:L4](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/package.json#L4), [src/client/package.json:L4](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/client/package.json#L4)), so no SDK is published from this repo.

## Inbound surfaces

Public routes skip the PayAuth gate: `/health`, `/auth/login`, `/auth/logout`, `/auth/register`, `/auth/guest`, `/auth/validate-password`, `/auth/forgot-password`, and `/auth/reset-password` ([src/server/app.ts:L41-L50](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L41-L50)). `/ping` is also defined ([src/server/routes/index.ts:L12-L14](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/routes/index.ts#L12-L14)).

Authenticated REST surfaces are `/api/profile`, `/api/routines`, `/api/schedule`, `/api/rules`, `/api/user-rule-configurations`, and `/api/analytics` ([src/server/app.ts:L126-L131](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L126-L131)). The rule configuration path has the issue noted on the [Architecture](../architecture/) page.
