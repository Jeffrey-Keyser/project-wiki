---
title: Services & Dependencies
description: What beelink-deploy depends on (GitHub, RabbitMQ, systemd, Telegram, Cloudflare Tunnel) and what depends on its outputs (per-repo services, openclaw-bridge, wiki pipeline).
---

# Services & Dependencies

## Depends on

### Runtime
- **Node.js + systemd.** Service unit is `Type=simple`, `User=jkeyser`, restarts always with 10 s backoff ([beelink-deploy.service:1-16](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/beelink-deploy.service#L1-L16)).
- **`express` ^4.18.2.** HTTP server and routing ([package.json:18](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/package.json#L18)).
- **`amqplib` ^0.10.9.** RabbitMQ client; durable topic exchanges, exponential reconnect ([package.json:18](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/package.json#L18), [src/rabbit.ts:8-86](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/rabbit.ts#L8-L86)).
- **TypeScript / tsx.** `tsc` for prod build, `tsx watch` for dev, `tsx --test` for the test suite ([package.json:7-13](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/package.json#L7-L13)).

### Inbound
- **GitHub webhooks.** `push` (service deploys) and `pull_request` (package repos). HMAC-SHA256 signature header `X-Hub-Signature-256` ([src/github.ts:6-28](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/github.ts#L6-L28), [src/server.ts:115-198](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L115-L198)).
- **Operator HTTP.** Manual deploy via `POST /deploy/:owner/:repo` with `X-Deploy-Key` ([src/server.ts:273-308](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L273-L308)).
- **Cloudflare Tunnel.** Routes `deploy.jeffrey-keyser.com` → `http://localhost:9000` ([README.md:61-69](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/README.md#L61-L69)).

### Outbound
- **RabbitMQ.** Connection URL via `RABBITMQ_URL` (required) ([src/config.ts:52-55](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/config.ts#L52-L55)). Publishes to two durable topic exchanges:
  - `packages.events` with routing key `package.push.<owner>.<repo>` — consumed by `openclaw-bridge` ([src/rabbit.ts:10](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/rabbit.ts#L10), [src/rabbit.ts:108-128](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/rabbit.ts#L108-L128)).
  - `wiki.events` with routing key `wiki.update.<owner>.<repo>` — consumed by the wiki pipeline ([src/rabbit.ts:11](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/rabbit.ts#L11), [src/rabbit.ts:134-156](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/rabbit.ts#L134-L156)).
- **Telegram Bot API.** `sendMessage` for deploy/health outcomes; silently no-ops without `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` ([src/notify.ts:6-25](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/notify.ts#L6-L25)).
- **Optional failure webhook.** Posts truncated deploy failure payload to `DEPLOY_WEBHOOK_URL` ([src/deploy.ts:90-119](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/deploy.ts#L90-L119)).
- **Local target services.** `git pull` + `sudo systemctl restart <service>` against checkouts on disk; one row per repo in `config/repos.json` ([src/deploy.ts:154-159](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/deploy.ts#L154-L159)).

### Target services (consumed by)
Service repos that beelink-deploy is wired to deploy ([config/repos.json:1-126](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/config/repos.json#L1-L126)) — selected entries:
- `flights-api`, `prompt-registry`, `apps`, `ai-proxy`, `insta-travel-map`, `pantry`, `dota-draft`, `solo-vault`, `analytics-pulse`, `pay`, `ping`
- With post-deploy health URLs: `image-studio` (`:3030/api/v1/diagnostics/deploy`), `beelink-deploy` itself (`:9000/health`), `openclaw-bridge` (`:3099/health`), `agency-hq` (`:3040/health`), `myrrs-api` (`:3035/health`), `business-hq` (`:3041/health`), `nof1-api` (`:3060/health`), `qa-patrol` (`:3042/health`), `logos` (`:3070/health`) ([config/repos.json:57-126](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/config/repos.json#L57-L126)).

### Package repos (consumed by openclaw-bridge / wiki pipeline)
PR-merge sources, re-emitted to RabbitMQ rather than deployed locally ([config/packages.json:1-47](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/config/packages.json#L1-L47)):
- `@jeffrey-keyser/message-contracts`, `@jeffrey-keyser/pay-auth-integration`, `@jeffrey-keyser/pay-domain-core`, `@jeffrey-keyser/pay-api-types`, `@jeffrey-keyser/api-errors`, `@jeffrey-keyser/database-base-config`, `@jeffrey-keyser/personal-ui-kit`, `@jeffrey-keyser/event-bus`, `@jeffrey-keyser/myrrs-domain-core`.

## Consumed by

- **`openclaw-bridge`.** Subscribes to `packages.events` to bump the package version downstream ([src/rabbit.ts:1-11](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/rabbit.ts#L1-L11)).
- **Central wiki pipeline.** Subscribes to `wiki.events`. Best-effort — failure is logged but does not fail the request ([src/server.ts:181-186](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L181-L186)).
- **Status page / dashboards.** Read `GET /api/status` and `GET /deploy/:owner/:repo/logs` ([src/server.ts:91-112](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L91-L112)).
- **Telegram chat.** Receives per-deploy outcome notices ([src/server.ts:39-57](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L39-L57)).
