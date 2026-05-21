---
title: Services & Dependencies
description: Inbound and outbound integrations for Cream City Web — libraries, external APIs, message queues, and downstream consumers.
---

# Services & Dependencies

## Depends on

### npm dependencies
- `express ^5.2.1`, `cors ^2.8.6` — payment API HTTP layer ([package.json:18-20](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/package.json#L18-L20)).
- `pg ^8.13.0` — PostgreSQL client used by every script and the API server ([package.json:22](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/package.json#L22)).
- `amqplib ^0.10.9` — RabbitMQ client used by `poll-email.mjs` to publish inbound emails ([package.json:18](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/package.json#L18), [scripts/poll-email.mjs:14-25](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/scripts/poll-email.mjs#L14-L25)).
- `resend ^6.9.2` — outbound email via `ai@creamcityweb.com` ([package.json:23](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/package.json#L23), [tools.md:28-34](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/tools.md#L28-L34)).
- `stripe ^20.3.1` — checkout sessions + webhook verification in the API ([package.json:24](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/package.json#L24), [api/server.mjs:1-12](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/api/server.mjs#L1-L12)).
- `jsdom ^28.1.0` — HTML parsing for site templating and modification ([package.json:21](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/package.json#L21)).

### External services
- **PostgreSQL 17** `cream_city_web` on localhost — primary datastore ([README.md:5-14](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/README.md#L5-L14)).
- **pay-api.jeffreykeyser.net** — billing backend; called by API server via `PAY_API_URL` + bearer token ([api/server.mjs:41-65](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/api/server.mjs#L41-L65)).
- **Stripe** — checkout + webhooks; secret loaded as `STRIPE_WEBHOOK_SECRET` ([README.md:57-60](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/README.md#L57-L60)).
- **Resend** — outbound email transport, 3k/month free tier, SPF/DKIM verified ([tools.md:28-34](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/tools.md#L28-L34)).
- **Cloudflare** — DNS, Email Routing (`*@creamcityweb.com` catch-all), Tunnel for `*.creamcityweb.com`, Workers ([tools.md:37-52](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/tools.md#L37-L52)).
- **Brave Search API** — lead discovery, rate-limited ([tools.md:9-15](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/tools.md#L9-L15)).
- **Google APIs** via `~/google-tools/google-api.py` — Tasks, Calendar, Drive, Sheets, Contacts, Docs ([tools.md:16-24](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/tools.md#L16-L24)).
- **Solo Vault** — secret loader overriding `.env` at API startup via `scripts/secrets.mjs` ([api/server.mjs:22-39](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/api/server.mjs#L22-L39)).
- **RabbitMQ** — `cron.jobs/ccw.run` queue is how the operator gets triggered ([CLAUDE.md:13-19](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/CLAUDE.md#L13-L19)).
- **NanoClaw IPC** — drop JSON in `/home/jkeyser/nanoclaw/data/ipc/schedule_task/` to reach Telegram ([scripts/run.mjs:21-34](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/scripts/run.mjs#L21-L34)).

### Other repos
- `/home/jkeyser/pay/` — local checkout of the Pay billing service ([tools.md:54-57](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/tools.md#L54-L57)).

## Consumed by

- **cron-service** — publishes hourly business-hour triggers to `cron.jobs/ccw.run` ([CLAUDE.md:13-19](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/CLAUDE.md#L13-L19)). See cross-repo wiki at `https://wiki.jeffreykeyser.net/repos/Jeffrey-Keyser-cron-service/`.
- **openclaw-bridge / OpenCLAW** — consumes the same queue and spawns the Claude session.
- **Stripe** — calls `POST /webhook/stripe` on this repo's API ([api/server.mjs:7-11](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/api/server.mjs#L7-L11)).
- **Cloudflare Email Routing** — delivers prospect replies to `ccw-email-receiver` worker → `webhook.creamcityweb.com/email/inbound` ([workers/email-receiver/wrangler.toml:1-7](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/workers/email-receiver/wrangler.toml#L1-L7)).
- **Prospect browsers** — hit `{slug}.creamcityweb.com` and `staging.creamcityweb.com/{slug}.html` served through the Tunnel ([README.md:73-77](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/README.md#L73-L77)).
