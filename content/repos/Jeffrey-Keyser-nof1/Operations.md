---
title: "nof1 Operations"
description: "Start, build, deploy, test, and health-check commands for nof1, with notes on what is documented versus verified in source."
---

# Operations

nof1 is an application, not a library. It has an API server and a client build, both run as services on a host.

## Commands

**Server** ([server/package.json:L6-L15](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/package.json#L6-L15)):

- Start the built server with `npm start`, which runs `dist/bin/www.js`.
- Develop with `npm run dev`, which runs `bin/www.ts` under ts-node.
- Build with `npm run build`, which runs `tsc`.
- Test with `npm test`, which runs Vitest.

**Client** ([client/package.json:L24-L29](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/client/package.json#L24-L29)):

- `npm run dev` starts Vite, `npm run build` builds, and `npm test` runs Vitest once.

**Host** ([CLAUDE.md:L21-L24](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/CLAUDE.md#L21-L24)): The documented restart commands are `systemctl restart nof1-api` and `nof1-frontend`. These are documented; the unit files are not in the excerpts.

## Deploy

`./deploy.sh` pulls `main`, installs and builds both packages, and restarts both services ([deploy.sh:L7-L26](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/deploy.sh#L7-L26)). Build errors are swallowed ([deploy.sh:L13](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/deploy.sh#L13)). Database migrations are not run by this script ([db/deploy.sh:L5-L14](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/db/deploy.sh#L5-L14)).

## Health and diagnostics

- `GET /health` is enabled with a database check ([server/app.ts:L106-L114](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/app.ts#L106-L114)).
- `GET /api/v1/diagnostics` returns service name, version, and timestamp ([server/routes/versions/v1/index.ts:L24-L33](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/routes/versions/v1/index.ts#L24-L33)).
- The API root points to `/api-docs` ([server/routes/index.ts:L15-L20](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/routes/index.ts#L15-L20)).

## Observability

- Logs use pino, with pretty output only in development ([server/logger.ts:L5-L17](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/logger.ts#L5-L17)).
- Requests get a correlation ID, and errors are logged with method and path ([server/app.ts:L145-L156](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/app.ts#L145-L156)).
- Rate limiting is 200 requests per minute per configured window ([server/app.ts:L65-L68](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/server/app.ts#L65-L68)).

## Documented versus verified

- **Verified in source:** ports, health path, startup seeding, and the deploy steps.
- **Documented only:** public URLs and Cloudflare routing ([CLAUDE.md:L5-L8](https://github.com/Jeffrey-Keyser/nof1/blob/bc081ecf9abd6052e7831723fe99a7d99e2dde79/CLAUDE.md#L5-L8)).
- **Unknown:** live uptime, alerting, log destinations, and CI.
