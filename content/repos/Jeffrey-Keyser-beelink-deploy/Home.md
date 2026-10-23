---
title: "beelink-deploy"
description: "Overview of beelink-deploy, the self-hosted webhook deploy service on the Beelink that runs per-repo deploy scripts and publishes merge and push events to RabbitMQ."
---

# beelink-deploy

beelink-deploy is a self-hosted webhook deploy service for the Beelink. It receives GitHub push events and runs deploy scripts for configured services ([README.md:L3](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/README.md#L3)). It also publishes merged-PR and default-branch push events to RabbitMQ exchanges for downstream consumers ([src/server.ts:L183-L204](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L183-L204), [src/rabbit.ts:L10-L11](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/rabbit.ts#L10-L11)).

Its files live under `DATA_DIR`, including `status.json` and protected attempt logs ([src/status.ts:L6](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/status.ts#L6), [src/deployment-logs.ts:L78](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/deployment-logs.ts#L78)).

## At a glance

- TypeScript ESM service built with `tsc`; runtime dependencies are `express` and `amqplib` ([package.json:L5-L19](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/package.json#L5-L19)).
- Binds `127.0.0.1:9000` by default ([config/config.json:L2-L3](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/config/config.json#L2-L3), [src/config.ts:L60-L61](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/config.ts#L60-L61)).
- Two repo classes: service repos in `config/repos.json` deploy on push; package repos in `config/packages.json` publish on merged PRs ([src/server.ts:L277-L280](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L277-L280), [src/server.ts:L207-L211](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L207-L211)).
- Webhook HMAC check runs when `GITHUB_WEBHOOK_SECRET` is set ([src/server.ts:L156-L161](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L156-L161), [src/github.ts:L6-L28](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/github.ts#L6-L28)).
- Deploys serialize per repository; duplicate revisions are deduplicated ([README.md:L108-L112](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/README.md#L108-L112)).
- Only `GET /health`, `POST /webhook` and `POST /deploy/:owner/:repo` bypass the Pay admin gate ([src/server.ts:L65-L70](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L65-L70), [src/server.ts:L96-L109](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L96-L109)).
- Repo config hot-reloads on SIGHUP or SIGUSR2 ([src/index.ts:L24-L38](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/index.ts#L24-L38)).
- Shutdown waits up to 240 seconds for in-flight deploys ([src/index.ts:L7](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/index.ts#L7), [src/index.ts:L44-L56](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/index.ts#L44-L56)).

## Who uses it

- **Operator.** Edits `config/*.json`, reads protected logs and can trigger manual deploys ([README.md:L31-L42](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/README.md#L31-L42), [README.md:L101-L106](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/README.md#L101-L106)).
- **GitHub.** Documented webhook setup sends `push` events to `/webhook` on `deploy.jeffreykeyser.net` ([README.md:L71-L78](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/README.md#L71-L78)). Live delivery configuration is not in the snapshot.
- **RabbitMQ consumers.** Consumer code is not in the snapshot. `openclaw-bridge` and a wiki pipeline are named only in comments ([src/rabbit.ts:L4](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/rabbit.ts#L4), [src/server.ts:L180-L182](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L180-L182)). See [Services & Dependencies](../services-and-dependencies/).
- **Assistants.** A host assistant already authorized for the shared Pay account can read protected logs through a script ([scripts/read-deployment-log.mjs:L1-L3](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/scripts/read-deployment-log.mjs#L1-L3), [docs/deployment-logs.md:L108-L124](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/docs/deployment-logs.md#L108-L124)).

## Main flow

1. GitHub posts an event to `/webhook`, and the signature is checked ([README.md:L8](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/README.md#L8)).
2. A default-branch push publishes a `wiki.update` event before any deploy gate ([src/server.ts:L266-L274](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L266-L274)).
3. A service push is matched by repo and branch, skipped on `[skip deploy]`, or scheduled ([src/server.ts:L283-L304](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L283-L304)).
4. The runner executes `deploy.sh` or the default sequence ([src/deploy.ts:L272-L303](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/deploy.ts#L272-L303)).
5. The result is stored, status is recorded, health is polled and Telegram is notified when configured ([src/server.ts:L333-L352](https://github.com/Jeffrey-Keyser/beelink-deploy/blob/ca28cae58541cdd63ff9ad5e1601b13e3450a4b6/src/server.ts#L333-L352)).

## Wiki pages

- [Architecture](../architecture/): components, routes and storage contracts.
- [Iteration Loop](../iteration-loop/): how a change to this repo ships to itself.
- [Services & Dependencies](../services-and-dependencies/): confirmed and unknown callers.
- [Operations](../operations/): commands, environment, health and logs.
- [Glossary](../glossary/): project-specific terms.
