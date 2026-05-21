---
title: OpenClaw Bridge
description: Unified RabbitMQ-to-OpenClaw event bridge plus HTTP shim for the Jeffrey-Keyser ecosystem.
---

# OpenClaw Bridge

OpenClaw Bridge is the single fan-in service that connects every domain service in the Jeffrey-Keyser ecosystem to the OpenClaw / NanoClaw agent layer. Instead of running a per-domain bridge, this one Node.js process subscribes to many RabbitMQ exchanges, forwards relevant events to the OpenClaw webhook (or to NanoClaw via its Telegram message API), and also exposes a pile of inbound HTTP webhooks (Twilio, Cloudflare email, CCW contact form, pantry receipts, dev-inbox, plan-manager, etc.) ([README.md:1-13](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/README.md#L1-L13), [src/index.js:1-22](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L1-L22)).

## At a glance

- Node.js / Express service, entry point `src/index.js`, started by `npm start` ([package.json:6-10](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/package.json#L6-L10)).
- Listens on HTTP port `3099` for webhooks and an admin API ([src/index.js:24](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L24)).
- Subscribes to many RabbitMQ exchanges via a handler registry of 30 handlers ([src/handlers/index.js:41-71](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/handlers/index.js#L41-L71)).
- Forwards each event to OpenClaw, NanoClaw, or both based on per-handler routing config ([src/services/openclaw.js:24-48](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/openclaw.js#L24-L48), [src/services/routingConfig.js:9-22](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/routingConfig.js#L9-L22)).
- Runtime state (paused handlers, global kill switch) persisted to `data/bridge-state.json` ([src/services/bridgeState.js:11-66](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/bridgeState.js#L11-L66)).
- Deployed as a user-level systemd unit, redeploy via `deploy.sh` ([openclaw-bridge.service:1-15](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/openclaw-bridge.service#L1-L15), [deploy.sh:1-19](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/deploy.sh#L1-L19)).

## Who uses it

- **OpenClaw / Milo** — the downstream agent receiving wake-up messages over the `/hooks/agent` webhook ([src/services/openclaw.js:8-9](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/openclaw.js#L8-L9)).
- **NanoClaw** — the lightweight Telegram-only consumer reached via the local Message API ([src/services/nanoclaw.js:7-9](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/nanoclaw.js#L7-L9)).
- **Ecosystem services** — Ping, cron-service, agency-hq, plan-manager, ccw-email, spanish, flights, drive, logos, etc. — publish to RabbitMQ topics that the bridge subscribes to ([src/handlers/index.js:41-71](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/handlers/index.js#L41-L71)).
- **Inbound web traffic** — Twilio (SMS/voice), Cloudflare email worker, creamcityweb.com contact form, Telegram-uploaded pantry receipts ([src/index.js:131-322](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L131-L322)).

## How work moves through it

1. An external producer publishes an event to a RabbitMQ exchange (e.g. `ping.events`) or hits one of the bridge's HTTP endpoints.
2. A handler in `src/handlers/` parses the payload and constructs a human-readable message ([README.md:38-58](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/README.md#L38-L58)).
3. `sendToOpenClaw` consults the routing config and dispatches to OpenClaw, NanoClaw, or both, recording delivery in forward-stats ([src/services/openclaw.js:24-48](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/openclaw.js#L24-L48)).
4. Failed deliveries get one retry; a second failure drops the message to avoid poison loops ([src/services/rabbit.js:78-99](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/rabbit.js#L78-L99)).

## Wiki pages

- [Architecture](./architecture/) — modules, services, handler registry, routing
- [Iteration Loop](./iteration-loop/) — adding a handler, change cycle
- [Services and Dependencies](./services-and-dependencies/) — inbound/outbound integrations
- [Operations](./operations/) — deploy, systemd, port, admin API, logs
- [Glossary](./glossary/) — repo-specific terms
