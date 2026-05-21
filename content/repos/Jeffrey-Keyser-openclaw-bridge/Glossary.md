---
title: Glossary
description: Repo-specific terms used inside openclaw-bridge.
---

# Glossary

### Bridge

The whole process: a single Node.js service that bridges many RabbitMQ exchanges plus inbound HTTP webhooks into the OpenClaw / NanoClaw agent layer. Named in the README opening line ([README.md:1-5](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/README.md#L1-L5)).

### Handler

A module under `src/handlers/` that owns one domain — typically subscribing to one RabbitMQ exchange and forwarding a formatted message. Handlers are registered in a single array and walked at startup; each must export an `init()` function ([src/handlers/index.js:41-102](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/handlers/index.js#L41-L102), [README.md:38-58](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/README.md#L38-L58)).

### Handler registry

The `handlers` array in `src/handlers/index.js`. Authoritative list of which handlers exist and which are enabled at boot. The admin API's runtime pause is layered on top via `bridgeState` ([src/handlers/index.js:41-71](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/handlers/index.js#L41-L71)).

### Target / Routing target

Per-handler destination of `openclaw | nanoclaw | both`. Default is `nanoclaw`. Stored in-memory only (no disk persistence) and managed by `services/routingConfig.js` ([src/services/routingConfig.js:9-22](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/routingConfig.js#L9-L22)).

### OpenClaw / Milo

The downstream agent that receives wake-up messages via the `/hooks/agent` webhook with a bearer token. "Milo" is the agent persona behind OpenClaw, called out in the README tagline ([README.md:3](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/README.md#L3), [src/services/openclaw.js:53-67](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/openclaw.js#L53-L67)).

### NanoClaw

A lighter-weight delivery surface: a local Message API that fans messages out as Telegram (`tg:<id>`) messages. Gated by `NANOCLAW_ENABLED=true` and addressed via `NANOCLAW_CHAT_JID` ([src/services/nanoclaw.js:7-47](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/nanoclaw.js#L7-L47)).

### Wake mode

Field sent to OpenClaw on every webhook POST: `wakeMode: 'now'` — instructs OpenClaw to deliver immediately rather than batching ([src/services/openclaw.js:62-67](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/openclaw.js#L62-L67)).

### JID

Recipient identifier passed to NanoClaw. Format is `<channel>:<id>`, e.g. `tg:8340382755` for Telegram chat id 8340382755. NanoClaw client rejects JIDs without a colon ([src/services/nanoclaw.js:9](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/nanoclaw.js#L9), [src/services/nanoclaw.js:37-41](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/nanoclaw.js#L37-L41)).

### Global pause / kill switch

`bridgeState.globalPause`. When true, `isHandlerEnabled` returns false for every handler, so the rabbit consumers ack-skip every message. Toggled via `PUT /admin/bridge {paused:bool}` and persisted to disk ([src/services/bridgeState.js:72-95](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/bridgeState.js#L72-L95), [src/index.js:98-107](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L98-L107)).

### Poison message

A message that fails forwarding twice in a row. After the second failure, the bridge nacks it without requeue rather than looping. This rule exists because a single un-forwardable ccw-email message previously produced ~5,720 log lines per minute against a stopped OpenClaw target ([src/services/rabbit.js:82-99](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/rabbit.js#L82-L99)).

### Forward stats

Per-handler counter of the last delivery attempt to OpenClaw or NanoClaw, recorded by `recordForward(name, success)` and surfaced via `GET /admin/forward-stats` ([src/services/forwardStats.js](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/forwardStats.js), [src/services/openclaw.js:46-47](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/openclaw.js#L46-L47), [src/index.js:54-57](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L54-L57)).

### Bridge state file

`data/bridge-state.json`. Persists `{ globalPause, handlers }` so pause overrides survive restarts. Path overridable via `BRIDGE_STATE_DIR` ([src/services/bridgeState.js:11-66](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/services/bridgeState.js#L11-L66)).

### Dev inbox

Append-only directory of markdown "ideas" (default `/home/jkeyser/dev-inbox/ideas`). `POST /dev-inbox/submit` writes a timestamped file with a repo slug ([src/index.js:515-538](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L515-L538)).

### Plan manager mount

The bridge `require`s `handlers/plan-manager` and calls `.mount(app)` to graft its HTTP routes directly onto the Express app — a shim over the dev-inbox `plan-manager.sh` CLI ([src/index.js:507-512](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L507-L512)).
