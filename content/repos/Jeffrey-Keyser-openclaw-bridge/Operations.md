---
title: "Operations"
description: "How openclaw-bridge is started, deployed, tested, and checked, with documented commands separated from what this snapshot verifies."
---

# Operations

OpenClaw Bridge is a long-running Node service, not a library. The package has a `start` script and a `main` entry ([package.json:L5-L7](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/package.json#L5-L7)). It is not designed for `require` by other packages in the excerpts. Documented commands are below. Verified runtime behavior is limited, because this snapshot has no runtime logs or deployment inventory.

## Commands

| Purpose | Command | Source |
|---|---|---|
| Install | `npm install` (documented) | [README.md:L24-L26](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/README.md#L24-L26) |
| Start | `npm start`, which runs `node src/index.js` | [package.json:L7](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/package.json#L7) |
| Deploy | `./deploy.sh` | [deploy.sh:L9-L20](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/deploy.sh#L9-L20) |
| Test | `npm test` (`node --test`) | [package.json:L9](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/package.json#L9) |
| Lint | `npm run lint` | [package.json:L8](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/package.json#L8) |

`deploy.sh` sets user D-Bus variables, runs `git pull origin main`, runs `npm ci --production`, and restarts the user service ([deploy.sh:L5-L18](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/deploy.sh#L5-L18)).

## Service unit

The repo's unit file has `User=jkeyser`, `WorkingDirectory` set to the repo, and `ExecStart=/usr/bin/npm start` ([openclaw-bridge.service:L5-L10](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/openclaw-bridge.service#L5-L10)). It sets `Restart=always` with a 10 second delay ([L11-L12](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/openclaw-bridge.service#L11-L12)). It is installed under `multi-user.target` ([L14-L15](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/openclaw-bridge.service#L14-L15)).

This conflicts with `deploy.sh`, which restarts a user unit with `systemctl --user` ([deploy.sh:L18](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/deploy.sh#L18)), and with the README, which uses `sudo systemctl` ([README.md:L90-L92](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/README.md#L90-L92)). The installed unit type on the host is unknown.

## Port and health

- HTTP port defaults to 3099 through `HTTP_PORT` ([src/index.js:L22](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L22)).
- The unit kills any process on port 3099 before starting ([openclaw-bridge.service:L9](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/openclaw-bridge.service#L9)).
- `GET /health` returns `{ status: 'ok', service: 'openclaw-bridge' }` ([src/index.js:L29-L31](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L29-L31)). This shows the HTTP server answers, not that RabbitMQ consumers are subscribed.

## Admin endpoints

- `GET /admin/handlers`: global pause and per-handler state ([src/index.js:L44-L49](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L44-L49)).
- `GET /admin/forward-stats`: last attempt per handler ([src/index.js:L51-L55](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L51-L55)).
- `GET /admin/targets` and `PUT /admin/targets/:handler`: routing configuration ([src/index.js:L71-L93](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L71-L93)).
- `PUT /admin/bridge`: global kill switch ([src/index.js:L96-L105](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L96-L105)).

## Configuration

Key environment variables seen in source: `RABBITMQ_URL` ([src/services/rabbit.js:L10](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/rabbit.js#L10)), `OPENCLAW_WEBHOOK_URL` and `OPENCLAW_HOOK_TOKEN` ([src/services/openclaw.js:L8-L9](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/openclaw.js#L8-L9)), `NANOCLAW_ENABLED` ([src/services/nanoclaw.js:L7](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/nanoclaw.js#L7)), `BRIDGE_STATE_DIR` ([src/services/bridgeState.js:L12-L13](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/bridgeState.js#L12-L13)), `DEV_INBOX_DIR` ([src/handlers/plan-manager.js:L19](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/plan-manager.js#L19)), and `RECONNECT_PROBE_QUEUES` ([src/handlers/reconnect-probe.js:L30](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/reconnect-probe.js#L30)).

Several source defaults include credentials or tokens. Set real values through the environment, and do not rely on those defaults.

## Logs and observability

- Process logs are the main signal. Handlers log init, receipt, and forward results with bracketed prefixes ([src/handlers/cron.js:L24](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/cron.js#L24), [L31-L33](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/cron.js#L31-L33)).
- Forward stats are in memory and reset on restart ([src/services/forwardStats.js:L7-L8](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/forwardStats.js#L7-L8)).
- NanoClaw delivery errors are throttled ([src/services/nanoclaw.js:L10-L13](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/nanoclaw.js#L10-L13)).
- Poison messages are dropped after two failed deliveries ([src/services/rabbit.js:L92-L94](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/rabbit.js#L92-L94)).

Metrics, alerting, and log shipping are not present in the excerpts. The documented log command is `journalctl -u openclaw-bridge -f` ([README.md:L92-L93](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/README.md#L92-L93)).

## Documented versus verified

Documented: the README's run, systemd, and troubleshooting steps ([README.md:L42-L44](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/README.md#L42-L44), [L96-L102](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/README.md#L96-L102)). Verified in this snapshot: only the source-level behavior. Current host state, live queue bindings, and whether the health check passes are unknown. An incident note describes an older NanoClaw socket transport that the current client no longer uses ([docs/debug/gym-arrive-telegram-not-firing.md:L3](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/docs/debug/gym-arrive-telegram-not-firing.md#L3)), so treat it as historical.
