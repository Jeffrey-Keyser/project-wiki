---
title: Services and Dependencies
description: Inbound producers, outbound consumers, and library dependencies of openclaw-bridge.
---

# Services and Dependencies

The bridge sits in the middle of the ecosystem: it consumes from many producers (RabbitMQ + HTTP) and emits to two consumers (OpenClaw, NanoClaw). It also runs a couple of subprocess shells (himalaya, ical.py).

## Depends on

### NPM libraries

From `package.json`: `express` (HTTP), `body-parser`, `amqplib` (RabbitMQ client), `@jeffrey-keyser/message-contracts` (typed event payloads), `@anthropic-ai/sdk`, `mailparser`, `pg` (Postgres — used by spanish handlers and others), `resend` (email send), `twilio` ([package.json:11-20](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/package.json#L11-L20)).

### External infrastructure

- **RabbitMQ** — connection URL from `RABBITMQ_URL`. On connect, asserts the outbound `openclaw.events` topic exchange ([src/services/rabbit.js:10-50](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/rabbit.js#L10-L50)). systemd unit declares `After=rabbitmq-server.service` ([openclaw-bridge.service:3](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/openclaw-bridge.service#L3)).
- **OpenClaw webhook** — `OPENCLAW_WEBHOOK_URL` (default `http://localhost:18789/hooks/agent`), bearer auth via `OPENCLAW_HOOK_TOKEN` ([src/services/openclaw.js:8-9](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/openclaw.js#L8-L9), [src/services/openclaw.js:53-67](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/openclaw.js#L53-L67)).
- **NanoClaw Message API** — `NANOCLAW_MESSAGE_API_URL` (default `http://127.0.0.1:3102/api/v1/messages`), gated on `NANOCLAW_ENABLED=true`, recipient JID `NANOCLAW_CHAT_JID` ([src/services/nanoclaw.js:7-9](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/nanoclaw.js#L7-L9)).
- **Postgres** — `pg` is in the dependency set for handlers like spanish review that call SQL functions directly ([src/index.js:580-589](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L580-L589)).
- **Ping API** — `PING_API_BASE` + `PING_API_KEY` for gym-zone workout auto-provisioning ([src/handlers/ping.js:18-40](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/handlers/ping.js#L18-L40)).
- **himalaya CLI + ical.py** — invoked via `execFile` for `/email/*` and `/calendar/events` proxy endpoints ([src/index.js:326-505](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L326-L505)).

### Inbound RabbitMQ producers

Each handler module names the exchange it subscribes to. The registry has 30 entries; representative examples ([src/handlers/index.js:41-71](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/handlers/index.js#L41-L71)):

- `ping.events` (location arrive/depart) — ping handler ([README.md:69](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/README.md#L69))
- `cron.alerts` (cron job failures) — cron handler ([README.md:70](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/README.md#L70))
- Spanish, briefing, news, summary, package, backup, reminder, ccw, thrash, pantry, flights, workout, drive, agency, decisions, cron-health, logos, qa-patrol, plan-manager — all registered handlers in `src/handlers/index.js` ([src/handlers/index.js:41-71](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/handlers/index.js#L41-L71))

### Inbound HTTP webhooks (port 3099)

- `POST /twilio/sms`, `/twilio/voice`, `/twilio/sms/status`, `/twilio/send`, `/twilio/call` ([src/index.js:131-185](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L131-L185))
- `POST /email/inbound` — Cloudflare worker forwards inbound CCW email ([src/index.js:273-280](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L273-L280))
- `POST /ccw/contact` — creamcityweb.com contact form ([src/index.js:285-322](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L285-L322))
- `POST /pantry/receipt` — uploads receipt image, publishes to `pantry.events` ([src/index.js:189-251](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L189-L251))
- `POST /dev-inbox/submit`, `POST /decisions/notify`, `POST /spanish/review` ([src/index.js:518-594](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L518-L594))
- `GET /email/list|read|attachments`, `GET /calendar/events` — himalaya + ical proxy ([src/index.js:334-505](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L334-L505))

## Consumed by

- **OpenClaw / Milo** — receives every event the bridge routes to it via `/hooks/agent` ([src/services/openclaw.js:53-67](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/openclaw.js#L53-L67)).
- **NanoClaw** — receives Telegram-shaped events at `recipient: tg:...` ([src/services/nanoclaw.js:9-47](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/nanoclaw.js#L9-L47)).
- **cron-service admin UI** — calls the `/admin/handlers` and `/admin/targets` endpoints; CORS is wildcarded for that origin ([src/index.js:38-44](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L38-L44), [src/index.js:73-95](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L73-L95)).
- **Downstream RabbitMQ exchanges** — the bridge publishes to `openclaw.events` (for inbound webhooks like Twilio) and `ccw.events`, `pantry.events` as a producer too ([src/index.js:122-129](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L122-L129), [src/index.js:243-244](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L243-L244), [src/index.js:256-269](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L256-L269)).
