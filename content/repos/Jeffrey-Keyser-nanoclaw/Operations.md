---
title: "Operations"
description: "Start, build, reload, health and smoke commands for the NanoClaw service, with documented versus verified runtime facts."
---

# Operations

NanoClaw is a long-running service, not a library. Its entry point is `dist/index.js`, which `npm start` runs ([package.json:L6](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/package.json#L6), [package.json:L15](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/package.json#L15)).

## Setup and start

- **Setup steps.** Run them with `npx tsx setup/index.ts --step <name>`. The available steps are ([setup/index.ts:L1-L19](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/setup/index.ts#L1-L19)):
  - `environment`
  - `container`
  - `groups`
  - `register`
  - `mounts`
  - `service`
  - `verify`
- **Service install.** The `service` step builds the project, then installs a service:
  - On macOS: a launchd plist, with stdout and stderr going to `logs/nanoclaw.log` and `logs/nanoclaw.error.log` ([setup/service.ts:L178-L223](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/setup/service.ts#L178-L223)).
  - On Linux: a systemd unit, falling back to `nohup` when systemd is unavailable ([setup/service.ts:L265-L278](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/setup/service.ts#L265-L278)).
- **Service control** ([CLAUDE.md:L93-L103](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/CLAUDE.md#L93-L103)):
  - Linux: `systemctl --user start|stop|restart nanoclaw`
  - macOS: `launchctl kickstart -k gui/$(id -u)/com.nanoclaw`
- **Rebuild from scratch:** `npm ci`, then `npm --prefix container/agent-runner ci`, then `build:core` and `build:agent-runner` ([docs/SETUP_RECOVERY.md:L16-L23](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/docs/SETUP_RECOVERY.md#L16-L23)).
- **Build and reload.** `npm run build` restarts the systemd unit. It uses `NANOCLAW_SYSTEMD_UNIT`, defaulting to `nanoclaw.service`. It then waits up to 90 seconds for the unit to become active, and runs the health check and the agent-event smoke ([scripts/reload-service.mjs:L5-L9](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/scripts/reload-service.mjs#L5-L9), [scripts/reload-service.mjs:L115-L125](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/scripts/reload-service.mjs#L115-L125)). This reload path is systemd-only.

## Health and smoke checks

- **Smoke scripts.** `npm run smoke:runtime` checks tmux, and `npm run smoke:health` checks the `/health` endpoint. If `smoke:runtime` fails, fix tmux before anything else ([docs/SETUP_RECOVERY.md:L5-L14](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/docs/SETUP_RECOVERY.md#L5-L14)).
- **Agent-event smoke.** `NANOCLAW_SMOKE_RECIPIENT='tg:…' npm run smoke:agent-event` invokes a real provider. It requires two exact outputs, produced by separate runner invocations, and delivers nothing to the channel ([docs/SETUP_RECOVERY.md:L41-L54](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/docs/SETUP_RECOVERY.md#L41-L54)).
- **`smoke:db-container`.** The README describes this check as waiting for a fresh Docker container spawn ([README.md:L173-L177](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/README.md#L173-L177)). That conflicts with the tmux-only runtime adapter ([src/runtime-adapter.ts:L5](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/runtime-adapter.ts#L5)). Treat its current behavior as unverified.
- **`/health` contents.** The snapshot includes runtime readiness, active session count, credential mode, provider diagnostics, channel circuit state, and subsystem states. Its status is `ok` or `degraded`, with `degradedReasons` explaining any degradation ([src/service-health.ts:L10-L38](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/service-health.ts#L10-L38)).
- **Other diagnostics:** `npm run status`, `npm run health-check` and `npm run verify` ([package.json:L33-L35](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/package.json#L33-L35)).

## Ports: documented versus verified

Port values disagree across sources, and the real ports for any given installation are unknown here:

| Setting | Code default | Other documented values |
|---|---|---|
| `CREDENTIAL_PROXY_PORT` | 3001 ([src/config.ts:L47-L50](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/config.ts#L47-L50)) | — |
| `MESSAGE_API_PORT` | — | 3003 in the Message API doc ([docs/MESSAGE_API.md:L11-L13](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/docs/MESSAGE_API.md#L11-L13)) |
| `SKILL_SERVER_PORT` | 3101 in the reload script ([scripts/reload-service.mjs:L77](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/scripts/reload-service.mjs#L77)); 3002 in `verify` ([src/cli/verify-config.ts:L85](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/cli/verify-config.ts#L85)) | — |

The checked-in `systemd/nanoclaw.service` sets the following values ([systemd/nanoclaw.service:L14-L18](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/systemd/nanoclaw.service#L14-L18)):
- `CREDENTIAL_PROXY_PORT=3100`
- `SKILL_SERVER_PORT=3101`
- `MESSAGE_API_PORT=3102`
- `DISPATCH_SLOTS_PG=true`

That unit hard-codes one user's home path ([systemd/nanoclaw.service:L7-L11](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/systemd/nanoclaw.service#L7-L11)). Treat it as an example, not proof of any deployment.

## Observability

- **Logs.** Logs go to `logs/nanoclaw.log` and `logs/nanoclaw.error.log`. Setup generates a logrotate config capped at 50 MB × 3 ([setup/service.ts:L76-L89](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/setup/service.ts#L76-L89)).
- **Dispatch slot transitions.** Each transition is logged with its slot, task, state and backend ([src/dispatch-pool.ts:L159-L171](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/src/dispatch-pool.ts#L159-L171)).
- **Crash monitor.** It runs inside the main process by default. A standalone unit is also available ([systemd/systemd-crash-monitor.service:L4-L6](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/systemd/systemd-crash-monitor.service#L4-L6)).

## Recovery

- **Degraded service.** Read the `degradedReasons` in `/health`, then confirm that a channel is connected ([docs/SETUP_RECOVERY.md:L68-L72](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/docs/SETUP_RECOVERY.md#L68-L72)).
- **Tasks stuck behind `dispatch_blocked_until`.** This applies only to the legacy dispatcher. Clear the field with SQL against the Agency HQ `tasks` table ([CLAUDE.md:L129-L142](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/CLAUDE.md#L129-L142)).
- **Agent sessions blocked from controlling the service.** Agent sessions cannot restart the service themselves: the `service-guard.sh` hook denies `systemctl` commands that target `nanoclaw`, as well as `daemon-reload` ([container/hooks/service-guard.sh:L12-L46](https://github.com/Jeffrey-Keyser/nanoclaw/blob/080f00b65b7849e311f7b4aa5825eaa8ab9a8228/container/hooks/service-guard.sh#L12-L46)).
