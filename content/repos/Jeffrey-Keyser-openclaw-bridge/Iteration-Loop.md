---
title: "Iteration Loop"
description: "Contributor workflow for changing openclaw-bridge, grounded in package scripts, the handler registry, deploy.sh, and the service unit."
---

# Iteration Loop

Most changes add a handler or adjust an existing one. The steps below use the scripts and deploy path in the snapshot. The excerpts include no CI configuration, so whether CI runs is unknown.

## Change cycle

```mermaid
flowchart TD
  A["Add or edit a module in src/handlers"]
  B["Register the entry in the handlers array"]
  C["Add or update a node test file"]
  D["npm run lint"]
  E["npm test"]
  F["Push to origin main"]
  G["Run deploy.sh on the host"]
  H["systemctl user restart openclaw-bridge"]
  I["Check journalctl for handler init lines"]
  A --> B --> C --> D --> E --> F --> G --> H --> I
```

## Steps

1. **Write the handler.** The README shows a minimal pattern: an `init()` that calls `subscribeToExchange`, plus a handler that calls `sendToOpenClaw` ([README.md:L46-L66](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/README.md#L46-L66)). Current handlers also use `subscribeToQueue` for topic patterns. The cron alert handler is one example ([src/handlers/cron.js:L14-L16](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/cron.js#L14-L16)).

2. **Register it.** Add an entry to the `handlers` array. Entries have the shape `{ name, module, enabled }` ([src/handlers/index.js:L37-L38](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/index.js#L37-L38)). A handler that is not in this array is not initialized ([L68-L91](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/index.js#L68-L91)).

3. **Lint.** `npm run lint` runs `node --check` on five named files only: the entry point, bridge state, the handler registry, plan-manager, and one test file ([package.json:L8](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/package.json#L8)). This script does not syntax-check other handler files. `typecheck` is an alias for lint ([package.json:L11](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/package.json#L11)).

4. **Test.** `npm test` runs `node --test` ([package.json:L9](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/package.json#L9)). Most test files are not in the excerpts, so overall coverage is unknown.

   `test-flights-auth.test.js` is one visible example. It stubs `src/services/rabbit` through `require.cache` and replaces `global.fetch` and `console` ([test-flights-auth.test.js:L4-L27](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/48a98d91a89da554413b552bf3c3dd4b6c622e09/test-flights-auth.test.js#L4-L27)). It then checks three things for both Flights handlers ([L37-L64](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/48a98d91a89da554413b552bf3c3dd4b6c622e09/test-flights-auth.test.js#L37-L64)):
   - The bearer header is sent and the payload is forwarded unchanged.
   - No request is made when the key is missing.
   - A 401 is logged without exposing the key.

   This pattern is a reasonable template for testing other handlers that make outbound HTTP calls.

5. **Build check.** `npm run build` only runs syntax checks on the entry point and plan-manager ([package.json:L10](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/package.json#L10)).

6. **Deploy.** `deploy.sh` runs `git pull origin main`, then `npm ci --production`, then `systemctl --user restart openclaw-bridge` ([deploy.sh:L12](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/deploy.sh#L12), [L15](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/deploy.sh#L15), [L18](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/deploy.sh#L18)).

7. **Verify.** The README tails logs with `journalctl -u openclaw-bridge -f` ([README.md:L92-L93](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/README.md#L92-L93)). Handler init logs either `Handler initialized` or a skip message ([src/handlers/cron.js:L44-L47](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/cron.js#L44-L47)).

## Runtime toggles without redeploy

You can change pause and routing state through the admin API without a restart. The routes are:
- `PUT /admin/handlers/:name` ([src/index.js:L58-L68](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L58-L68))
- `PUT /admin/bridge` ([src/index.js:L96-L105](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L96-L105))
- `PUT /admin/targets/:handler` ([src/index.js:L81-L93](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/index.js#L81-L93))

Use these to isolate a noisy handler before changing code.

Route targets are keyed by the name passed to `sendToOpenClaw`, not the registry name. For example, the briefing handler sends `Morning Email Triage` ([src/handlers/briefing.js:L39-L41](https://github.com/Jeffrey-Keyser/openclaw-bridge/blob/d6c5d8e55b0d6ccdae14101efc8b33b9db0e8e11/src/handlers/briefing.js#L39-L41)). Check that key before rerouting.

## Hygiene

Source files contain embedded credentials and fallback secrets. Do not copy them into docs or tickets. Move them into environment configuration before you add new integrations.
