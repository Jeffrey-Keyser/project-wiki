---
title: "image-studio — Operations"
description: "Start, deploy, test and health commands for image-studio, with documented versus verified runtime facts and known port and hostname conflicts."
---

# Operations

image-studio is a deployed web service, not a library. It has a server (`server/`) and a client (`client/`). Documented production topology comes from the README and CLAUDE. Verified facts come from scripts and code in the repository.

## Documented topology

- Backend unit `image-studio` and frontend unit `image-studio-frontend` ([README.md:L199-L200](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/README.md#L199-L200)).
- Ingress: `images.jeffreykeyser.net` goes to the frontend, and `images-api.jeffreykeyser.net` goes to the API. There is no same-origin `/api` proxy on the frontend host ([README.md:L201-L205](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/README.md#L201-L205)).
- **Port conflict (unknown in production).** README says the backend runs on port 3001 ([README.md:L199](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/README.md#L199)). CLAUDE says 3030 ([CLAUDE.md:L49](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/CLAUDE.md#L49)). The config default is 3001 ([server/config/env.ts:L90](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/config/env.ts#L90)). The live value is unknown.

## Commands

- **Server dev:** `npm install`, then `npm run dev`, which runs `ts-node ./bin/www.ts` ([server/package.json:L7](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/package.json#L7)).
- **Server build and start:** `npm run build` runs `tsc` to `dist` ([server/package.json:L8](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/package.json#L8), [server/tsconfig.json:L6](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/tsconfig.json#L6)). `npm start` runs `node ./dist/bin/www.js` ([server/package.json:L6](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/package.json#L6)).
- **Client dev and build:** `npm run dev` runs Vite on port 3002 ([client/package.json:L29](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/client/package.json#L29), [client/vite.config.js:L10](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/client/vite.config.js#L10)). `npm run build` runs `vite build` ([client/package.json:L30](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/client/package.json#L30)).
- **Tests:** server `npm test` runs `vitest run` ([server/package.json:L11](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/package.json#L11)). Client `npm test` runs `vitest --run` ([client/package.json:L32](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/client/package.json#L32)).
- **Deploy:** `./deploy.sh` pulls, builds, restarts, and verifies ([deploy.sh:L8-L39](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/deploy.sh#L8-L39)).

## Health and verification

- `GET /health` is a database health check ([server/app.ts:L233-L240](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/app.ts#L233-L240)). `GET /ping` returns `pong` ([server/routes/index.ts:L14-L16](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/index.ts#L14-L16)).
- `GET /api/v1/diagnostics/deploy` pings the database with `SELECT 1`. It returns `status` (`ok` or `degraded`), build metadata, and `imports.status` ([server/routes/diagnostics.ts:L74-L86](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/diagnostics.ts#L74-L86), [server/routes/diagnostics.ts:L223-L245](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/diagnostics.ts#L223-L245)).
- `GET /api/v1/diagnostics/detailed` is public and includes the upstream auth probe ([server/app.ts:L95-L96](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/app.ts#L95-L96), [README.md:L155](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/README.md#L155)).
- Deploy success requires `status` ok and a matching `buildSha`. A CORS check then runs ([deploy.sh:L57-L59](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/deploy.sh#L57-L59)).

## Configuration

- Database variables: `DATABASE_HOST`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_PORT` ([README.md:L185-L191](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/README.md#L185-L191)).
- Required fields include `SESSION_SECRET`, `JWT_SECRET`, and `PAY_SERVICE_URL`. The process fails if they are missing or still set to the placeholder ([server/config/env.ts:L149-L173](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/config/env.ts#L149-L173)).
- `PAY_SERVICE_TOKEN` gates import. Without it, `/api/v1/import` returns 503 ([server/middleware/serviceAuth.ts:L31-L37](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/middleware/serviceAuth.ts#L31-L37)).
- `SOLO_VAULT_TOKEN` is required for generation ([server/services/soloVault.ts:L16-L18](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/soloVault.ts#L16-L18)).
- `VITE_API_URL` must point at the API host ([README.md:L205](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/README.md#L205)).
- Storyboard writes are disabled when `IMAGE_STUDIO_STORYBOARD_WRITES_ENABLED` is `false` ([server/routes/versions/v1/storyboards.ts:L12-L16](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/routes/versions/v1/storyboards.ts#L12-L16)).

## Observability

- Generation state changes emit structured JSON log lines ([server/services/generationService.ts:L60-L71](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/services/generationService.ts#L60-L71)).
- Unhandled errors are logged with method and path ([server/app.ts:L274-L280](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/app.ts#L274-L280)). A GitHub issue middleware is registered for the repo ([server/app.ts:L308](https://github.com/Jeffrey-Keyser/image-studio/blob/cc09e9afb77781ab37b1237f3341edbe1e5425f9/server/app.ts#L308)).
- Log shipping and alerting are unknown.

## Documented versus verified

- **Verified in source:** scripts, route paths, health and deploy checks, and config defaults.
- **Documented only:** the systemd units, Cloudflare routes, webhook, and uptime monitors.
- **Not verified:** whether the deployed hostnames match the README, and whether AI Proxy is reachable from production.
