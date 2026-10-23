---
title: "Spanish Studio Operations"
description: "Start, deploy, test, and health commands for spanish-studio, with documented versus verified runtime status."
---

# Operations

Spanish Studio is a deployed web application with an API, a static client, and an internal sidecar. It is not a library.

## Start

- **Server dev:** `npm run dev` runs the TypeScript entry ([server/package.json:7](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/package.json#L7)).
- **Server production:** build, then `node dist/bin/www.js` ([server/package.json:8-9](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/package.json#L8-L9)). The default port is 3054 ([env.ts:72](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/config/env.ts#L72)).
- **Client:** dev server on 3055 ([vite.config.ts:15-17](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/client/vite.config.ts#L15-L17)). Production uses `serve -s dist` on 127.0.0.1:3055 ([spanish-studio-client.service:8](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/spanish-studio-client.service#L8)).
- **Sidecar:** runs `app.py` from a service-local venv, bound to 127.0.0.1:3056 ([spanish-studio-intonation.service:12](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/intonation-sidecar/spanish-studio-intonation.service#L12), [spanish-studio-intonation.service:21-22](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/intonation-sidecar/spanish-studio-intonation.service#L21-L22)).
- Two server unit files appear in the excerpts ([spanish-studio-server.service:10](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/spanish-studio-server.service#L10), [spanish-studio.service:8](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/spanish-studio.service#L8)). Which one is installed on the host is unknown.

## Deploy

- Documented steps: build server and client, run `npm run migrate`, then restart the units ([README.md:227-233](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L227-L233)).
- `deploy.sh` runs the same migration step before restart, and `set -e` stops deployment on failure ([README.md:235-237](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/README.md#L235-L237)). The script itself is not in the excerpts, so its contents are documented, not verified.
- A 2026-07-05 record says deploy.sh health-gates ports 3054, 3055, and 3056 ([phase3b-smoke-evidence.md:27-28](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/docs/phase3b-smoke-evidence.md#L27-L28)).

## Test

- Server: `npm test` runs `vitest run` ([server/package.json:11](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/package.json#L11)). Live Azure tests skip without a key ([server/vitest.config.ts:8-10](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/vitest.config.ts#L8-L10)).
- Sidecar: pytest ([nix-development.md:30](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/docs/nix-development.md#L30)).
- Migrations: `npm run migrate:status` exits nonzero unless all files are applied and unchanged ([run-migrate.js:57](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/scripts/run-migrate.js#L57), [database-migrations.md:44-45](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/docs/database-migrations.md#L44-L45)).

## Health

- Server `/health` is a public, database-checked liveness route ([app.ts:58](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/app.ts#L58), [app.ts:66-74](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/app.ts#L66-L74)).
- Sidecar `/health` returns status and Parselmouth versions ([app.py:54-59](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/intonation-sidecar/app.py#L54-L59)).

## Observability

- Startup logs config and port ([app.ts:15-20](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/app.ts#L15-L20)). Request logs skip `/health` ([app.ts:43-46](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/app.ts#L43-L46)). Stack traces appear only in development ([app.ts:82-90](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/app.ts#L82-L90)).
- Analytics Pulse emits best-effort usage events that never change request outcomes ([analytics-pulse.ts:1-9](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/server/src/lib/analytics-pulse.ts#L1-L9)).
- Metrics, tracing, and alerting are not in the excerpts, so they are unknown.

## Documented versus verified

- A 2026-06-15 check of public `/health` returned the SPA HTML shell, so it did not prove server database health ([multi-persona-group-roleplay-verification.md:175-180](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/docs/multi-persona-group-roleplay-verification.md#L175-L180)).
- The same check returned 401 for `/api/v1/health` ([multi-persona-group-roleplay-verification.md:188-191](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/docs/multi-persona-group-roleplay-verification.md#L188-L191)).
- A 2026-06-15 check found the scenario-suggest route returning 404 on both local and public targets ([struct-scenarios-smoke-evidence.md:201-205](https://github.com/Jeffrey-Keyser/spanish-studio/blob/e93efeff9acd23c86435e82003bab960a94bfd38/docs/struct-scenarios-smoke-evidence.md#L201-L205)). Current deployment state is unknown.
