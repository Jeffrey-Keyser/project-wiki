---
title: Ping Operations
description: Deploy, runtime, observability, and on-call notes for the self-hosted Ping service.
---

# Operations

## Hosting

Production runs on a Beelink mini PC, exposed publicly via Cloudflare Tunnel ([README.md:34-37](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L34-L37)).

## Start commands

- **Server prod** — `npm start` → `node ./dist/bin/www.js` after `npm run build` (which compiles TS and copies `templates/` to `dist/`) ([server/package.json:7-10](https://github.com/Jeffrey-Keyser/ping/blob/main/server/package.json#L7-L10)).
- **Server dev** — `npm run dev` → `ts-node ./bin/www.ts`, default port 3001 ([server/package.json:8](https://github.com/Jeffrey-Keyser/ping/blob/main/server/package.json#L8), [README.md:57](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L57)).
- **Client dev** — `vite` on :3002 ([client/package.json:37](https://github.com/Jeffrey-Keyser/ping/blob/main/client/package.json#L37), [README.md:58](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L58)).
- **Client prod** — `vite build`, static output served by `ping-frontend` systemd unit ([client/package.json:38](https://github.com/Jeffrey-Keyser/ping/blob/main/client/package.json#L38), [deploy.sh:27](https://github.com/Jeffrey-Keyser/ping/blob/main/deploy.sh#L27)).

## systemd

`deploy.sh` runs `sudo systemctl restart ping` and `sudo systemctl restart ping-frontend` ([deploy.sh:25-27](https://github.com/Jeffrey-Keyser/ping/blob/main/deploy.sh#L25-L27)). Unit files live on the Beelink, not in the repo.

## Deploy flow

1. Push to `main` ([README.md:61-63](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L61-L63)).
2. `beelink-deploy` webhook invokes `deploy.sh`: `git pull origin main`, `npm install && npm run build` for both `server/` and `client/`, then restart both units ([deploy.sh:1-29](https://github.com/Jeffrey-Keyser/ping/blob/main/deploy.sh#L1-L29)).

## Health & probes

- `/health` returns service status; includes a Postgres connectivity check via `createDatabaseHealthCheck(pool)` ([server/app.ts:142](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L142), [server/app.ts:201-209](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L201-L209)).
- Diagnostics: `GET /api/v1/diagnostics/detailed` (public) ([server/app.ts:93](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L93)).
- Connectivity: `GET /api/v1/connectivity` confirms `X-Ping-Key` is reaching the box ([server/app.ts:105](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L105)).

## Observability

- **Structured logs** — Pino, configured at boot with key config fields (NODE_ENV, port, origin, Pay URL, whether `PING_API_KEY` set) ([server/app.ts:57-64](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L57-L64), [server/logger.ts](https://github.com/Jeffrey-Keyser/ping/blob/main/server/logger.ts)).
- **Request logger** — Pino child logger keyed by correlation ID attached to every request ([server/middleware/requestLogger.ts](https://github.com/Jeffrey-Keyser/ping/blob/main/server/middleware/requestLogger.ts), [server/app.ts:285](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L285)).
- **Telemetry** — fire-and-forget endpoint-hit counts to Analytics Pulse ([server/app.ts:283](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L283), [server/services/telemetry.ts](https://github.com/Jeffrey-Keyser/ping/blob/main/server/services/telemetry.ts)).
- **Error → GitHub issues** — `githubErrorMiddleware` opens issues from uncaught errors ([server/app.ts:8](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L8)).

## Configuration

- Single source: `server/config/env.ts` validates env at boot ([CLAUDE.md:337-347](https://github.com/Jeffrey-Keyser/ping/blob/main/CLAUDE.md#L337-L347)).
- Required: `PAY_SERVICE_URL`, `SESSION_SECRET`, `CORS_ALLOWED_ORIGINS`, `PING_API_KEY`, `DATABASE_*` ([server/app.ts:160-194](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L160-L194)).
- `GITHUB_TOKEN` required for any npm install touching `@jeffrey-keyser/*` ([AGENTS.md:20-28](https://github.com/Jeffrey-Keyser/ping/blob/main/AGENTS.md#L20-L28)).

## Rate limits and CORS

- Rate limit: 200 req/min (raised from default 60 for SPA bursts) ([server/app.ts:155-158](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L155-L158)).
- CORS allow-list from `CORS_ALLOWED_ORIGINS`; allowed headers include `X-Ping-Key` ([server/app.ts:161-166](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L161-L166)).

## Terraform / Lambda

Lambda + RDS + S3 + CloudFront Terraform stack retained as fallback only; not the live deploy path ([README.md:113-116](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L113-L116), [server/lambda.ts](https://github.com/Jeffrey-Keyser/ping/blob/main/server/lambda.ts)).
