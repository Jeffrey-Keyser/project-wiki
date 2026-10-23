---
title: "Operations"
description: "How Life runs: start, test, deploy, and health commands, plus observability, with documented versus verified runtime facts called out."
---

# Operations

Life is a deployed web application, not a library. Both packages are private and the server exposes HTTP routes ([server/package.json:4](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/package.json#L4), [client/package.json:4](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/client/package.json#L4)).

## Commands

| Task | Command | Source |
| --- | --- | --- |
| Dev both halves | `npm run dev` at repo root | [package.json:8](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/package.json#L8) |
| Server dev | `npm run dev` in `server` (ts-node) | [server/package.json:7](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/package.json#L7) |
| Server start | `npm start` runs `node ./dist/bin/www.js` | [server/package.json:6](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/package.json#L6) |
| Build | `npm run build` at root | [package.json:11](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/package.json#L11) |
| Test and coverage | `npm test`, `npm run test:coverage` | [package.json:14-17](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/package.json#L14-L17) |
| Lint and typecheck | `npm run lint`, `npm run typecheck` | [package.json:20-23](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/package.json#L20-L23) |
| E2E | `npm run e2e` | [package.json:27](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/package.json#L27) |
| Deploy | `./deploy.sh` | [deploy.sh:1-37](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/deploy.sh#L1-L37) |

## Ports

- Server default `PORT` is 3002 ([server/config/env.ts:216](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/config/env.ts#L216), [server/bin/www.ts:29](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/bin/www.ts#L29)).
- Client dev port is 3001 ([client/vite.config.ts:13](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/client/vite.config.ts#L13)).
- Production ports 3026 (API) and 3027 (frontend) are documented in CLAUDE.md ([CLAUDE.md:71-77](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/CLAUDE.md#L71-L77)). The systemd unit files are not in the excerpts, so these are documented, not verified.

## Deploy

- `deploy.sh` is the authoritative entry point. It pulls, builds, applies database changes, backfills embeddings, and restarts `life-api` and `life-frontend` ([deploy.sh:8-36](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/deploy.sh#L8-L36)).
- Auto-deploy on push to `master` is documented, not verified in these excerpts ([docs/DEPLOYMENT.md:24](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/docs/DEPLOYMENT.md#L24)).

## Health and diagnostics

- `GET /health` at root returns status, uptime, and memory. It runs a database check and returns 503 when degraded ([server/routes/health.ts:50-83](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/routes/health.ts#L50-L83)).
- `/diagnostics/ping` and `/diagnostics/health` are unauthenticated ([server/routes/diagnostics.ts:30](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/routes/diagnostics.ts#L30), [server/routes/diagnostics.ts:50](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/routes/diagnostics.ts#L50)). `/diagnostics/detailed` requires Pay auth ([server/routes/diagnostics.ts:79](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/routes/diagnostics.ts#L79)).
- The `/debug` client route is behind login ([client/src/Router.tsx:27](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/client/src/Router.tsx#L27)).

## Observability

- Morgan logs in dev format ([server/app.ts:83](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/app.ts#L83)). Each request also logs method, path, IP, and user agent ([server/app.ts:67-74](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/app.ts#L67-L74)).
- Correlation IDs are attached before other middleware ([server/app.ts:56-57](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/app.ts#L56-L57)).
- Production errors are reported through the GitHub error middleware ([server/app.ts:117-123](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/app.ts#L117-L123)).
- No metrics or alerting configuration appears in the excerpts. Unknown.

## Rate limits and caveats

- Production applies a general limiter and a stricter auth limiter on login and register ([server/app.ts:60-64](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/app.ts#L60-L64), [server/app.ts:90-91](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/app.ts#L90-L91)).
- The public share query limit (10 per hour per token) is held in process memory. It resets on restart and does not work across replicas ([server/services/publicQuery.service.ts:25-26](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/services/publicQuery.service.ts#L25-L26), [server/services/publicQuery.service.ts:45-54](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/server/services/publicQuery.service.ts#L45-L54)).

## Smoke test

```bash
LIFE_API_URL=https://life-api.jeffreykeyser.net \
LIFE_SMOKE_TOKEN=<pay-access-token> \
LIFE_SMOKE_JOURNAL_ID=1 \
LIFE_SMOKE_AUDIO_FIXTURE=/path/to/sample.webm \
npm --prefix server run smoke:voice-transcribe
```

Exit codes are 0, 1, and 2 as described in [docs/DEPLOYMENT.md:61-65](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/docs/DEPLOYMENT.md#L61-L65). The default timeout is 60s ([docs/DEPLOYMENT.md:69](https://github.com/Jeffrey-Keyser/Life/blob/e2171006c39ec539a94c1053414f833ccad2286f/docs/DEPLOYMENT.md#L69)).
