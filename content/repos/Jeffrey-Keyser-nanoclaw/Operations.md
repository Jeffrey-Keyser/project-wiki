---
title: Operations
description: How to run, deploy, observe, and recover NanoClaw in production.
---

# Operations

NanoClaw is a deployable, long-running Node service. It is not a library: `package.json` declares `"main": "dist/index.js"`, ships a `bin` entry, and the README documents systemd / launchd lifecycles ([package.json:6-9](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L6-L9), [CLAUDE.md:79-90](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L79-L90)).

## Start command

- **Production:** `npm start` → `node dist/index.js` ([package.json:15](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L15)).
- **Dev:** `npm run dev` → `tsx src/index.ts` ([package.json:14](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L14), [CLAUDE.md:48](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L48)).
- **Build path:** `npm run build` runs `build:core` then `reload-service` ([package.json:11](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L11)).
- **Agent runner:** built separately with `npm run build:agent-runner` (delegates to `container/agent-runner`) ([package.json:13](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L13)).

## Service units

- **macOS / launchd:** `~/Library/LaunchAgents/com.nanoclaw.plist`; load / unload / `launchctl kickstart -k gui/$(id -u)/com.nanoclaw` to restart ([CLAUDE.md:79-83](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L79-L83)). The plist source lives at `launchd/com.nanoclaw.plist`.
- **Linux / systemd:** `systemctl --user start|stop|restart nanoclaw` ([CLAUDE.md:85-90](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L85-L90)). Unit files under `systemd/` (`nanoclaw.service`, `systemd-crash-monitor.service`).
- **Deploy helper:** `./deploy-service <service> [--with-tests]`. Use `--with-tests` for changes touching dispatch, routing, IPC, config verification, notifications; omit for config-only or emergency hotfixes ([CLAUDE.md:68-72](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L68-L72)).

## Ports

- **Credential proxy:** `CREDENTIAL_PROXY_PORT`, default `3001` ([src/config.ts:47-50](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/config.ts#L47-L50)).
- **Health / skills HTTP:** the main process serves `GET /health`, `GET /skills`, and `GET /api/v1/skills` ([CLAUDE.md:13](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L13), [README.md:78](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L78)).

## Observability

- **Health snapshot:** built by `src/service-health.ts` ([CLAUDE.md:25](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L25), [README.md:186](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L186)).
- **Smoke tests:** `npm run smoke:runtime`, `npm run smoke:health`, `npm run smoke:db-container` ([package.json:29-31](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L29-L31)). `smoke:db-container` injects a CLI-routed message, waits for a fresh container spawn, and verifies the reply through the session `outbound.db` ([README.md:154-162](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L154-L162)).
- **Logging:** `pino` + `pino-pretty` ([package.json:43-44](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L43-L44)).
- **Crash + uptime monitoring:** `src/systemd-crash-monitor.ts`, `src/uptime-monitor.ts`, wired in `lifecycle.ts` ([src/lifecycle.ts:58-63](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/lifecycle.ts#L58-L63)).
- **Status CLI:** `npm run status`, `npm run health-check`, `npm run verify` ([package.json:32-34](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/package.json#L32-L34)).

## Parallel dispatch gate

Parallel dispatch (4 worker slots) is gated by a metrics check against Agency HQ's `/notifications/metrics/gate`. All three must pass: ≥3 distinct agents, ≥7 calendar days, no test rows. Override via `DISPATCH_PARALLEL=true|false` ([CLAUDE.md:94-110](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L94-L110)).

## Recovery

- **`dispatch_blocked_until` unblock:** after 3 consecutive dispatch failures, the loop sets a 24h block via Agency HQ. Clear it with `UPDATE tasks SET dispatch_blocked_until = NULL, status = 'ready' WHERE id = '<id>'` directly in the Agency HQ Postgres DB — there is no dedicated API for it. Restarting NanoClaw only resets the in-memory retry counter ([CLAUDE.md:113-129](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L113-L129)).
- **Setup recovery:** see [docs/SETUP_RECOVERY.md](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/docs/SETUP_RECOVERY.md) ([CLAUDE.md:93](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L93)).
- **WhatsApp upgrade breakage:** WhatsApp is no longer bundled in core — reapply the channel skill or downstream fork and re-run validation ([CLAUDE.md:94-95](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/CLAUDE.md#L94-L95)).

## Secrets

Real Anthropic credentials stay on the host. The credential proxy mediates Claude API access for the agent ([README.md:79](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/README.md#L79)). Other secrets can come from Solo Vault (`SOLO_VAULT_TOKEN`, `SOLO_VAULT_PROJECT`, default URL `https://api.vault.jeffreykeyser.net`) or `.env` ([src/config.ts:72-80](https://github.com/Jeffrey-Keyser/nanoclaw/blob/main/src/config.ts#L72-L80)).
