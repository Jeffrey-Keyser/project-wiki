---
title: "Operations"
description: "How Prompt Registry is started, deployed, health-checked, and observed; documented versus verified runtime facts."
---

# Operations

Prompt Registry is a deployable service, not a library. CLAUDE.md documents a systemd unit on the Beelink homelab behind Cloudflare Tunnel, with no AWS, Lambda, or Terraform required ([CLAUDE.md:L5-L9](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/CLAUDE.md#L5-L9), [CLAUDE.md:L155](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/CLAUDE.md#L155)). This snapshot shows the unit and scripts. It does not show the live host, tunnel config, or environment file.

## Start commands

- Production entry: `npm start` in `server`, which runs `node ./dist/bin/www.js` ([server/package.json:L6](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/package.json#L6), [server/package.json:L8](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/package.json#L8)).
- Development: `npm run dev` runs `ts-node ./bin/www.ts` ([server/package.json:L7](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/package.json#L7)).
- The root `npm start` delegates to `server` ([package.json:L7-L9](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/package.json#L7-L9)).

## Systemd unit

The unit runs `/usr/bin/npm start` from `/home/jkeyser/prompt-registry/server` as user `jkeyser`, with `Restart=on-failure`, `RestartSec=10`, and `NODE_ENV=production` ([prompt-registry.service:L6-L13](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/prompt-registry.service#L6-L13)).

```bash
sudo cp prompt-registry.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now prompt-registry
sudo systemctl status prompt-registry
sudo journalctl -u prompt-registry -f
```

([CLAUDE.md:L11-L21](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/CLAUDE.md#L11-L21)).

The unit does not set `PORT`. `config/env.ts` defaults it to 3001 ([server/config/env.ts:L54](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/config/env.ts#L54)), while `deploy.sh` probes port 3002 by default ([deploy.sh:L10](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/deploy.sh#L10)). **The effective port on the homelab is unknown.**

## Deploy

- Documented manual steps: build, copy, restart ([CLAUDE.md:L253-L256](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/CLAUDE.md#L253-L256)).
- Repo script `deploy.sh`: `git pull origin main`, `npm ci --include=dev`, build, stop, free the port with `fuser -k`, start, then poll `/health` for up to 45 seconds ([deploy.sh:L17-L46](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/deploy.sh#L17-L46)). The `fuser` step kills any process on the port.
- CI does not build or ship an artifact ([.github/workflows/ci-cd-pipeline.yml:L9-L12](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/.github/workflows/ci-cd-pipeline.yml#L9-L12)).

## Test and health

- Tests: `npm test` in `server` ([server/package.json:L11](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/package.json#L11)). CI behavior is described in [Iteration Loop](../iteration-loop/).
- Health: `GET /health` returns status with a database check ([server/app.ts:L78-L86](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/app.ts#L78-L86)). `/ping` returns `pong` ([server/routes/index.ts:L14-L16](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/routes/index.ts#L14-L16)).
- Database health is degraded above 1 second and unhealthy on connection failure ([server/domain/services/DatabaseHealthCheck.ts:L20-L26](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/domain/services/DatabaseHealthCheck.ts#L20-L26)).

## Observability

- Logs go to stdout. Startup logs port and origin ([server/app.ts:L23-L29](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/app.ts#L23-L29)). Request logging uses the `dev` format ([server/app.ts:L63-L65](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/app.ts#L63-L65)). journald capture is documented, not verified.
- `GET /api/v1/diagnostics/detailed` returns backend and database status ([server/routes/diagnostics.ts:L82-L93](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/routes/diagnostics.ts#L82-L93)). Memory is degraded above 500 MB and critical above 1 GB ([server/domain/value-objects/Memory.ts:L52-L53](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/domain/value-objects/Memory.ts#L52-L53)).
- Telemetry emits to Analytics Pulse when called ([server/services/telemetry.ts:L15-L25](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/services/telemetry.ts#L15-L25)).

## Runtime versions

The server requires Node `>=20.0.0` ([server/package.json:L62](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/package.json#L62)). The Nix pilot document says production uses `/usr/bin/node` 24 and that version pins elsewhere specify older Node ([docs/nix-development.md:L3-L7](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/docs/nix-development.md#L3-L7)). The homelab's actual Node version is unverified.

## Database and recovery

- Schema is applied with `cd server/db && ./deploy.sh` ([CLAUDE.md:L56-L58](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/CLAUDE.md#L56-L58)). Full version tables are not in the excerpt.
- `teardown.sh` deletes data after confirmation ([server/db/teardown.sh:L14-L18](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/db/teardown.sh#L14-L18)). Backup and restore procedures are unknown.
- `bastion_conn.sh` contains an AWS SSM port-forward to a database host ([bastion_conn.sh:L1](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/bastion_conn.sh#L1)). Its current use is unknown.

## Rate limits and access

No authentication. Reads are capped at 100 per minute and writes at 20 per minute, both per IP ([server/middleware/rateLimiting.ts:L28-L46](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/middleware/rateLimiting.ts#L28-L46)). JSON bodies are capped at 1mb ([server/app.ts:L66-L69](https://github.com/Jeffrey-Keyser/prompt-registry/blob/b7f7231f81a8c395e85de5d77c5d0f477e443daa/server/app.ts#L66-L69)).
