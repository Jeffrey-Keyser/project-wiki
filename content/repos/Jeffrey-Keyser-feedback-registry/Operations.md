---
title: Operations
description: Runtime topology, start command, port, deploy path (beelink-deploy + systemd), health, logs, and on-call notes for feedback-registry.
---

# Operations

Feedback Registry runs as a long-lived Node process on the Beelink homelab — not as a Lambda — despite being bootstrapped from `ServerlessWebTemplate`. Deploys are pull-based: GitHub Actions notifies a `beelink-deploy` webhook on merge to `main`, the homelab pulls the new ref and restarts the systemd unit ([.github/workflows/ci-cd-pipeline.yml:9-10](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/.github/workflows/ci-cd-pipeline.yml#L9-L10), [.github/workflows/ci-cd-pipeline.yml:73-85](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/.github/workflows/ci-cd-pipeline.yml#L73-L85)).

## Start command

```bash
cd server
npm run build      # tsc -> dist/
npm start          # node ./dist/bin/www.js
# dev mode:
npm run dev        # ts-node ./bin/www.ts
```

Both scripts boot through `server/bin/www.ts`, which calls `expressApp.listen(config.PORT)` and registers SIGTERM/SIGINT graceful shutdown handlers ([server/package.json:7-12](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/package.json#L7-L12), [server/bin/www.ts:1-50](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/bin/www.ts#L1-L50)).

## Port

`PORT` env var, default **3001**. Parsed in `server/config/env.ts` — invalid values fail fast at startup ([server/config/env.ts:71-74](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/config/env.ts#L71-L74)).

Public surface: `https://api.feedback.jeffreykeyser.net` (reverse-proxied to the homelab port) ([README.md:184-186](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L184-L186)).

## Systemd unit

Managed by the `beelink-deploy` service on the homelab, outside this repo. The CI deploy job triggers it with:

```
POST <beelink-deploy>/deploy
Authorization: Bearer ${BEELINK_DEPLOY_TOKEN}
{"service":"feedback-registry","ref":"<git-sha>"}
```

The webhook is expected to `git fetch`, `npm ci`, `npm run build`, then `systemctl restart feedback-registry` ([.github/workflows/ci-cd-pipeline.yml:73-85](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/.github/workflows/ci-cd-pipeline.yml#L73-L85)). The startup log line confirms which port and config the unit chose ([server/bin/www.ts:15-22](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/bin/www.ts#L15-L22)).

## Health probes

- `GET /health` — primary liveness/readiness endpoint, logged by `bin/www.ts` on boot ([server/bin/www.ts:17-19](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/bin/www.ts#L17-L19)).
- `GET /ping` — lightweight ping kept unversioned by template convention ([CLAUDE.md:90-97](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/CLAUDE.md#L90-L97)).
- `GET /api/v1/diagnostics/detailed` — DB + dependency status (Pay, Struct, SMTP) ([CLAUDE.md:73-77](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/CLAUDE.md#L73-L77), [server/routes/versions/v1/index.ts:49](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/routes/versions/v1/index.ts#L49)).
- DB health is wired through `createDatabaseHealthCheck` from `express-server-factory` ([server/app.ts:1-5](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/app.ts#L1-L5)).

## Logs

- Console-based: morgan for HTTP, structured config dump at startup (`=== SERVER CONFIGURATION ===`) ([server/app.ts:21-28](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/app.ts#L21-L28)).
- Captured by systemd journal on the Beelink — view with `journalctl -u feedback-registry -f`.
- Correlation IDs injected by `correlationIdMiddleware` so a single request can be traced across services ([server/app.ts:6](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/app.ts#L6)).

## Swagger / API docs

`GET /api-docs` serves Swagger UI built from JSDoc comments on the route files via `swagger-jsdoc` + `swagger-ui-express` ([server/package.json:34-35](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/package.json#L34-L35), [server/bin/www.ts:18-19](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/bin/www.ts#L18-L19)).

## Database operations

- Schema lives under `server/db`; deploy via `./server/db/deploy.sh` or `npx db-deploy directory ./db/schema` ([CLAUDE.md:95-112](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/CLAUDE.md#L95-L112)).
- Connection pool initialized in `server/db/connection.ts` and shared with the session store ([server/app.ts:30-31](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/app.ts#L30-L31)).
- Schema name is `feedback` (apps / submissions / comments / notifications) ([README.md:344-446](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L344-L446)).

## Terraform footprint

There is a `terraform/` directory inherited from the template, but infra apply is manual (`workflow_dispatch`) and not part of CI ([CLAUDE.md:289-294](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/CLAUDE.md#L289-L294)). The active runtime is homelab + systemd; the Lambda/ECR scaffolding remains for potential future migration ([README.md:41-49](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L41-L49)).

## On-call notes

- If `/health` is down: `systemctl status feedback-registry` on the Beelink; tail journal.
- If submissions land but no GitHub issues: check `feedback.apps.github_repo` is set and the GitHub PAT (`PRIVATE_ACTIONS_TOKEN` or service-level token) is valid ([README.md:312-324](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L312-L324)).
- If triage is degraded: Struct service at port 3032 may be down — `AutoTriageService` falls back to keyword triage automatically; verify via `/api/v1/diagnostics/detailed` ([CLAUDE.md:174-179](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/CLAUDE.md#L174-L179)).
- If users stop receiving emails: inspect `feedback.notifications` rows for `status='failed'` + `error_message` ([README.md:430-446](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L430-L446)).
