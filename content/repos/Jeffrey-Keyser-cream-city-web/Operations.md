---
title: Operations
description: How Cream City Web runs in production — systemd units, ports, secrets, logs, and on-call notes for the static site server and payment API.
---

# Operations

Cream City Web exposes two deployable surfaces (static site server + payment API) plus a Cloudflare Worker. Everything else in the repo is operator-invoked CLI.

## Static site server

- **Systemd unit:** `cream-city-web-server.service`, `User=jkeyser`, `WorkingDirectory=/home/jkeyser/cream-city-web` ([cream-city-web-server.service:1-12](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/cream-city-web-server.service#L1-L12)).
- **Start command:** `/usr/bin/node /home/jkeyser/cream-city-web/scripts/serve.mjs 3050` ([cream-city-web-server.service:9](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/cream-city-web-server.service#L9)).
- **Port:** 3050 (local), exposed publicly via Cloudflare Tunnel as `{slug}.creamcityweb.com` and `staging.creamcityweb.com` ([README.md:73-77](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/README.md#L73-L77)).
- **Restart policy:** `Restart=on-failure`, `RestartSec=5` ([cream-city-web-server.service:10-11](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/cream-city-web-server.service#L10-L11)).
- **Operator commands:** `npm start` or `sudo systemctl start cream-city-web-server` ([README.md:64-71](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/README.md#L64-L71)).

## Payment API

- **Entry:** `api/server.mjs`. Loads `.env` then overlays Solo Vault secrets via `loadSecrets()` ([api/server.mjs:22-44](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/api/server.mjs#L22-L44)).
- **Port:** `process.env.CCW_API_PORT` (default 3051) ([api/server.mjs:41](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/api/server.mjs#L41)).
- **Health probe:** `GET /health` ([api/server.mjs:7-12](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/api/server.mjs#L7-L12)).
- **Stripe webhook:** `POST /webhook/stripe` — raw body bypass installed in middleware ([api/server.mjs:67-76](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/api/server.mjs#L67-L76)).
- **External calls:** `PAY_API_URL` (default `https://pay-api.jeffreykeyser.net`) with `Authorization: Bearer ${PAY_API_TOKEN}` ([api/server.mjs:42-65](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/api/server.mjs#L42-L65)).
- **Required env:** `DATABASE_URL`, `PAY_API_URL`, `PAY_API_TOKEN`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY` ([README.md:51-61](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/README.md#L51-L61)).

## Cloudflare email-receiver worker

- **Worker name:** `ccw-email-receiver`, entry `src/index.js` ([workers/email-receiver/wrangler.toml:1-3](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/workers/email-receiver/wrangler.toml#L1-L3)).
- **Forwards to:** `https://webhook.creamcityweb.com/email/inbound` ([workers/email-receiver/wrangler.toml:5-6](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/workers/email-receiver/wrangler.toml#L5-L6)).
- **Secret:** `WEBHOOK_SECRET` set via `wrangler secret put WEBHOOK_SECRET` ([workers/email-receiver/wrangler.toml:8](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/workers/email-receiver/wrangler.toml#L8)).

## Observability

- **Run history:** `node scripts/run.mjs history [--limit=10]` reads the `runs` table ([scripts/run.mjs:7-9](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/scripts/run.mjs#L7-L9)).
- **Dashboard:** `node scripts/run.mjs dashboard` prints pipeline state ([CLAUDE.md:22-30](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/CLAUDE.md#L22-L30)).
- **Markdown logs:** every run lands under `data/runs/YYYY-MM-DD-HHMM.md` for audit ([CLAUDE.md:47-54](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/CLAUDE.md#L47-L54)).
- **Systemd journal:** `journalctl -u cream-city-web-server` for static server logs.

## On-call / escalation

Any blocker requiring Jeffrey — account setup, spend > $20, phone calls, in-person mail/registration, payment disputes — is routed through `run.mjs notify "<msg>"` which writes a NanoClaw IPC file that reaches Jeffrey via Telegram ([scripts/run.mjs:21-34](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/scripts/run.mjs#L21-L34), [CLAUDE.md:172-181](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/CLAUDE.md#L172-L181)).

## Budget

Seed budget ~$100. Domain registration ~$10–15 only after customer agreement. Hosting effectively free (Cloudflare Tunnel + local server). All spend tracked in the `spend` table ([CLAUDE.md, Budget section](https://github.com/Jeffrey-Keyser/cream-city-web/blob/main/CLAUDE.md)).
