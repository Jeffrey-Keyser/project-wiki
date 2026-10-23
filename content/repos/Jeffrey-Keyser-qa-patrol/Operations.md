---
title: "Operations"
description: "How QA Patrol is started, deployed, tested, health-checked, and observed, distinguishing source-verified runtime facts from documented or unknown ones."
---

# Operations

QA Patrol is a deployable HTTP service, not a library. It starts a listener ([src/bin/www.ts:L13](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/bin/www.ts#L13)) and ships a systemd user unit ([qa-patrol.service:L2-L8](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/qa-patrol.service#L2-L8)).

## Documented versus verified

- **Verified from attached source**: the build and start scripts, the unit file's working directory, ExecStart, port, and NODE_ENV, and the health route code.
- **Documented only**: the unit being enabled and running, the public URL, and the beelink-deploy webhook ([README.md:L13](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/README.md#L13), [README.md:L59](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/README.md#L59)).
- **Unknown**: current live state, host paths outside the unit file, log retrieval commands, and any monitoring stack.

## Start

- `npm start` runs `node dist/bin/www.js` ([package.json:L8](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/package.json#L8)). Run `npm run build` first ([package.json:L7](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/package.json#L7)).
- `npm run dev` runs the TypeScript entry directly ([package.json:L6](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/package.json#L6)).
- The unit runs `node dist/bin/www.js` from the repository directory, with `PORT=3042`, `NODE_ENV=production`, and `DISPLAY=:99` ([qa-patrol.service:L6-L10](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/qa-patrol.service#L6-L10)). It restarts always ([qa-patrol.service:L17](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/qa-patrol.service#L17)).
- Startup fails without a valid `NODE_ENV` ([src/config/env.ts:L19-L22](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/config/env.ts#L19-L22)). The port defaults to 3042 ([src/config/env.ts:L24](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/config/env.ts#L24)).
- Restart with `systemctl --user restart qa-patrol` ([CLAUDE.md:L20](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/CLAUDE.md#L20)).
- On shutdown, the server closes and force-exits after 10 seconds ([src/bin/www.ts:L55-L64](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/bin/www.ts#L55-L64)). A port conflict exits the process ([src/bin/www.ts:L77-L80](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/bin/www.ts#L77-L80)).

## Deploy

The README's controlled procedure is to confirm no active runs, build, restart the user unit, and check `http://127.0.0.1:3042/health`. Until a repository deploy script exists, push with `[skip deploy]` ([README.md:L286](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/README.md#L286)). No deploy script is in the attached excerpts.

## Health

- `GET /health` runs the database check and a RabbitMQ check ([src/app.ts:L83-L91](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/app.ts#L83-L91)).
- A RabbitMQ setting that is absent counts as healthy ([src/app.ts:L43-L45](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/app.ts#L43-L45)). Any other non-ok state is reported as unhealthy ([src/app.ts:L49](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/app.ts#L49)).
- The README shows a public `/health` curl ([README.md:L13](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/README.md#L13)), which is not verified here.

## Test and proof

- `npm test` runs `node --test test/*.test.js` ([package.json:L10](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/package.json#L10)).
- The live Ping proof is pending operator verification. It is blocked unless authorization is set and the kill switch is `0` ([docs/ping-auth-proof.md:L3](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/docs/ping-auth-proof.md#L3), [src/services/ping-proof.ts:L117-L122](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/ping-proof.ts#L117-L122)).

## Observability

- Request logging uses the dev format and skips `/health` ([src/app.ts:L66-L68](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/app.ts#L66-L68)).
- Startup configuration is logged ([src/app.ts:L25-L30](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/app.ts#L25-L30)). Stack traces appear only in development ([src/app.ts:L101-L110](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/app.ts#L101-L110)).
- Completion-hook failures are logged without stopping the response ([src/routes/versions/v1/runs.ts:L258-L291](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/runs.ts#L258-L291)).
- The dashboard streams updates over SSE with a heartbeat ([src/routes/versions/v1/dashboard.ts:L130-L131](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/dashboard.ts#L130-L131), [src/routes/versions/v1/dashboard.ts:L210-L215](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/dashboard.ts#L210-L215)). Polling falls back every 10 seconds ([src/routes/dashboard-ui.ts:L288](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/dashboard-ui.ts#L288)).
- No metrics or tracing module appears in the attached excerpts.

## Storage and retention

- Evidence is written under `QA_PATROL_EVIDENCE_DIR`, or a default `evidence/runs` path ([src/services/playwright-runner.ts:L142-L143](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/playwright-runner.ts#L142-L143)).
- Cleanup keeps the latest run per group, and orphan directories are preserved ([src/services/evidence-cleanup.ts:L104-L107](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/evidence-cleanup.ts#L104-L107), [src/services/evidence-cleanup.ts:L164-L170](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/evidence-cleanup.ts#L164-L170)).
- The cron default is `0 3 * * *` unless `EVIDENCE_CLEANUP_SCHEDULE` is set ([src/bin/www.ts:L36](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/bin/www.ts#L36)).

## Known limits

Execution is synchronous, so long step arrays hold the request open ([README.md:L183](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/README.md#L183)).
