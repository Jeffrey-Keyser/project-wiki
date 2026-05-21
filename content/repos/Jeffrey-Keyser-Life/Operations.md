---
title: Operations
description: How Life runs in production — beelink host, systemd units, Cloudflare Tunnel, deploy script, smoke tests, and observability.
---

# Operations

Life is a deployed application, not a library. It runs as two systemd-managed Node processes on a self-hosted beelink mini-PC behind Cloudflare Tunnel ([docs/DEPLOYMENT.md:5-12](https://github.com/Jeffrey-Keyser/Life/blob/master/docs/DEPLOYMENT.md#L5-L12)).

## Production topology

- **API host**: `https://life-api.jeffreykeyser.net` → Express server on port 3026 ([CLAUDE.md:57-59](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L57-L59)).
- **Frontend host**: `https://life.jeffreykeyser.net` → `serve -s dist -l 3027` over the Vite build ([CLAUDE.md:56-58](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L56-L58)).
- **Ingress**: Cloudflare Tunnel routes public hostnames to the local ports ([CLAUDE.md:60](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L60)).
- **Database**: PostgreSQL 17 in Docker on the same host ([CLAUDE.md:61](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L61)).

## Systemd units

- `life-api.service` — runs `npm start` (which is `node ./dist/bin/www.js`) in `/server`, port 3026 ([CLAUDE.md:64-65](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L64-L65), [server/package.json:6](https://github.com/Jeffrey-Keyser/Life/blob/master/server/package.json#L6)).
- `life-frontend.service` — serves the static Vite build from `/client/dist`, port 3027 ([CLAUDE.md:65-66](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L65-L66)).
- Restart both: `sudo systemctl restart life-api life-frontend` — this is the last step of `deploy.sh` ([deploy.sh:34-36](https://github.com/Jeffrey-Keyser/Life/blob/master/deploy.sh#L34-L36)).

## Deploy

- Auto-deploy on push to `master` via the `beelink-deploy` listener (HMAC-validated against `BEELINK_DEPLOY_SECRET`) ([docs/DEPLOYMENT.md:21-25](https://github.com/Jeffrey-Keyser/Life/blob/master/docs/DEPLOYMENT.md#L21-L25)).
- Skip auto-deploy with `[skip deploy]` or `[no deploy]` in the commit message ([CLAUDE.md:83](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L83)).
- Manual deploy: `cd /home/jkeyser/Life && ./deploy.sh` ([CLAUDE.md:86-89](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L86-L89)).
- Frontend-only redeploy is documented as a separate sequence (npm install, Vite build with prod env vars, restart `life-frontend`) ([CLAUDE.md:92-98](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L92-L98)).

## Configuration

- Server runtime config lives in `server/.env` on the host ([docs/DEPLOYMENT.md:27-29](https://github.com/Jeffrey-Keyser/Life/blob/master/docs/DEPLOYMENT.md#L27-L29)).
- The shared `AI_PROXY_API_KEY` is hydrated from `/etc/ai-proxy/secrets.env` if not already set in the environment; precedence is: env var → shared secrets file → loud startup error from `validateEnv()` ([docs/DEPLOYMENT.md:35-47](https://github.com/Jeffrey-Keyser/Life/blob/master/docs/DEPLOYMENT.md#L35-L47)).
- Client config (`VITE_API_URL`, `VITE_PAY_URL`) is baked at Vite build time ([README.md:65-67](https://github.com/Jeffrey-Keyser/Life/blob/master/README.md#L65-L67)).

## Observability

- **HTTP logs**: Morgan in dev format ([server/app.ts:83](https://github.com/Jeffrey-Keyser/Life/blob/master/server/app.ts#L83)).
- **Structured logs**: Winston via `server/utils/logger.ts`; every line is tagged with the `requestId` from the `correlationId` middleware which is mounted first in the chain ([server/app.ts:56-57](https://github.com/Jeffrey-Keyser/Life/blob/master/server/app.ts#L56-L57), [server/app.ts:67-74](https://github.com/Jeffrey-Keyser/Life/blob/master/server/app.ts#L67-L74)).
- **GitHub error issues**: production-only middleware opens an Issue in the configured repo for unhandled exceptions ([server/app.ts:117-123](https://github.com/Jeffrey-Keyser/Life/blob/master/server/app.ts#L117-L123)).
- **Health check**: root-mounted `healthRouter` (`server/routes/health.ts`) provides a health endpoint at `/` ([server/app.ts:97](https://github.com/Jeffrey-Keyser/Life/blob/master/server/app.ts#L97)).
- **Diagnostics dashboard**: served from `/diagnostics` (API) and `/debug` (client), protected by the same access-token flow as the rest of the app ([server/app.ts:100](https://github.com/Jeffrey-Keyser/Life/blob/master/server/app.ts#L100), [README.md:55-56](https://github.com/Jeffrey-Keyser/Life/blob/master/README.md#L55-L56), [README.md:99](https://github.com/Jeffrey-Keyser/Life/blob/master/README.md#L99)).

## Smoke test

After deploy, run the production transcription smoke against `life-api.jeffreykeyser.net`:

```bash
LIFE_API_URL=https://life-api.jeffreykeyser.net \
LIFE_SMOKE_TOKEN=<pay-access-token> \
LIFE_SMOKE_JOURNAL_ID=1 \
LIFE_SMOKE_AUDIO_FIXTURE=/path/to/sample.webm \
npm --prefix server run smoke:voice-transcribe
```

Exit codes: `0` success, `1` transcription failure (upstream `traceId` is printed for ai-proxy log grep), `2` config error. Default timeout is 60s, overridable via `LIFE_SMOKE_TIMEOUT_MS` ([docs/DEPLOYMENT.md:49-71](https://github.com/Jeffrey-Keyser/Life/blob/master/docs/DEPLOYMENT.md#L49-L71)).

## Rate limiting and CORS

- Production applies a general rate limiter to all routes and a stricter `limiters.auth` on `/user/login` and `/user/register` ([server/app.ts:60-64](https://github.com/Jeffrey-Keyser/Life/blob/master/server/app.ts#L60-L64), [server/app.ts:90-91](https://github.com/Jeffrey-Keyser/Life/blob/master/server/app.ts#L90-L91)).
- CORS in production reads `productionConfig.cors`; dev allows `localhost:3000`, `:3001`, `:3002` with credentials ([server/app.ts:47-54](https://github.com/Jeffrey-Keyser/Life/blob/master/server/app.ts#L47-L54)).

## Database operations

- Stored procedures and schema are re-applied by `server/db/deploy.sh` on every deploy; `migrations/` is append-only, `schema/` and `stored_procedures/` are safe to re-apply ([docs/DEPLOYMENT.md:77-85](https://github.com/Jeffrey-Keyser/Life/blob/master/docs/DEPLOYMENT.md#L77-L85)).
- `./teardown.sh` exists for local-only DB resets and is destructive — drops all tables ([CLAUDE.md:51-53](https://github.com/Jeffrey-Keyser/Life/blob/master/CLAUDE.md#L51-L53)).
