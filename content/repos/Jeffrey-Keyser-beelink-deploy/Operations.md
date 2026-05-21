---
title: Operations
description: Deploy, runtime, observability, and on-call notes for beelink-deploy — systemd unit, port 9000, journald logs, /health probe, signal handling.
---

# Operations

beelink-deploy is a deployable service, not a library. It runs on the Beelink as a long-lived systemd unit ([beelink-deploy.service:1-16](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/beelink-deploy.service#L1-L16), [README.md:52-59](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/README.md#L52-L59)).

## Start

- **Build:** `npm install && npm run build` produces `dist/index.js` ([package.json:7-9](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/package.json#L7-L9), [README.md:20-22](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/README.md#L20-L22)).
- **Run:** `node dist/index.js` (or `npm start`). systemd `ExecStart` points at that path ([beelink-deploy.service:9](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/beelink-deploy.service#L9)).
- **Dev:** `npm run dev` (`tsx watch src/index.ts`) ([package.json:10](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/package.json#L10)).

## Environment

Required:
- `RABBITMQ_URL` — fatal at boot if unset ([src/config.ts:52-55](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/config.ts#L52-L55)).

Common:
- `GITHUB_WEBHOOK_SECRET` — empty disables signature check (do not run that way in prod) ([src/config.ts:60](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/config.ts#L60), [src/server.ts:124-129](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L124-L129)).
- `PORT` (default 9000), `HOST` (default 127.0.0.1) ([src/config.ts:58-59](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/config.ts#L58-L59)).
- `DEPLOY_API_KEY` — required for manual `POST /deploy/:owner/:repo` ([src/server.ts:274-281](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L274-L281)).
- `DEPLOY_WEBHOOK_URL` — optional outbound failure notifier ([src/deploy.ts:91-92](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/deploy.ts#L91-L92)).
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — optional Telegram notifications ([src/notify.ts:7-9](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/notify.ts#L7-L9)).
- `CONFIG_DIR` — override the location of `repos.json` / `packages.json` / `config.json` ([src/config.ts:27-29](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/config.ts#L27-L29)).

systemd loads these from `/home/jkeyser/beelink-deploy/.env` ([beelink-deploy.service:13](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/beelink-deploy.service#L13), [.env.example](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/.env.example)).

## Port + ingress

- Listens on `127.0.0.1:9000` by default ([src/config.ts:57-59](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/config.ts#L57-L59)).
- Cloudflare Tunnel maps `deploy.jeffrey-keyser.com` → `http://localhost:9000` ([README.md:61-69](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/README.md#L61-L69)).
- Manual deploys go through the tunnel too; they require `X-Deploy-Key` ([src/server.ts:273-308](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L273-L308)).

## systemd unit

```
[Service]
Type=simple
User=jkeyser
WorkingDirectory=/home/jkeyser/beelink-deploy
ExecStart=/usr/bin/node /home/jkeyser/beelink-deploy/dist/index.js
Restart=always
RestartSec=10
EnvironmentFile=-/home/jkeyser/beelink-deploy/.env
```
([beelink-deploy.service:5-13](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/beelink-deploy.service#L5-L13))

## Signals

- `SIGHUP` / `SIGUSR2` — reload `config/repos.json` and `config/packages.json` without restart ([src/index.ts:19-34](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/index.ts#L19-L34)).
- `SIGTERM` / `SIGINT` — wait up to 240 s for in-flight deploys to drain, then exit ([src/index.ts:36-55](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/index.ts#L36-L55)).

## Health probe

- `GET /health` returns `{status: "ok", time}` ([src/server.ts:86-88](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L86-L88)).
- `GET /api/status` returns the rolled-up deploy status across all configured repos ([src/server.ts:91-94](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L91-L94)).
- `GET /deploy/:owner/:repo/logs` returns the last 20 deploy log entries (in-memory only) ([src/server.ts:108-112](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L108-L112)).
- beelink-deploy is registered as one of its own deploy targets with `healthUrl: http://localhost:9000/health` ([config/repos.json:63-68](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/config/repos.json#L63-L68)).

## Logs

- `journalctl -u beelink-deploy -f` ([README.md:107-109](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/README.md#L107-L109)).
- All child-process stdout/stderr is forwarded to the parent's console.log/error inside `runCommand`, so deploy output ends up in journald ([src/deploy.ts:187-196](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/deploy.ts#L187-L196)).
- Persistent status snapshot in `data/status.json`; rewritten on every deploy ([src/status.ts:47-60](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/status.ts#L47-L60)).

## On-call quick refs

- **Manual deploy:** `curl -X POST -H "X-Deploy-Key: $DEPLOY_API_KEY" https://deploy.jeffrey-keyser.com/deploy/Jeffrey-Keyser/<repo>` ([src/server.ts:273-308](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L273-L308)).
- **Skip a deploy from GitHub:** include `[skip deploy]` or `[no deploy]` in the head commit message ([src/server.ts:231-235](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L231-L235), [README.md:101-103](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/README.md#L101-L103)).
- **Reload repo list without restart:** `sudo systemctl kill -s SIGHUP beelink-deploy` ([src/index.ts:33](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/index.ts#L33)).
- **If RabbitMQ is down:** package PR merges return HTTP 500 and the publish error is logged; auto-reconnect is exponential up to 60 s ([src/server.ts:188-191](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L188-L191), [src/rabbit.ts:53-86](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/rabbit.ts#L53-L86)).
