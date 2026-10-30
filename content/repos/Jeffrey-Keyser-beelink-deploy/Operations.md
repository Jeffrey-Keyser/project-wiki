---
title: "Operations"
description: "Build, run, environment, health and observability for beelink-deploy, a systemd service rather than a library, with documented versus verified runtime clearly separated."
---

# Operations

beelink-deploy is a long-running service, not a library. Its entry point starts the server at module load ([src/index.ts:L66-L69](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/index.ts#L66-L69)). The systemd unit runs it as a daemon ([beelink-deploy.service:L5-L16](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/8ff4e92609b74aaa8ed1265292007ef26f6c035e/beelink-deploy.service#L5-L16)).

## Commands

```bash
npm install
npm run build
npm start        # node dist/index.js
npm run dev      # tsx watch src/index.ts
npm test
npm run typecheck
npm run lint
```

These come from [package.json:L8-L13](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/package.json#L8-L13) and [README.md:L20-L22](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/README.md#L20-L22). Install the unit with the steps in [README.md:L55-L58](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/README.md#L55-L58).

## Environment

- `RABBITMQ_URL` is required at boot ([src/config.ts:L54-L57](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/config.ts#L54-L57)).
- `GITHUB_WEBHOOK_SECRET`, `PORT`, `HOST` and `CONFIG_DIR` are read by the loader ([src/config.ts:L29-L31](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/config.ts#L29-L31), [src/config.ts:L60-L62](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/config.ts#L60-L62)). If `GITHUB_WEBHOOK_SECRET` is unset, startup logs a warning and every `/webhook` delivery is rejected with HTTP 500 ([src/index.ts:L11-L13](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/8ff4e92609b74aaa8ed1265292007ef26f6c035e/src/index.ts#L11-L13), [src/server.ts:L159-L163](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/8ff4e92609b74aaa8ed1265292007ef26f6c035e/src/server.ts#L159-L163)).
- `DATA_DIR` sets where status and protected logs go ([src/status.ts:L6](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/status.ts#L6)). The unit sets it ([beelink-deploy.service:L15](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/8ff4e92609b74aaa8ed1265292007ef26f6c035e/beelink-deploy.service#L15)).
- `DEPLOY_API_KEY`, `DEPLOY_WEBHOOK_URL`, `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are optional or route-specific ([src/server.ts:L357-L359](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L357-L359), [src/notify.ts:L5-L7](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/notify.ts#L5-L7)).

Live values are not in the snapshot. Do not record secret values in this wiki.

## Port and health

- Default bind is `127.0.0.1:9000` ([config/config.json:L2-L3](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/config/config.json#L2-L3)).
- `GET /health` returns `{status, time}` without a Pay session ([src/server.ts:L65-L68](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L65-L68), [src/server.ts:L115-L117](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L115-L117)).
- Other routes need a Pay admin ([src/server.ts:L96-L109](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L96-L109)).

## Signals and drain

- SIGHUP and SIGUSR2 reload repos and packages ([src/index.ts:L24-L38](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/index.ts#L24-L38)).
- SIGTERM and SIGINT drain for up to 240 s ([src/index.ts:L40-L59](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/index.ts#L40-L59)). The unit sets `TimeoutStopSec=300` ([beelink-deploy.service:L12](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/8ff4e92609b74aaa8ed1265292007ef26f6c035e/beelink-deploy.service#L12)).
- The unit sets `KillMode=mixed`. On a stop or self-restart, systemd sends SIGTERM only to the main Node process, so bash, npm and git children of in-flight deploys for other repos are not killed by the signal. Any leftover processes are SIGKILLed after the main process exits ([beelink-deploy.service:L13-L15](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/8ff4e92609b74aaa8ed1265292007ef26f6c035e/beelink-deploy.service#L13-L15), [deploy.sh:L24-L26](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/8ff4e92609b74aaa8ed1265292007ef26f6c035e/deploy.sh#L24-L26)).

## Observability

- `journalctl -u beelink-deploy -f` is the documented log path ([README.md:L134-L136](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/README.md#L134-L136)).
- `GET /api/status` returns per-repo state with error text publicly sanitized ([src/server.ts:L120-L126](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L120-L126)).
- Protected attempt logs are retained for 30 days by default, subject to size and count limits ([src/deployment-logs.ts:L21-L25](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/deployment-logs.ts#L21-L25), [docs/deployment-logs.md:L50-L52](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/docs/deployment-logs.md#L50-L52)).
- A failed-deploy Telegram message for a checkout deployment says how many commits the live `HEAD` trails `origin/<branch>` and how old the oldest undeployed commit is. Immutable-worktree repos and unreadable checkouts add no line ([src/server.ts:L38-L44](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/69c67435cab42acd0c3be42fedee39e71eafac55/src/server.ts#L38-L44), [src/deploy-lag.ts:L19-L33](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/69c67435cab42acd0c3be42fedee39e71eafac55/src/deploy-lag.ts#L19-L33)).
- When a checkout deployment restores drifted lockfiles before updating, it logs a warning and writes a system line naming the files into the attempt log ([src/deploy.ts:L357-L361](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/69c67435cab42acd0c3be42fedee39e71eafac55/src/deploy.ts#L357-L361)).
- Status records name the commit actually deployed. For checkout deployments that is the `HEAD` observed after the script runs, not the requested SHA ([src/server.ts:L406-L414](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/8ff4e92609b74aaa8ed1265292007ef26f6c035e/src/server.ts#L406-L414), [src/deploy.ts:L297-L299](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/8ff4e92609b74aaa8ed1265292007ef26f6c035e/src/deploy.ts#L297-L299)).

## Documented versus verified

- **Documented:** README and `docs/` describe the endpoints, retention and log routes.
- **Verified in source:** the excerpts show the routes, defaults and scripts above. They do not show the running host.
- **Unknown:** live `.env` values, Pay URL, the tunnel config, whether webhooks are configured and whether the service is currently healthy.
