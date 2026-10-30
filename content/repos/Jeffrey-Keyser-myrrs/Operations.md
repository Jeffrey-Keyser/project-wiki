---
title: "Myrrs Operations"
description: "Start, deploy, test, and health commands for Myrrs, with documented versus verified runtime details."
---

# Operations

Myrrs is a deployable web service, not a library. The repo contains two systemd user units and a build-and-restart script ([CLAUDE.md:L219-L235](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/CLAUDE.md#L219-L235), [deploy.sh:L1-L25](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/deploy.sh#L1-L25)). Whether those units run on any host is not shown in source.

## Commands

- **Server start:** `npm start`, which runs `node ./dist/bin/www.js` ([src/server/package.json:L6](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/package.json#L6)). The API unit runs `dist/bin/www.js` from `src/server` with `.env` loaded ([myrrs-api.service:L7-L11](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/myrrs-api.service#L7-L11)).
- **Server dev:** `npm run dev` runs ts-node on `bin/www.ts` ([src/server/package.json:L7](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/package.json#L7)).
- **Client dev and build:** `npm run dev` and `npm run build` in `src/client` ([src/client/package.json:L32-L33](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/client/package.json#L32-L33)).
- **Frontend serve:** `npx serve -s dist -l 3036` from `src/client` ([myrrs-frontend.service:L7-L8](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/myrrs-frontend.service#L7-L8)).
- **Deploy:** `./deploy.sh` ([deploy.sh:L1-L23](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/deploy.sh#L1-L23)).
- **Tests:** `npm test` in the server runs jest ([src/server/package.json:L13](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/package.json#L13)). In the client it runs `vitest --run` ([src/client/package.json:L35](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/client/package.json#L35)).

### Client feedback tests

The client suite includes two feedback test files. `App.feedback.test.tsx` renders the real App shell with the real `FeedbackWidget` and mocked fetch transport, and covers both routes, trigger visibility, validation, payloads, acknowledgement, and failures ([src/client/src/App.feedback.test.tsx:L1-L16](https://github.com/Jeffrey-Keyser/myrrs/blob/763c73a821b091c836c69fc3ee961a252fe10bd6/src/client/src/App.feedback.test.tsx#L1-L16)).

`App.feedback.integration.test.tsx` targets an isolated feedback-registry instance. It needs a disposable database, identified by `FEEDBACK_ISOLATED_DATABASE_URL` or `FEEDBACK_TEST_DATABASE_URL`, or a local PostgreSQL 16 install at `/usr/lib/postgresql/16/bin` for throwaway provisioning. It also needs a feedback-registry checkout at `FEEDBACK_REGISTRY_PATH` containing the fixture `server/tests/fixtures/myrrs-isolated-registry.ts`. When these are missing, the file logs a console warning and the suite is skipped, so `npm test` still exits 0 ([src/client/src/App.feedback.integration.test.tsx:L1-L18](https://github.com/Jeffrey-Keyser/myrrs/blob/763c73a821b091c836c69fc3ee961a252fe10bd6/src/client/src/App.feedback.integration.test.tsx#L1-L18)). The file states that a production or shared database is never used.

## Ports

- **API:** documented as 3035 ([CLAUDE.md:L205](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/CLAUDE.md#L205), [L227](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/CLAUDE.md#L227)). The code reads `PORT` and falls back to `80` ([src/server/bin/www.ts:L19](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/bin/www.ts#L19)). The effective port is whatever `.env` sets, which the excerpts do not show.
- **Frontend:** 3036 in the unit file ([myrrs-frontend.service:L8](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/myrrs-frontend.service#L8)).
- **Client dev:** 3002 ([src/client/vite.config.js:L7](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/client/vite.config.js#L7)). The client's default API base is `localhost:3000` ([src/client/src/config/auth.ts:L8](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/client/src/config/auth.ts#L8)), which matches neither documented port. Set `VITE_API_BASE_URL` explicitly.

## Health and observability

- `GET /health` is public ([src/server/app.ts:L41-L42](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L41-L42)). The health check is configured with a database check ([src/server/app.ts:L109-L117](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L109-L117)). The handler returns status, service name, version `1.0.0`, database version, and a timestamp ([src/server/routes/index.ts:L16-L25](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/routes/index.ts#L16-L25)).
- Logs: `journalctl --user -u myrrs-api -f` and the frontend equivalent ([CLAUDE.md:L253-L254](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/CLAUDE.md#L253-L254)). Request logging is set to `format: 'dev'` ([src/server/app.ts:L77](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L77)); the factory's logger is not in the excerpts. Routes also call `console.log` and `console.error` ([src/server/routes/schedule.ts:L170](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/routes/schedule.ts#L170)).
- Swagger is enabled outside production ([src/server/app.ts:L101-L103](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L101-L103)). Its mount path is unknown.
- Restart policy: `Restart=on-failure` with a 5-second delay ([myrrs-api.service:L9-L10](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/myrrs-api.service#L9-L10)). No alerting config appears in the excerpts.

## Database

Running `deploy_complete_schema.sh` drops the target database if it exists and recreates it ([src/server/db/deploy_complete_schema.sh:L82-L102](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/db/deploy_complete_schema.sh#L82-L102)). `--backup` attempts a `pg_dump` first ([L66-L79](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/db/deploy_complete_schema.sh#L66-L79)). `--force` skips the confirmation prompt ([L173-L174](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/db/deploy_complete_schema.sh#L173-L174)). Treat it as destructive.

The app calls `initDatabase(false)` at startup ([src/server/app.ts:L23-L31](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L23-L31)). The init module is not in the excerpts, so its effect is unknown.

## Environment

Variable names read in source include `PAY_SERVICE_URL`, `ORIGIN_BASE_URL`, `SESSION_SECRET`, `DATABASE_SCHEMA`, `NODE_ENV`, and `PORT` ([src/server/app.ts:L39](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L39), [L56](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L56), [L82](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L82)). Do not put values in the wiki. The code prefixes `https://` to `ORIGIN_BASE_URL` ([src/server/app.ts:L58](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L58)), so it should hold a host, not a scheme.

Client build-time variables include `VITE_API_BASE_URL` and `VITE_FEEDBACK_API_BASE_URL`, the latter overriding the feedback registry origin ([src/client/src/config/feedback.ts:L17-L19](https://github.com/Jeffrey-Keyser/myrrs/blob/763c73a821b091c836c69fc3ee961a252fe10bd6/src/client/src/config/feedback.ts#L17-L19)). Feedback tests read `FEEDBACK_ISOLATED_DATABASE_URL`, `FEEDBACK_TEST_DATABASE_URL`, and `FEEDBACK_REGISTRY_PATH` ([src/client/src/App.feedback.integration.test.tsx:L1-L18](https://github.com/Jeffrey-Keyser/myrrs/blob/763c73a821b091c836c69fc3ee961a252fe10bd6/src/client/src/App.feedback.integration.test.tsx#L1-L18)). Do not put their values in the wiki.

Sessions use the database store with a 30-day cookie max age ([src/server/app.ts:L83-L95](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/server/app.ts#L83-L95)). CLAUDE.md mentions a Redis fallback and `DISABLE_REDIS` ([CLAUDE.md:L139](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/CLAUDE.md#L139), [L207](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/CLAUDE.md#L207)), but no Redis code appears in the excerpts. Treat Redis as unknown.

## Documented versus verified

- **Verified in code:** the start, build, and test scripts; the systemd unit commands; the deploy script; the health route; the public route list; and the client feedback shell and its gated integration suite.
- **Documented only:** the homelab host, the `.env.production` file, and peer authentication for the database user ([CLAUDE.md:L262](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/CLAUDE.md#L262)).
- **Stale:** the README describes an AWS Lambda and CloudFront setup ([src/README.md:L110-L123](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/README.md#L110-L123), [L281](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/README.md#L281)) and marks itself "Not Started" ([L299](https://github.com/Jeffrey-Keyser/myrrs/blob/39ea32f15f79b94f655af227ef5b7db26d828205/src/README.md#L299)). The current scripts do not match it.
