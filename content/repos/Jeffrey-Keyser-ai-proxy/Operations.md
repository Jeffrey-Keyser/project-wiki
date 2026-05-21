---
title: Operations
description: Runtime, deploy, logs, and health probes for the self-hosted AI Proxy service.
---

# Operations

AI Proxy is a deployable HTTP service — not a library. It runs as a long-lived Node process on a homelab box.

## Runtime

- **Start command:** `node ./dist/bin/www.js` (from `server/`) ([server/package.json:6](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/package.json#L6), [CLAUDE.md:184](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/CLAUDE.md#L184)).
- **Process manager:** systemd user unit `ai-proxy` ([CLAUDE.md:182](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/CLAUDE.md#L182)).
- **Port:** `3001`, configurable via `PORT` env var ([CLAUDE.md:180](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/CLAUDE.md#L180), [README.md:113](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L113)).
- **Host:** Beelink ME Mini N150 (Ubuntu Server) since January 2026 ([CLAUDE.md:159-161](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/CLAUDE.md#L159-L161)).
- **Public URL:** `https://ai-proxy.jeffreykeyser.net` via Cloudflare Tunnel ([CLAUDE.md:181](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/CLAUDE.md#L181)).

## Deploy

The current path is a manual build + restart on the host:

```bash
cd server && npm run build
systemctl --user restart ai-proxy
systemctl --user status ai-proxy
```

([CLAUDE.md:163-176](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/CLAUDE.md#L163-L176))

The legacy AWS Lambda/ECR/CloudFront/Terraform path is preserved in `terraform/` and `.github/workflows/` as **reference only**; the service no longer deploys to AWS ([CLAUDE.md:188-189](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/CLAUDE.md#L188-L189)).

## Configuration

Env loaded and validated through `server/config/env.ts`; both `DATABASE_*` and legacy `DB_*` variable names are accepted ([CLAUDE.md:313-318](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/CLAUDE.md#L313-L318)). Required: `PAY_SERVICE_URL`, `OPENAI_API_KEY`, `SESSION_SECRET`, `JWT_SECRET`, plus DB credentials ([README.md:110-132](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L110-L132)).

The server logs a startup banner with `NODE_ENV`, `PORT`, `ORIGIN_BASE_URL`, and `PAY_SERVICE_URL`, which is the first thing to check in journal output ([server/app.ts:35-42](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L35-L42)).

## Health and observability

- **Health probe:** `GET /health` returns service + DB status via `createDatabaseHealthCheck(pool)` ([server/app.ts:111-112](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L111-L112), [server/app.ts:164-173](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L164-L173)).
- **Detailed diagnostics:** `GET /v1/diagnostics/detailed` is mounted public for system checks ([server/app.ts:74-75](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L74-L75)).
- **Ping:** `GET /ping` for shallow liveness ([README.md:19](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L19)).
- **Correlation IDs:** every request is stamped before any other middleware ([server/app.ts:250-253](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L250-L253)).
- **Logs:** `journalctl --user -u ai-proxy -f` ([CLAUDE.md:174-176](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/CLAUDE.md#L174-L176)).
- **Error → GitHub:** uncaught errors automatically become issues on this repo via `githubErrorMiddleware` ([server/app.ts:272-274](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L272-L274)).

## Known gotchas

- **QUIC/HTTP3 vs long image-generation responses.** Cloudflare HTTP/3 has been disabled for the zone because 30–55s base64 image responses trigger `ERR_QUIC_PROTOCOL_ERROR.QUIC_TOO_MANY_RTOS`. Defense in depth: `connectTimeout: 120s`, `keepAliveTimeout: 120s` on the AI Proxy ingress rule in `/etc/cloudflared/config.yml` ([README.md:282-292](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/README.md#L282-L292)).
- **Auth class identity across packages.** Pay-auth raises errors from `@jeffrey-keyser/api-errors`, which the factory cannot match by `instanceof`. Custom handlers by constructor name preserve 401/403 mapping ([server/app.ts:224-247](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L224-L247)).
- **JSON body limit raised to 10mb** for vision/image base64 payloads ([server/app.ts:134-135](https://github.com/Jeffrey-Keyser/ai-proxy/blob/main/server/app.ts#L134-L135)).
