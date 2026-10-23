---
title: "Operations"
description: "Start, deploy, test, health, and observability for Insta Travel Map, separating documented behavior from behavior verified in source."
---

# Operations

Insta Travel Map is a deployed application, not a library. The root `package.json` excerpt has no scripts or exports, and the runnable units are the server and client packages ([package.json:L1-L14](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/package.json#L1-L14), [server/package.json:L5-L14](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/package.json#L5-L14)).

## Commands

- **Server dev**: `cd server && npm run dev` ([server/package.json:L7](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/package.json#L7)).
- **Server build and start**: `npm run build` runs `tsc`, and `npm start` runs `node ./dist/bin/www.js` ([server/package.json:L6, L8](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/package.json#L6-L8)). `build_and_run_server.sh` chains these ([build_and_run_server.sh:L2](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/build_and_run_server.sh#L2)).
- **Server test**: `npm test` runs Jest ([server/package.json:L11](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/package.json#L11)).
- **Client**: `npm run dev` (Vite), `npm run build`, and `npm run test` (Vitest) ([client/package.json:L45-L48](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/client/package.json#L45-L48)).
- **Database**: `cd server/db && ./deploy.sh` ([CLAUDE.md:L60-L62](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/CLAUDE.md#L60-L62)). `teardown.sh` asks for confirmation before running teardown SQL ([server/db/teardown.sh:L14-L18](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/db/teardown.sh#L14-L18)).

The README's `npm run test:e2e` and `npm run test:auth` are not among the client scripts in the excerpt, so they are documented but unverified ([README.md:L308-L314](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/README.md#L308-L314), [client/package.json:L44-L54](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/client/package.json#L44-L54)).

## Runtime and ports

- **Entrypoint**: `server/bin/www.ts` listens on `config.PORT` and handles `EADDRINUSE` by exiting ([server/bin/www.ts:L49-L74](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/bin/www.ts#L49-L74)).
- **Port values conflict**: the config default is `3001` ([server/config/env.ts:L40](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/config/env.ts#L40)). The README production example uses `PORT=3002` ([README.md:L103](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/README.md#L103)), and Vite dev also uses `3002` ([client/vite.config.js:L7](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/client/vite.config.js#L7)). The live port is unknown.
- **Systemd**: the README gives a unit example for `/etc/systemd/system/insta-travel-map.service` with `Restart=on-failure` ([README.md:L54-L72](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/README.md#L54-L72)). This is documented only.
- **Ingress**: Cloudflare Tunnel points at `http://localhost:<PORT>` ([README.md:L74](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/README.md#L74)). This is documented only.
- **Shutdown**: SIGTERM and SIGINT close the server, with a forced exit after 10 seconds ([server/bin/www.ts:L80-L97](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/bin/www.ts#L80-L97)).
- **Vault failures**: missing bootstrap keys or unreachable vault exit the process ([server/config/vault.ts:L63-L71](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/config/vault.ts#L63-L71), [server/config/vault.ts:L92-L96](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/config/vault.ts#L92-L96)).

## Health and observability

- **Health**: the factory mounts `/health` with a database check ([server/app.ts:L244-L252](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/app.ts#L244-L252)). A custom interceptor also answers `/health` with a simple healthy payload ([server/app.ts:L356-L360](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/app.ts#L356-L360)). Which handler wins at runtime is unverified.
- **Ping**: `GET /ping` returns `pong` ([server/routes/index.ts:L14-L16](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/routes/index.ts#L14-L16)).
- **Auth health**: the README mentions `/health/auth`, but those lines are not in the excerpt, so it is unverified.
- **Logs**: production uses JSON logs at `info`, and development uses text at `debug`. Sensitive headers and body fields are redacted ([server/app.ts:L167-L172](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/app.ts#L167-L172)).
- **Request IDs and rate limits**: `x-request-id` is enabled, and rate limiting is 100 per window in production and 500 otherwise, skipping `/health` and `/ping` ([server/app.ts:L149-L164](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/app.ts#L149-L164)).
- **Errors**: production errors are logged as `API_ERROR` JSON and sent to the GitHub error issue service ([server/app.ts:L296-L327](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/app.ts#L296-L327)).
- **Docs**: Swagger UI is enabled outside test mode ([server/app.ts:L254-L256](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/app.ts#L254-L256)).
- **Monitoring metrics**: the README describes auth metrics ([README.md:L329-L336](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/README.md#L329-L336)), but no implementation appears in the excerpts.

## Known drift

- The root route returns the title `Myrrs API` ([server/routes/index.ts:L6-L10](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/routes/index.ts#L6-L10)), while the health and Swagger titles say Insta Travel Map ([server/app.ts:L247](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/app.ts#L247)).
- Some pool comments still refer to Lambda ([server/config/env.ts:L69](https://github.com/Jeffrey-Keyser/insta-travel-map/blob/e5887e273f84c43fe656071dccb23f3d3df3da2b/server/config/env.ts#L69)). Production is documented as Beelink systemd.
