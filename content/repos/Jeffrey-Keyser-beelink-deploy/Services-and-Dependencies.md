---
title: "Services & Dependencies"
description: "What beelink-deploy depends on, including GitHub, RabbitMQ, Pay, Telegram, systemd and git, and which callers are confirmed in source versus expected or unknown."
---

# Services & Dependencies

## Depends on

**Runtime packages.** `express` serves HTTP and `amqplib` publishes to RabbitMQ ([package.json:L18-L19](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/package.json#L18-L19)).

**Host tools.** Deploys run `bash deploy.sh` ([src/deploy.ts:L280](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/deploy.ts#L280)), `git` for checkout and worktrees ([src/deploy.ts:L293](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/deploy.ts#L293)), `npm ci` ([src/deploy.ts:L297](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/deploy.ts#L297)) and `sudo systemctl restart` ([src/deploy.ts:L299-L302](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/deploy.ts#L299-L302)). The unit runs as `User=jkeyser` ([beelink-deploy.service:L7](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/beelink-deploy.service#L7)).

**RabbitMQ.** Required through `RABBITMQ_URL` ([src/config.ts:L54-L57](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/config.ts#L54-L57)). Connection is attempted only when packages are configured ([src/index.ts:L16-L17](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/index.ts#L16-L17)).

**Pay.** Access checks call `/api/v1/auth/me` on `PAY_SERVICE_URL`, which defaults to `127.0.0.1:3017` ([src/log-access.ts:L26](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/log-access.ts#L26), [src/log-access.ts:L58](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/log-access.ts#L58)). The live value is unknown.

**GitHub.** Webhook requests need `GITHUB_WEBHOOK_SECRET`. Without it the route returns HTTP 500 and queues nothing. With it, signatures are checked with HMAC ([src/server.ts:L159-L166](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/8ff4e92609b74aaa8ed1265292007ef26f6c035e/src/server.ts#L159-L166), [src/github.ts:L6-L28](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/github.ts#L6-L28)).

**Telegram.** Messages go to `api.telegram.org` when both credentials are set ([src/notify.ts:L5-L9](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/notify.ts#L5-L9)).

**Cloudflare Tunnel.** The documented ingress maps `deploy.jeffreykeyser.net` to `localhost:9000` ([README.md:L61-L69](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/README.md#L61-L69)). The tunnel config itself is not in the snapshot.

**Deploy targets (configured, not verified running).** `config/repos.json` lists service entries and health URLs ([config/repos.json:L2-L141](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/config/repos.json#L2-L141)). Listing a target does not confirm it is deployed or healthy.

## Consumed by

**Confirmed in source.**

- **GitHub** posts to `/webhook` ([src/server.ts:L147](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L147)). Whether a given repo's webhook is configured is unknown.
- **Operators and CLI clients** call `/api/status`, `/repos` and the logs routes with a Pay admin token ([README.md:L120-L124](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/README.md#L120-L124)).
- **Assistant script.** `scripts/read-deployment-log.mjs` reads protected logs ([scripts/read-deployment-log.mjs:L37-L40](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/scripts/read-deployment-log.mjs#L37-L40)). Authorization is a documented owner decision ([docs/deployment-logs.md:L118-L124](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/docs/deployment-logs.md#L118-L124)).

**Expected or unknown.** No consumer code is in the snapshot.

- **`openclaw-bridge`** is named as the `packages.events` consumer in a comment ([src/rabbit.ts:L4](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/rabbit.ts#L4)). It is expected, not confirmed.
- **A wiki pipeline** is described as the `wiki.events` consumer ([src/server.ts:L180-L182](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L180-L182)). Its name and deployment are unknown.
- **"Milo"** is named in a comment on package publishing ([src/server.ts:L221](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L221)). Its role is unknown.
- **Failure webhook receiver.** Set by `DEPLOY_WEBHOOK_URL` ([src/deploy.ts:L195-L196](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/deploy.ts#L195-L196)). The receiver is unknown.
- **Telegram chat** receives outcome notices only if credentials are set ([src/notify.ts:L5-L7](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/notify.ts#L5-L7)).
