---
title: "Operations"
description: "Start, deploy, test, and health commands for presence-signal, with a clear split between documented and verified runtime behavior."
---

# Operations

presence-signal is a long-running service, not a library. It runs as a systemd unit with a loopback HTTP server. [presence-signal.service:L6-L14](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/presence-signal.service#L6-L14)

## Commands

- Start: `npm start` runs `node dist/index.js`. [package.json:L10](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/package.json#L10)
- Test: `npm test`. [package.json:L11](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/package.json#L11)
- Build: `npm run build`. [package.json:L8](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/package.json#L8)
- Dry run: `npm run once`. It authenticates and evaluates once. [README.md:L64-L65](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/README.md#L64-L65)
- Deploy: `deploy.sh` pulls, installs, builds, restarts `presence-signal.service`, and checks health. [deploy.sh:L4-L17](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/deploy.sh#L4-L17)

The unit restarts always after 10 seconds. [presence-signal.service:L13-L14](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/presence-signal.service#L13-L14)

## Health and observability

- `GET http://127.0.0.1:3075/health` returns JSON with status, poll times, present targets, and `historyError`. [src/service.ts:L9-L20](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/service.ts#L9-L20) It returns 503 when degraded. [src/service.ts:L140](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/service.ts#L140)
- Errors are logged to the console. [src/service.ts:L58](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/service.ts#L58)
- Poll history is available at `/history`. [src/service.ts:L146-L157](https://github.com/Jeffrey-Keyser/presence-signal/blob/e14bb8a187e751f1ab035cc5654aa16d7f9b491b/src/service.ts#L146-L157)

## Documented versus verified

The documentation describes the endpoints and commands above. This wiki pass did not run the service, the tests, or the router. Whether the unit is installed on the host, and whether the deploy health check currently passes, are unknown.
