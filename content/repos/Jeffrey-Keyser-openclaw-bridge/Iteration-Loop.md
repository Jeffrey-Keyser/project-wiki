---
title: Iteration Loop
description: How a new handler or feature moves from idea to running service inside openclaw-bridge.
---

# Iteration Loop

The repo's day-to-day change is "add a new bridge handler" or "tweak an existing one". The README documents the canonical recipe ([README.md:38-72](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/README.md#L38-L72)); the actual code paths are short and predictable.

## Change cycle

```mermaid
flowchart TD
  A[Idea: new producer wants to fan out events] --> B[Create src/handlers/<name>.js]
  B --> C[Export async init() that calls subscribeToExchange/subscribeToQueue]
  C --> D[Forward via sendToOpenClaw with name + channel]
  D --> E[Register in src/handlers/index.js handlers array]
  E --> F[Add Node --test file at repo root: test-<name>.test.js]
  F --> G[npm test + npm run lint]
  G --> H[git push main]
  H --> I[deploy.sh on host: git pull, npm ci, systemctl --user restart]
  I --> J[journalctl -u openclaw-bridge -f to verify init]
```

## Steps, cited to source

1. **Author the handler.** New file under `src/handlers/`. Convention: export `init()` that calls `subscribeToExchange(exchangeName, queueName, handleEvent)` and an internal `handleEvent` that returns `await sendToOpenClaw(message, { name })`. The README walks through a minimal example ([README.md:38-58](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/README.md#L38-L58)). Existing handlers like `src/handlers/ping.js` show the production shape, including `@jeffrey-keyser/message-contracts` typing and external API calls ([src/handlers/ping.js:1-40](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/handlers/ping.js#L1-L40)).

2. **Register it.** Append a row to the `handlers` array in `src/handlers/index.js`. The registry is the single source of truth; `initializeHandlers()` walks it in order and sets `setCurrentHandler(name)` so the rabbit subscriber captures the handler name for pause-checks ([src/handlers/index.js:41-102](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/handlers/index.js#L41-L102)).

3. **Write a test.** Tests live as `test-*.test.js` files at the repo root and run under `node --test`. Recent examples: `test-qa-patrol-handler.test.js`, `test-plan-manager-watchdog.test.js`, `test-nanoclaw.test.js` ([package.json:8](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/package.json#L8)).

4. **Lint and test.** `npm run lint` is a `node --check` pass on the three core files; `npm test` runs the node test suite ([package.json:7-9](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/package.json#L7-L9)).

5. **Ship.** Push to `main`. On the host, `deploy.sh` does `git pull`, `npm ci --production`, then `systemctl --user restart openclaw-bridge` ([deploy.sh:1-19](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/deploy.sh#L1-L19)).

6. **Verify.** The bridge prints a startup banner and `Handlers: N active, M failed`; tail with `journalctl -u openclaw-bridge -f` ([src/index.js:597-620](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L597-L620), [README.md:74-80](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/README.md#L74-L80)).

## Hot path: pausing or rerouting without redeploy

Because handler pause state and routing target both live in memory plus disk, you can change them via the admin API without restarting:

- `PUT /admin/handlers/:name` toggles a single handler ([src/index.js:60-70](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L60-L70)).
- `PUT /admin/bridge` flips the global kill switch ([src/index.js:98-107](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L98-L107)).
- `PUT /admin/targets/:handler` reroutes between `openclaw | nanoclaw | both` ([src/index.js:83-95](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/main/src/index.js#L83-L95)).

Use these for "is this handler the noisy one?" debugging before changing code.
