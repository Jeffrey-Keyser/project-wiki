---
title: Operations
description: How openclaw-bridge runs in production — deploy, systemd, port, admin API, observability.
---

# Operations

OpenClaw Bridge is a long-running Node service deployed as a user-level systemd unit on the host. It is not a library — `package.json` declares a `start` script and `main` entry, and the unit file launches it via `npm start` ([package.json:5-10](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/package.json#L5-L10), [openclaw-bridge.service:7-11](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/openclaw-bridge.service#L7-L11)).

## Start command

```
npm start   # → node src/index.js
```

That is the documented run command in the README ([README.md:30-34](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/README.md#L30-L34)) and the `scripts.start` entry ([package.json:7](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/package.json#L7)).

## Port

HTTP webhook + admin server listens on `HTTP_PORT` (default `3099`). The systemd unit kills any stale listener on 3099 before starting ([src/index.js:24](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L24), [openclaw-bridge.service:8](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/openclaw-bridge.service#L8)).

## Systemd unit

User-level service (`systemctl --user`) under `WorkingDirectory=/home/jkeyser/openclaw-bridge`. `Restart=always`, `RestartSec=10`, ordered `After=network.target rabbitmq-server.service` ([openclaw-bridge.service:1-15](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/openclaw-bridge.service#L1-L15)). Note: the connection close handler exits the process so systemd restarts it on RabbitMQ blips ([src/services/rabbit.js:30-33](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/rabbit.js#L30-L33)).

## Deploy

```
./deploy.sh
```

The script sets the user D-Bus env vars (since `beelink-deploy` runs as a system service that can't see the user bus), then `git pull origin main`, `npm ci --production`, `systemctl --user restart openclaw-bridge` ([deploy.sh:1-19](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/deploy.sh#L1-L19)).

## Configuration

Env vars (via `.env` or process env):

- `RABBITMQ_URL` — AMQP URL ([src/services/rabbit.js:10](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/rabbit.js#L10))
- `OPENCLAW_WEBHOOK_URL`, `OPENCLAW_HOOK_TOKEN` ([src/services/openclaw.js:8-9](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/openclaw.js#L8-L9))
- `NANOCLAW_ENABLED`, `NANOCLAW_MESSAGE_API_URL`, `NANOCLAW_CHAT_JID` ([src/services/nanoclaw.js:7-9](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/nanoclaw.js#L7-L9))
- `HTTP_PORT` (default 3099) ([src/index.js:24](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L24))
- `BRIDGE_STATE_DIR` (defaults to `./data`) ([src/services/bridgeState.js:11-17](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/bridgeState.js#L11-L17))
- `HIMALAYA_BIN`, `ICAL_PY_PATH`, `DEV_INBOX_DIR`, `PING_API_BASE`, `PING_API_KEY` ([src/index.js:330-331](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L330-L331), [src/index.js:515](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L515), [src/handlers/ping.js:18-20](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/handlers/ping.js#L18-L20))

## Health and observability

- **Health probe:** `GET /health` returns `{status:'ok', service:'openclaw-bridge'}` ([src/index.js:31-33](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L31-L33)).
- **Handler status:** `GET /admin/handlers` returns global pause + per-handler enabled/paused state ([src/index.js:47-51](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L47-L51)).
- **Forward stats:** `GET /admin/forward-stats` returns last delivery attempt per handler ([src/index.js:54-57](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L54-L57)).
- **Targets:** `GET /admin/targets` shows the routing config plus whether NanoClaw is enabled ([src/index.js:73-80](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L73-L80)).
- **Kill switch:** `PUT /admin/bridge` with `{paused: true}` halts every consumer (rabbit consumers ack-skip) ([src/index.js:98-107](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L98-L107), [src/services/rabbit.js:71-75](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/rabbit.js#L71-L75)).

## Logs

```
journalctl -u openclaw-bridge -f          # if running as system unit
journalctl --user -u openclaw-bridge -f   # user unit (current deploy)
```

Documented in README ([README.md:74-80](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/README.md#L74-L80)). NanoClaw delivery errors are rate-limited to one log line per minute per error class to keep journalctl readable during outages ([src/services/nanoclaw.js:11-24](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/nanoclaw.js#L11-L24)); RabbitMQ consumers drop poison messages after one retry to avoid a known log-flood failure mode (~5,720 lines/min) ([src/services/rabbit.js:82-99](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/rabbit.js#L82-L99)).

## Persistent state on disk

- `data/bridge-state.json` — pause overrides ([src/services/bridgeState.js:11-66](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/bridgeState.js#L11-L66))
- `data/zone-reminders.json` — ping handler reminder state ([src/handlers/ping.js:16](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/handlers/ping.js#L16))

## On-call playbook (quick refs)

- "Something stopped sending to Telegram" → check `GET /admin/targets` (is target still `nanoclaw`?) and `GET /admin/forward-stats`.
- "Handler is spamming logs" → `PUT /admin/handlers/:name {enabled:false}`, then investigate.
- "Bridge won't start" → `journalctl --user -u openclaw-bridge -n 100`; expect RabbitMQ reachability first.
- "Need to roll back" → `git checkout <prev sha> && ./deploy.sh`.
