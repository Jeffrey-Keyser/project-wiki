---
title: beelink-deploy
description: Self-hosted webhook deploy service on the Beelink — fans GitHub push and PR events out to per-repo deploy scripts and a RabbitMQ package bus.
---

# beelink-deploy

Single-host deploy controller. Runs as a systemd service on the Beelink, listens for GitHub webhooks, and either (a) executes a per-repo `deploy.sh` against the target service or (b) re-publishes merge events onto a RabbitMQ topic exchange for downstream consumers like `openclaw-bridge` and the wiki pipeline ([README.md:1-9](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/README.md#L1-L9), [src/server.ts:115-216](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L115-L216)).

## At a glance

- Node.js + Express, TypeScript, ESM ([package.json:1-15](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/package.json#L1-L15))
- Two dependencies: `express`, `amqplib` ([package.json:17-20](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/package.json#L17-L20))
- Listens on `127.0.0.1:9000` by default; fronted by Cloudflare Tunnel ([src/config.ts:57-64](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/config.ts#L57-L64), [README.md:61-69](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/README.md#L61-L69))
- Two repo classes: **service repos** (`config/repos.json`, deploy on push) and **package repos** (`config/packages.json`, re-publish on PR merge) ([src/server.ts:131-216](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L131-L216))
- HMAC-SHA256 webhook signature check ([src/github.ts:6-28](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/github.ts#L6-L28))
- Post-deploy health poll + Telegram notification ([src/server.ts:19-58](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L19-L58), [src/healthCheck.ts:11-37](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/healthCheck.ts#L11-L37))
- Status persisted to `data/status.json` and served at `/api/status` ([src/status.ts:6-7](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/status.ts#L6-L7), [src/server.ts:91-94](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L91-L94))
- Hot reload of repo config on `SIGHUP`/`SIGUSR2`; graceful drain on `SIGTERM`/`SIGINT` (240s) ([src/index.ts:6-55](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/index.ts#L6-L55))

## Who uses it

- **Jeff (operator).** Configures repos in `config/*.json`, triggers manual deploys via `POST /deploy/:owner/:repo` with `X-Deploy-Key` ([src/server.ts:273-308](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L273-L308)).
- **GitHub.** Pushes `push` and `pull_request` webhooks at `https://deploy.jeffrey-keyser.com/webhook` ([README.md:71-78](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/README.md#L71-L78)).
- **Downstream consumers on RabbitMQ.** `packages.events` topic feeds `openclaw-bridge`; `wiki.events` topic feeds the central wiki pipeline ([src/rabbit.ts:10-11](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/rabbit.ts#L10-L11), [src/rabbit.ts:108-156](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/rabbit.ts#L108-L156)).

## How work moves through it

1. GitHub fires webhook → Express receives at `/webhook` with raw body cached for HMAC ([src/server.ts:75-129](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L75-L129)).
2. Signature validated; event dispatched by `X-GitHub-Event` header ([src/server.ts:115-198](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L115-L198)).
3. `push` to a service repo → run `deploy.sh` if present, else `git pull && npm ci --production && systemctl restart <service>` ([src/deploy.ts:141-160](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/deploy.ts#L141-L160)).
4. `pull_request` merged on a package repo → publish to `packages.events` and `wiki.events` exchanges ([src/server.ts:163-191](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L163-L191)).
5. After deploy: store last 20 log entries in memory, write status JSON, poll `healthUrl`, notify Telegram ([src/deploy.ts:21-78](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/deploy.ts#L21-L78), [src/server.ts:240-269](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L240-L269)).

## Wiki pages

- [Architecture](./architecture/) — modules, exchanges, signal handlers
- [Iteration Loop](./iteration-loop/) — how a change to this repo ships to itself
- [Services & Dependencies](./services-and-dependencies/) — inbound webhooks, outbound exchanges, target services
- [Operations](./operations/) — systemd unit, ports, logs, health probe
- [Glossary](./glossary/) — repo-specific terms
