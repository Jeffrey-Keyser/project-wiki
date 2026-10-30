---
title: "Glossary"
description: "Project-specific terms used in beelink-deploy, each tied to the source excerpt that defines it."
---

# Glossary

**Service repo.** A repo in `config/repos.json`. A push to its branch runs `deploy.sh` or the default sequence ([config/repos.json:L2-L6](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/config/repos.json#L2-L6), [src/deploy.ts:L289-L303](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/deploy.ts#L289-L303)).

**Package repo.** A repo in `config/packages.json`. Its merged PRs publish `package.push` events and push-to-service deploys are ignored ([config/packages.json:L2-L6](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/config/packages.json#L2-L6), [src/server.ts:L277-L280](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L277-L280)).

**`healthUrl`.** Optional URL polled after a successful deploy. The poll runs every 2 s up to 15 s ([src/config.ts:L9](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/config.ts#L9), [src/healthCheck.ts:L1-L2](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/healthCheck.ts#L1-L2)). The README advises a backend endpoint for split hosts ([README.md:L44-L50](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/README.md#L44-L50)).

**Immutable worktree.** `deploymentMode: immutable-worktree` checks the revision into a detached release under `releaseRoot`. The operator checkout is not reset ([README.md:L92-L97](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/README.md#L92-L97), [src/deploy.ts:L245-L268](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/deploy.ts#L245-L268)).

**Checkout deployment.** A repo without immutable-worktree mode, deployed from its live checkout ([src/deploy.ts:L294-L299](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/69c67435cab42acd0c3be42fedee39e71eafac55/src/deploy.ts#L294-L299)).

**Deploy lag.** How many commits a checkout deployment's `HEAD` trails the fetched `origin/<branch>`, plus the age of the oldest undeployed commit. It is reported only in failed-deploy Telegram messages ([src/deploy-lag.ts:L8-L33](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/69c67435cab42acd0c3be42fedee39e71eafac55/src/deploy-lag.ts#L8-L33), [src/server.ts:L38-L44](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/69c67435cab42acd0c3be42fedee39e71eafac55/src/server.ts#L38-L44)).

**Lockfile drift.** Host-side changes to tracked `package-lock.json`, `npm-shrinkwrap.json`, `yarn.lock` or `pnpm-lock.yaml` left by install steps. Checkout deployments restore them to `HEAD` before updating so `git pull --ff-only` is not blocked ([src/deploy.ts:L335-L362](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/69c67435cab42acd0c3be42fedee39e71eafac55/src/deploy.ts#L335-L362)).

**Drain.** The shutdown window that waits for queued or active deploys, up to 240 s ([src/index.ts:L7](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/index.ts#L7), [src/deploy.ts:L124-L137](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/deploy.ts#L124-L137)). Under `KillMode=mixed` only the Node process receives SIGTERM, so in-flight deploy children are drained rather than killed by systemd ([beelink-deploy.service:L13-L15](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/8ff4e92609b74aaa8ed1265292007ef26f6c035e/beelink-deploy.service#L13-L15)).

**`packages.events`.** Durable topic exchange for `package.push.<owner>.<repo>` events ([src/rabbit.ts:L10](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/rabbit.ts#L10), [src/rabbit.ts:L144](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/rabbit.ts#L144)).

**`wiki.events`.** Durable topic exchange for `wiki.update.<owner>.<repo>` events. Merged PRs and default-branch pushes publish to it. Push events may include `changedFiles` and `before` ([src/rabbit.ts:L11](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/rabbit.ts#L11), [src/rabbit.ts:L44-L67](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/rabbit.ts#L44-L67), [src/wiki-push.ts:L39-L53](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/wiki-push.ts#L39-L53)).

**`[skip deploy]` and `[no deploy]`.** Head-commit markers that skip a service deploy, matched case-insensitively ([src/server.ts:L296-L299](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L296-L299)).

**`[skip wiki]`.** Head-commit marker that suppresses only the wiki event ([src/wiki-push.ts:L29](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/wiki-push.ts#L29)).

**Deployment ID.** A timestamp plus UUID assigned to each actual deploy attempt. Retries get new IDs ([src/deployment-logs.ts:L203-L207](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/deployment-logs.ts#L203-L207), [docs/deployment-logs.md:L17-L18](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/docs/deployment-logs.md#L17-L18)).

**Protected attempt log.** Authenticated, bounded record of command output stored under `DATA_DIR` ([docs/deployment-logs.md:L3-L6](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/docs/deployment-logs.md#L3-L6)).

**Diagnostic code.** A fixed label such as `AGENCY_REVISION` or an npm or TypeScript code, shown in summaries. Codes are clues, not root causes ([src/deploy-diagnostics.ts:L10-L11](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/deploy-diagnostics.ts#L10-L11), [README.md:L138-L141](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/README.md#L138-L141)).

**Status store.** `status.json` under `DATA_DIR`, with one record per repo. Each record holds the latest attempt, and a successful record's commit is the live revision ([src/status.ts:L8-L18](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/status.ts#L8-L18), [src/status.ts:L101-L108](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/8ff4e92609b74aaa8ed1265292007ef26f6c035e/src/status.ts#L101-L108)).

**Live revision.** The commit of a repo's latest deploy attempt when that attempt succeeded. After a failed attempt it is unknown, so any revision may be redeployed ([src/status.ts:L101-L108](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/8ff4e92609b74aaa8ed1265292007ef26f6c035e/src/status.ts#L101-L108), [src/deploy.ts:L80-L101](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/8ff4e92609b74aaa8ed1265292007ef26f6c035e/src/deploy.ts#L80-L101)).

**Deploy log buffer.** In-memory list of up to 20 entries per repo ([src/deploy.ts:L27-L28](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/deploy.ts#L27-L28), [src/deploy.ts:L162-L182](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/deploy.ts#L162-L182)).

**Hot reload.** SIGHUP or SIGUSR2 re-reads repo and package config without a restart ([src/index.ts:L24-L38](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/index.ts#L24-L38), [src/config.ts:L72-L86](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/config.ts#L72-L86)).

**Pay admin.** A current Pay identity with the admin role, verified against `/api/v1/auth/me` on every protected read ([src/log-access.ts:L55-L65](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/log-access.ts#L55-L65)).

**`X-Deploy-Key`.** Header named by the README for manual deploys ([README.md:L101-L106](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/README.md#L101-L106)). Its comparison code is beyond the excerpt.
