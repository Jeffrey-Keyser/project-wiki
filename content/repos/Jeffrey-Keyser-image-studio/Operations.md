---
title: image-studio — Operations
description: Self-hosted Beelink deploy via systemd + Cloudflare Tunnel, with /health and /api/v1/diagnostics/deploy as the on-call signal.
---

# Operations

## Runtime topology

Self-hosted on a Beelink mini PC. Two systemd units, two ports, one Cloudflare Tunnel split-hostname routing pair ([README.md:124-134](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L124-L134), [CLAUDE.md:52-60](https://github.com/Jeffrey-Keyser/image-studio/blob/main/CLAUDE.md#L52-L60)).

| Surface | Unit | Port | Hostname |
|---|---|---|---|
| Express API | `image-studio` | 3001 (prod) / 3030 (dev verify) | `images-api.jeffreykeyser.net` |
| Static SPA | `image-studio-frontend` | 3002 | `images.jeffreykeyser.net` |

Note: `localhost:3030` is the dev-mode default the deploy-verify curl hits; production systemd unit listens on 3001 per README ([deploy.sh:46](https://github.com/Jeffrey-Keyser/image-studio/blob/main/deploy.sh#L46), [README.md:128](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L128)).

## Start commands

- Server prod: `node ./dist/bin/www.js` ([server/package.json:6](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/package.json#L6)).
- Server dev: `ts-node ./bin/www.ts` ([server/package.json:7](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/package.json#L7)).
- Client dev: `vite` ([client/package.json:29](https://github.com/Jeffrey-Keyser/image-studio/blob/main/client/package.json#L29)).
- Full deploy: `./deploy.sh` ([deploy.sh:1-39](https://github.com/Jeffrey-Keyser/image-studio/blob/main/deploy.sh#L1-L39)).

## Required env

- `DATABASE_HOST/NAME/USER/PASSWORD/PORT` — Postgres connection ([README.md:110-120](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L110-L120)).
- `S3_BUCKET`, `S3_REGION` — image storage ([README.md:99-108](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L99-L108)).
- `SESSION_SECRET`, `CORS_ALLOWED_ORIGINS`, `PAY_SERVICE_URL` — wired in `server/app.ts` ([server/app.ts:171-220](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L171-L220)).
- `PAY_SERVICE_TOKEN` — required only for `/api/v1/import`. If unset the route returns 503 and `imports.status` reports `not_configured` ([server/app.ts:76-81](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L76-L81), [README.md:148-153](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L148-L153)).
- `GITHUB_TOKEN` — must be present at install time for any directory pulling `@jeffrey-keyser/*` from GitHub Packages ([AGENTS.md:21-27](https://github.com/Jeffrey-Keyser/image-studio/blob/main/AGENTS.md#L21-L27)).
- `VITE_API_URL` — client must point at `https://images-api.jeffreykeyser.net` in prod; there is no same-origin `/api/*` proxy on the SPA host ([README.md:130-134](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L130-L134)).

## Observability

- **Liveness:** `GET /health` (lightweight) backed by `createDatabaseHealthCheck(pool)` ([server/app.ts:226-234](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L226-L234), [README.md:86](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L86)).
- **Deploy gate:** `GET /api/v1/diagnostics/deploy` — `status`, `build.buildSha/builtAt`, `database.{ok,latencyMs}`, `imports.status` ([README.md:142-153](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L142-L153)).
- **Full probe:** `GET /api/v1/diagnostics/detailed` (public; includes upstream Pay probe) ([README.md:84](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L84), [server/app.ts:95-99](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L95-L99)).
- **Logs:** `morgan` dev format via ESF preset; `console.error` per-request via `errorHandling.logger` ([server/app.ts:192-194](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L192-L194), [server/app.ts:268-282](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L268-L282)).
- **Auto-issue on error:** `githubErrorMiddleware({ repo: "Jeffrey-Keyser/image-studio" })` opens GitHub issues for unhandled errors ([server/app.ts:301-303](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L301-L303)).

## Failure modes / on-call

- **Deploy verification fails** → `deploy.sh` exits non-zero. Either backend never came up (15 curl attempts), or `build.buildSha` mismatch ([deploy.sh:42-65](https://github.com/Jeffrey-Keyser/image-studio/blob/main/deploy.sh#L42-L65)).
- **`imports.status = not_configured`** → `PAY_SERVICE_TOKEN` not set on the host. Not a deploy blocker; only `/api/v1/import` is degraded ([server/app.ts:74-81](https://github.com/Jeffrey-Keyser/image-studio/blob/main/server/app.ts#L74-L81), [README.md:148-153](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L148-L153)).
- **`401 unauthenticated` from `npm.pkg.github.com`** → `GITHUB_TOKEN` missing during install ([AGENTS.md:24-27](https://github.com/Jeffrey-Keyser/image-studio/blob/main/AGENTS.md#L24-L27)).
- **API calls to `images.jeffreykeyser.net/api/*`** → return SPA shell HTML, not JSON. Fix `VITE_API_URL` ([README.md:130-134](https://github.com/Jeffrey-Keyser/image-studio/blob/main/README.md#L130-L134)).
