---
title: "Glossary"
description: "Project-specific terms used in openclaw-bridge, each tied to the source that defines it."
---

# Glossary

### Bridge

The single Node.js process that subscribes to RabbitMQ exchanges, runs handlers, and serves HTTP routes ([package.json:L4](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/package.json#L4)).

### Handler

A module in `src/handlers/` that owns one domain and exports `init()`. Handlers are listed in the registry ([src/handlers/index.js:L37-L62](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/index.js#L37-L62)).

### Handler registry

The `handlers` array in `src/handlers/index.js`. Only entries in this array are initialized ([src/handlers/index.js:L68-L91](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/index.js#L68-L91)).

### Fanout and topic subscription

`subscribeToExchange` binds a fanout exchange with an empty key. `subscribeToQueue` binds a topic exchange with a routing pattern ([src/services/rabbit.js:L55-L65](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/rabbit.js#L55-L65), [L106-L114](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/rabbit.js#L106-L114)).

### Routing target

Per-handler destination of `openclaw`, `nanoclaw`, or `both`. The default is `nanoclaw`. Values are held in memory only ([src/services/routingConfig.js:L9](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/routingConfig.js#L9), [L19-L22](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/routingConfig.js#L19-L22)).

### OpenClaw / Milo

OpenClaw is the webhook target. The README names the agent persona as Milo ([README.md:L3](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/README.md#L3), [src/services/openclaw.js:L8](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/openclaw.js#L8)).

### NanoClaw

A second delivery target that receives an agent-event with `recipient`, `instruction`, and `source`. Enabled by `NANOCLAW_ENABLED` ([src/services/nanoclaw.js:L7-L8](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/nanoclaw.js#L7-L8), [L43-L47](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/nanoclaw.js#L43-L47)).

### JID

A recipient string of the form `channel:id`, such as a Telegram chat. The NanoClaw client rejects values without a colon ([src/services/nanoclaw.js:L37-L41](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/nanoclaw.js#L37-L41)).

### Wake mode

The `wakeMode: 'now'` field sent with each OpenClaw webhook POST ([src/services/openclaw.js:L66](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/openclaw.js#L66)).

### Global pause

`globalPause` in bridge state. When true, every handler reports disabled ([src/services/bridgeState.js:L72-L73](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/bridgeState.js#L72-L73)). Consumers ack and skip messages ([src/services/rabbit.js:L70-L75](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/rabbit.js#L70-L75)).

### Bridge state file

`bridge-state.json` in the state directory. It stores `globalPause` and handler overrides ([src/services/bridgeState.js:L16](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/bridgeState.js#L16), [L40-L43](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/bridgeState.js#L40-L43)).

### Poison message

A message that fails twice. It is dropped without requeue ([src/services/rabbit.js:L83-L94](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/rabbit.js#L83-L94)).

### Forward stats

The last delivery attempt per handler name, recorded on each forward ([src/services/openclaw.js:L46](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/openclaw.js#L46), [src/services/forwardStats.js:L18-L29](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/services/forwardStats.js#L18-L29)).

### Loopback-only email routes

The `/email` proxy routes require a loopback socket and a local host header. Public tunnel traffic must not reach them ([src/index.js:L265-L287](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L265-L287)). This is separate from `/email/inbound`, which is a public route.

### Public edge gate

Middleware in `src/publicEdge.js`. A request is tunnel traffic when it has `CF-Ray` or `CF-Connecting-IP` headers, or a public `Host`. Tunnel traffic reaches only an exact list of webhook and health routes. Every other route returns 404 ([src/publicEdge.js @ 9e9b630e](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/9e9b630e3a0a58bb36de7556f272c792165adb94/src/publicEdge.js)).

### Twilio signature validation

The check that every `/twilio/*` webhook passes before its handler runs. It validates `X-Twilio-Signature` against `TWILIO_AUTH_TOKEN` and fails closed with 503 when the token is unset ([src/handlers/twilio.js @ 9e9b630e](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/9e9b630e3a0a58bb36de7556f272c792165adb94/src/handlers/twilio.js)).

### Untrusted block

Text from an outside sender (contact form fields, email body, SMS body). The bridge puts it in the agent instruction as quoted data, inside a fence longer than any backtick run in the text. Such text is never placed into SQL or shell commands ([src/services/untrusted.js @ 9e9b630e](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/9e9b630e3a0a58bb36de7556f272c792165adb94/src/services/untrusted.js)).

### Dev inbox

The directory root used by plan-manager, defaulting to a path under the operator's home ([src/handlers/plan-manager.js:L19](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/plan-manager.js#L19)).

### Wake inbox and dead letter

Plan-manager stores wake records per plan. After 24 attempts by default, a record moves to `dead/` ([src/handlers/plan-manager.js:L35](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/plan-manager.js#L35), [L112-L118](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/plan-manager.js#L112-L118)).

### Reconnect probe

A weekly handler that closes one consumer connection per critical queue and checks that a new one appears ([src/handlers/reconnect-probe.js:L1-L6](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/reconnect-probe.js#L1-L6)).

### Agency IPC task

A JSON file written to NanoClaw's IPC directory to schedule a one-time CEO standup prompt ([src/handlers/agency.js:L43-L62](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/agency.js#L43-L62)).

### Spanish tick and teach

Spanish events have two stages. A tick arrives from cron, and the dispatcher publishes a teach command for the tutor ([src/handlers/spanish-dispatcher.js:L22-L37](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/spanish-dispatcher.js#L22-L37)).

### Retired pantry receipt

The pantry-receipt handler, its intake route, and its model selector were removed in 2026. Pantry now ingests receipts itself ([README.md:L109-L115](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/README.md#L109-L115)).
