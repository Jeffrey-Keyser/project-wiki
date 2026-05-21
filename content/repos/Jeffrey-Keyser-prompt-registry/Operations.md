---
title: Operations
description: How prompt-registry is deployed, started, observed, and recovered on the Beelink homelab.
---

# Operations

This is a deployable service, not a library. It runs as a single systemd unit on the Beelink homelab and is exposed publicly through a Cloudflare Tunnel — no AWS, no Lambda, no Terraform required ([CLAUDE.md:5-7](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L5-L7)).

## Runtime

- **Entrypoint**: `node ./dist/bin/www.js` via `npm start` ([server/package.json:6](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/package.json#L6)).
- **Port**: from `config.PORT`; local dev defaults to `3001` ([server/bin/www.ts:20-24](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/bin/www.ts#L20-L24), [README.md:196-197](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/README.md#L196-L197)).
- **Node**: requires Node `>=20.0.0`, npm `>=10.0.0` ([server/package.json:62-64](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/package.json#L62-L64)).
- **Process model**: single Express process; RabbitMQ is connected once at boot before `app.listen` ([server/bin/www.ts:17-21](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/bin/www.ts#L17-L21)).

## Systemd unit

`prompt-registry.service` ships in the repo and is installed under `/etc/systemd/system/` ([prompt-registry.service:1-16](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/prompt-registry.service#L1-L16), [CLAUDE.md:9-13](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L9-L13)):

- User: `jkeyser`
- WorkingDirectory: `/home/jkeyser/prompt-registry/server`
- ExecStart: `/usr/bin/npm start`
- Restart: `on-failure`, 10 s backoff
- NODE_ENV=production

Common commands:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now prompt-registry
sudo systemctl status  prompt-registry
sudo systemctl restart prompt-registry
sudo journalctl -u prompt-registry -f
```

([CLAUDE.md:9-17](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L9-L17)).

## Deploy

1. Pull `main` on the homelab.
2. `cd server && npm run build` to compile TypeScript into `dist/`.
3. `sudo systemctl restart prompt-registry` ([CLAUDE.md:218-220](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L218-L220)).

No build artifact is shipped through CI — CI only runs install/lint/tests on PRs ([.github/workflows/ci-cd-pipeline.yml:9-40](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/.github/workflows/ci-cd-pipeline.yml#L9-L40)).

## Observability

- **Logs**: stdout via `morgan` "dev" format ([server/app.ts:63-65](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/app.ts#L63-L65)), captured by journald under the unit.
- **Health**: `GET /health` runs a Postgres ping injected via `createDatabaseHealthCheck(pool)` ([server/app.ts:37](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/app.ts#L37), [server/app.ts:75-83](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/app.ts#L75-L83)).
- **Diagnostics**: `GET /api/v1/diagnostics/detailed` ([CLAUDE.md:48](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L48)).
- **Telemetry hook**: `server/services/telemetry.ts` is the in-repo hook for any custom signals.

## Access control & rate limits

No authentication exists; rate-limit-only ([server/app.ts:71-73](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/app.ts#L71-L73)):

- Reads (GET): 100 rpm per IP.
- Writes (POST/PUT/DELETE/PATCH): 20 rpm per IP.
- Keyed by `CF-Connecting-IP`, falling back to `req.ip` ([server/middleware/rateLimiting.ts:8-46](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/middleware/rateLimiting.ts#L8-L46)).
- 429 responses use a JSON envelope with `code: TOO_MANY_REQUESTS` ([server/middleware/rateLimiting.ts:20-26](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/middleware/rateLimiting.ts#L20-L26)).

If multi-tenant auth becomes a requirement, README and `server/app.ts` must change together ([README.md:306-307](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/README.md#L306-L307)).

## Disaster recovery

- Data lives in PostgreSQL on the homelab. Schema reapply: `cd server/db && ./deploy.sh` ([CLAUDE.md:36-38](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L36-L38)).
- Destructive teardown is available via `./teardown.sh` — to be used with care ([CLAUDE.md:50-52](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L50-L52)).
