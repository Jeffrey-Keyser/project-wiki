---
title: "Ping Operations"
description: "Start, deploy, test, and health commands for Ping, with documented versus verified runtime notes."
---

# Operations

Ping is a deployed application, not a library. It has a server entry point and a web client, and the excerpts show no published package API.

## Start commands

- **Server production:** `npm start` runs `node ./dist/bin/www.js` ([server/package.json:L7](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L7)). The build runs `tsc`, then copies a `templates` directory into `dist` ([server/package.json:L9](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L9)).
- **Server development:** `npm run dev` runs `ts-node ./bin/www.ts` ([server/package.json:L8](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L8)). The port defaults to 3001 when `PORT` is unset ([server/config/env.ts:L103](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/config/env.ts#L103)).
- **Client development:** `npm run dev` runs Vite on port 3002 ([client/package.json:L38](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/package.json#L38), [client/vite.config.js:L21](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/vite.config.js#L21)).
- **Client build:** `npm run build` runs `vite build` ([client/package.json:L39](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/package.json#L39)).

## Test commands

- `npm test` in `server/` runs Vitest once ([server/package.json:L14](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L14)).
- `npm run test:integration` in `server/` uses the integration config ([server/package.json:L17](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L17)). The integration suite for the API key helper runs the executable adapter through `ts-node` against the isolated database ([server/tests/integration/api-key-generation.test.ts](https://github.com/Jeffrey-Keyser/ping/blob/50c5a050885a5c2ddb4b79cd32cb387947b4c73b/server/tests/integration/api-key-generation.test.ts)).
- `npm run test` in `client/` runs Vitest with jsdom ([client/package.json:L41](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/package.json#L41), [client/vitest.config.ts:L9](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/vitest.config.ts#L9)).

## Grocery zone provisioning

This is a manual bulk command, not a service. It is run from `server/` with both `--user-id` and `--zones-file` ([README.md:L80](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L80)). Missing or invalid input prints help and performs no writes ([server/scripts/groceryZoneProvisioning.ts:L4-L18](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/scripts/groceryZoneProvisioning.ts#L4-L18)). The README recommends creating zones on the Map page for normal setup ([README.md:L97](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L97)).

## API key credential helper

This is a manual operator command, not a service. It creates exactly one API credential for one explicitly selected existing account. Run it from `server/`:

```bash
npx ts-node --project tsconfig.json scripts/gen-key.ts --user-id 42
```

The account id is illustrative only. There is no default account, so `--user-id` must be supplied exactly once with a positive safe integer ([server/scripts/apiKeyGeneration.ts](https://github.com/Jeffrey-Keyser/ping/blob/50c5a050885a5c2ddb4b79cd32cb387947b4c73b/server/scripts/apiKeyGeneration.ts), [README.md](https://github.com/Jeffrey-Keyser/ping/blob/50c5a050885a5c2ddb4b79cd32cb387947b4c73b/README.md)).

- Missing, malformed, repeated, or unknown arguments exit nonzero with help text and create no credential. `--help` exits zero without account lookup or writes ([server/scripts/apiKeyGeneration.ts](https://github.com/Jeffrey-Keyser/ping/blob/50c5a050885a5c2ddb4b79cd32cb387947b4c73b/server/scripts/apiKeyGeneration.ts)).
- The selected account is resolved first through `UsersDal.getUserById`. A missing account or a lookup failure exits nonzero and creates no credential ([server/scripts/apiKeyGeneration.ts](https://github.com/Jeffrey-Keyser/ping/blob/50c5a050885a5c2ddb4b79cd32cb387947b4c73b/server/scripts/apiKeyGeneration.ts)).
- On success, one credential is created for that account through `ApiKeyService.createApiKeyForUser` with the neutral label `operator-generated`. A `NEW_API_KEY` event is logged with the account id ([server/scripts/gen-key.ts](https://github.com/Jeffrey-Keyser/ping/blob/50c5a050885a5c2ddb4b79cd32cb387947b4c73b/server/scripts/gen-key.ts), [server/scripts/apiKeyGeneration.ts](https://github.com/Jeffrey-Keyser/ping/blob/50c5a050885a5c2ddb4b79cd32cb387947b4c73b/server/scripts/apiKeyGeneration.ts)).
- Existing active credentials, including those of other accounts, are left unchanged ([server/tests/integration/api-key-generation.test.ts](https://github.com/Jeffrey-Keyser/ping/blob/50c5a050885a5c2ddb4b79cd32cb387947b4c73b/server/tests/integration/api-key-generation.test.ts)).
- The earlier version of `gen-key.ts` hard-coded user id 1 and a `Generated-2026-01-31` label. That behavior was removed in this change ([server/scripts/gen-key.ts](https://github.com/Jeffrey-Keyser/ping/blob/50c5a050885a5c2ddb4b79cd32cb387947b4c73b/server/scripts/gen-key.ts)).

For normal setup, sign in and open Setup to view your API key. No command run is needed ([README.md](https://github.com/Jeffrey-Keyser/ping/blob/50c5a050885a5c2ddb4b79cd32cb387947b4c73b/README.md)).

## Deploy

- Push to `main` triggers `deploy.sh` via the webhook ([README.md:L63](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L63)).
- The script pulls, builds the server and client, applies three migration helpers, writes a release marker, and restarts `ping` and `ping-frontend` ([deploy.sh:L8-L45](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/deploy.sh#L8-L45)).
- The script's health probe checks `127.0.0.1:3020/health` and `127.0.0.1:3021/` ([deploy.sh:L48](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/deploy.sh#L48)). The production `PORT` value is not in the excerpts, so the link between those probe ports and the server config is unknown.
- systemd unit files are not in the repo. The unit names appear only in `deploy.sh` ([deploy.sh:L44-L45](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/deploy.sh#L44-L45)).

## Health and probes

- `/health` is configured by the server factory with a database check ([server/app.ts:L206-L212](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L206-L212)).
- `/ping` returns `pong` ([server/routes/index.ts:L14-L16](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/routes/index.ts#L14-L16)).
- `GET /api/v1/connectivity` checks that `X-Ping-Key` is present, not that it is valid ([server/routes/connectivity.ts:L8](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/routes/connectivity.ts#L8)).
- `GET /api/v1/diagnostics/detailed` is public and reports publisher and subscriber state ([server/app.ts:L93](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L93), [server/routes/diagnostics.ts:L126-L130](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/routes/diagnostics.ts#L126-L130)).

## Observability

- Logs use pino. `LOG_LEVEL` sets the level, and development uses pretty output ([server/logger.ts:L6-L16](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/logger.ts#L6-L16)).
- Each request gets a child logger with a request ID ([server/middleware/requestLogger.ts:L9-L12](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/middleware/requestLogger.ts#L9-L12)).
- Endpoint telemetry is wired through `telemetryMiddleware` ([server/app.ts:L293](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L293)). Its middleware body is not in the excerpts.
- Runtime incident capture is controlled by environment flags, as described in the README ([README.md:L142-L144](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L142-L144)).

## Configuration and limits

- Required variables are the Pay URL, two secrets, the origin list, and the origin base URL ([server/config/env.ts:L176](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/config/env.ts#L176)). `PING_API_KEY` is optional and legacy ([server/config/env.ts:L169-L170](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/config/env.ts#L169-L170)).
- The rate limit is 200 requests per minute ([server/app.ts:L156-L159](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L156-L159)).
- CORS allows `X-Ping-Key` ([server/app.ts:L166](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/app.ts#L166)).
- Terraform (Lambda, RDS, S3, CloudFront) is documented as unused fallback ([README.md:L139](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L139)).

## Documented versus verified

- **Verified in source:** the scripts, the health route, the deploy steps, the API key helper argument rules, and the config rules above.
- **Documented only:** the Beelink host, Cloudflare routing, the webhook, and the release marker's use by incident reporting.
- **Unknown from excerpts:** the production `PORT`, systemd unit contents, webhook setup, and whether Analytics Pulse or the incident transport is live.
