---
title: "OpenClaw Bridge"
description: "Overview of openclaw-bridge, a Node.js service that forwards RabbitMQ and HTTP events from the Jeffrey-Keyser ecosystem to the OpenClaw and NanoClaw agent layer."
---

# OpenClaw Bridge

OpenClaw Bridge is one Node.js process that subscribes to RabbitMQ exchanges, runs domain handlers, and forwards formatted messages to an agent layer. The package describes itself as a unified RabbitMQ-to-OpenClaw event bridge for the Jeffrey-Keyser ecosystem ([package.json:L4](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/package.json#L4)). Instead of one bridge per service, a single service subscribes to several exchanges and forwards relevant events ([README.md:L5-L7](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/README.md#L5-L7)). The same process also serves Express routes for webhooks and a bridge admin API ([src/index.js:L1-L8](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L1-L8)).

## At a glance

- Entry point is `src/index.js`, started with `npm start` ([package.json:L6-L7](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/package.json#L6-L7)).
- HTTP server listens on `HTTP_PORT`, defaulting to 3099 ([src/index.js:L22](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L22)).
- The handler registry lists 25 handlers, all marked enabled in source ([src/handlers/index.js:L38-L62](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/index.js#L38-L62)).
- Routing defaults to `nanoclaw` for every handler ([src/services/routingConfig.js:L6](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/routingConfig.js#L6), [L21](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/routingConfig.js#L21)).
- Pause state is persisted to a `bridge-state.json` file in the state directory ([src/services/bridgeState.js:L12-L16](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/bridgeState.js#L12-L16)).
- Production run mode (user unit versus system unit) is unknown from this snapshot. See Operations.

## Who uses it

- **OpenClaw / Milo:** receives webhook POSTs at `OPENCLAW_WEBHOOK_URL` with bearer auth ([src/services/openclaw.js:L8-L9](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/openclaw.js#L8-L9), [L53-L68](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/openclaw.js#L53-L68)).
- **NanoClaw:** receives enqueue calls only when `NANOCLAW_ENABLED` is `true` ([src/services/nanoclaw.js:L7-L8](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/nanoclaw.js#L7-L8), [L43-L47](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/nanoclaw.js#L43-L47)).
- **Event producers:** the handlers subscribe to exchanges such as `ping.events` and `cron.alerts` ([README.md:L85-L86](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/README.md#L85-L86)). Whether each producer is running is unknown from this snapshot.
- **Inbound web callers:** Twilio webhooks, an inbound email route described as coming from a Cloudflare Worker, and the creamcityweb.com contact form ([src/index.js:L130](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L130), [L204](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L204), [L216](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L216)).

## Main flow

1. A producer publishes to RabbitMQ, or calls an HTTP route.
2. The consumer checks pause state, then parses the JSON body ([src/services/rabbit.js:L67-L78](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/rabbit.js#L67-L78)).
3. The handler builds a message and calls `sendToOpenClaw` ([src/handlers/cron.js:L27-L29](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/cron.js#L27-L29)).
4. Routing selects OpenClaw, NanoClaw, or both, and the attempt is recorded ([src/services/openclaw.js:L31-L46](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/openclaw.js#L31-L46)).
5. A failed RabbitMQ message is requeued once, then dropped on a second failure ([src/services/rabbit.js:L81-L98](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/rabbit.js#L81-L98)).

## Scope notes

The source excerpts are partial. `src/index.js` is truncated after line 360, so routes past that point are unknown here. The older wiki listed pantry, qa-patrol, logos, and cron-health handlers. None appear in the current registry ([src/handlers/index.js:L38-L62](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/index.js#L38-L62)). The pantry receipt path was retired ([README.md:L109-L115](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/README.md#L109-L115)).

## Wiki pages

- [Architecture](../architecture/)
- [Iteration Loop](../iteration-loop/)
- [Services and Dependencies](../services-and-dependencies/)
- [Operations](../operations/)
- [Glossary](../glossary/)
