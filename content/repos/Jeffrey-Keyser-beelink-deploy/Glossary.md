---
title: Glossary
description: Repo-specific terms used by beelink-deploy — service repo vs package repo, drain, healthUrl, status store, exchanges.
---

# Glossary

**Service repo.** A repository listed in `config/repos.json`. On a `push` event to its configured branch, beelink-deploy runs `deploy.sh` (if present) or the default `git pull` / `npm ci --production` / `systemctl restart` sequence on the local checkout ([config/repos.json:1-126](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/config/repos.json#L1-L126), [src/deploy.ts:141-160](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/deploy.ts#L141-L160)).

**Package repo.** A repository listed in `config/packages.json`. These are not deployed locally; instead, a merged PR to the configured branch is republished onto RabbitMQ as a `package.push.*` event for downstream package consumers ([config/packages.json:1-47](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/config/packages.json#L1-L47), [src/server.ts:131-191](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L131-L191)).

**`healthUrl`.** Optional URL on a service repo entry. When set, beelink-deploy polls it every 2 s for up to 15 s after a successful deploy and includes the result in the Telegram notification. For split frontend/backend services, point this at the backend API that exercises real dependencies (e.g. DB connectivity), not the static frontend ([README.md:44-50](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/README.md#L44-L50), [src/healthCheck.ts:1-37](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/healthCheck.ts#L1-L37)).

**Drain.** The shutdown window during which the process refuses to exit while deploys are still running. Driven by an `inflightDeploys` counter and a list of resolver callbacks; max 240 s ([src/index.ts:6](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/index.ts#L6), [src/deploy.ts:25-54](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/deploy.ts#L25-L54)).

**`packages.events` exchange.** Durable RabbitMQ topic exchange. Routing key shape `package.push.<owner>.<repo>`. Messages are persistent JSON `PackagePushEvent` records ([src/rabbit.ts:10](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/rabbit.ts#L10), [src/rabbit.ts:108-128](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/rabbit.ts#L108-L128)).

**`wiki.events` exchange.** Durable RabbitMQ topic exchange used to fan a package merge out to the wiki pipeline. Routing key shape `wiki.update.<owner>.<repo>`. Publishing is best-effort: failure is logged but does not fail the webhook response ([src/rabbit.ts:11](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/rabbit.ts#L11), [src/rabbit.ts:134-156](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/rabbit.ts#L134-L156), [src/server.ts:181-186](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L181-L186)).

**Deploy log buffer.** In-memory `Map<string, DeployLogEntry[]>` keyed by `owner/repo`, capped at 20 entries each. Surfaced by `GET /deploy/:owner/:repo/logs`. Lost on restart by design ([src/deploy.ts:21-85](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/deploy.ts#L21-L85)).

**Status store.** Persistent JSON at `data/status.json`. One `DeployStatus` record per repo: last attempt timestamp, commit SHA, commit message, branch, success flag, duration, error. Read by `GET /api/status`, which also computes an `ok` / `degraded` / `down` rollup ([src/status.ts:8-22](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/status.ts#L8-L22), [src/status.ts:100-124](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/status.ts#L100-L124)).

**`[skip deploy]` / `[no deploy]`.** Commit-message escape hatch. Matched case-insensitively against the head commit message of a `push` event; when present the deploy is recorded as `skipped` ([src/server.ts:231-235](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L231-L235)).

**Hot reload.** `SIGHUP` or `SIGUSR2` triggers `reloadRepos()`, which re-reads `repos.json` and `packages.json` and swaps the in-memory maps on the running Express app without restarting the process ([src/index.ts:19-34](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/index.ts#L19-L34), [src/config.ts:70-84](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/config.ts#L70-L84)).

**Manual deploy key.** `X-Deploy-Key` header value, compared against the `DEPLOY_API_KEY` env, gates the operator-triggered `POST /deploy/:owner/:repo` endpoint ([src/server.ts:273-281](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/main/src/server.ts#L273-L281)).
