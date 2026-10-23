---
title: "Ping Iteration Loop"
description: "Contributor workflow for Ping: local setup, checks defined in the repo, the push-to-main deploy path, and migrations."
---

# Iteration Loop

This page describes the workflow the repository actually defines. The excerpts do not show branch protection or review gates, so none are assumed.

## Local setup

- Docker path: copy the Docker env example, then run `./scripts/docker-dev.sh` ([README.md:L52-L54](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L52-L54)).
- Manual path: the server runs on port 3001 and the client on port 3002 ([README.md:L57-L58](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L57-L58)). The server dev script runs `ts-node ./bin/www.ts` ([server/package.json:L8](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L8)).

## Checks

- Server unit tests: `npm test` runs `npx vitest run` ([server/package.json:L14](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L14)). Its include globs cover `tests/__tests__`, `domain`, and `routes` ([server/vitest.config.ts:L12-L16](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/vitest.config.ts#L12-L16)).
- Integration tests: `npm run test:integration` uses a separate config ([server/package.json:L17](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L17)). That config expects a test database on port 5433 by default ([server/vitest.config.integration.ts:L30-L31](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/vitest.config.integration.ts#L30-L31)).
- Replay tests: a config targets `tests/replay`, but no matching npm script appears in the excerpts ([server/vitest.config.replay.ts:L3](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/vitest.config.replay.ts#L3)).
- Docker test run: `npm run test:docker` uses `docker-compose.test.yml`, which is not in the excerpts ([server/package.json:L19](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L19)).
- Client tests: `npm run test` runs Vitest once ([client/package.json:L41](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/client/package.json#L41)).
- Lint: `npm run lint` runs ESLint over `.ts` files ([server/package.json:L11](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/server/package.json#L11)).

## Agent verification

Coding agents must run the `agents:verify` block in `AGENTS.md` before finishing ([AGENTS.md:L31-L35](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/AGENTS.md#L31-L35)). It checks four things:

- the `pay-auth-integration` version pin ([AGENTS.md:L37-L40](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/AGENTS.md#L37-L40));
- no forbidden private-subpath imports, where missing optional source roots are skipped and an empty set fails ([AGENTS.md:L44-L55](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/AGENTS.md#L44-L55));
- at most one `new PayAuth(` occurrence ([AGENTS.md:L58](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/AGENTS.md#L58));
- installed binaries, then client and server build and test ([AGENTS.md:L63-L67](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/AGENTS.md#L63-L67)).

## Push and deploy

```mermaid
sequenceDiagram
  participant dev as "Developer"
  participant repo as "GitHub main"
  participant hook as "beelink-deploy webhook"
  participant box as "Beelink host"
  participant sys as "systemd units"
  dev->>dev: Run checks and agents verify block
  dev->>repo: Push to main
  repo->>hook: Push event
  hook->>box: Run deploy.sh
  box->>box: Pull build and apply migrations
  box->>sys: Restart ping and ping-frontend
  sys-->>dev: Health probe reports healthy
```

The README says a push to `main` deploys automatically ([README.md:L63](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/README.md#L63)). The webhook configuration is not in the repo, so its exact behavior is unknown.

`deploy.sh` does the following:

- fast-forward pulls `origin main` ([deploy.sh:L8](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/deploy.sh#L8));
- builds the server with dev dependencies included, then the client ([deploy.sh:L15-L18](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/deploy.sh#L15-L18), [deploy.sh:L23-L25](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/deploy.sh#L23-L25));
- runs three migration helpers before restart and stops on failure ([deploy.sh:L30](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/deploy.sh#L30), [deploy.sh:L34](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/deploy.sh#L34), [deploy.sh:L37](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/deploy.sh#L37));
- restarts both units ([deploy.sh:L44-L45](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/deploy.sh#L44-L45));
- polls health for up to 30 attempts and exits non-zero on failure ([deploy.sh:L47-L57](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/deploy.sh#L47-L57)).

## Database changes

- The migration helpers are the ones `deploy.sh` runs before restart ([deploy.sh:L28-L37](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/deploy.sh#L28-L37)).
- `CLAUDE.md` documents `server/db/deploy.sh`, a `db-deploy` command, and Sequelize CLI generation ([CLAUDE.md:L102-L111](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/CLAUDE.md#L102-L111)). How these relate to the deploy helpers is unknown from the excerpts.
- Location replay migration 026 must be applied before the new service starts, and old location writers must be drained first ([docs/MOBILE_INTEGRATION.md:L355](https://github.com/Jeffrey-Keyser/ping/blob/86038591cb036f4b90ee00318760515952cc0ab2/docs/MOBILE_INTEGRATION.md#L355)).
