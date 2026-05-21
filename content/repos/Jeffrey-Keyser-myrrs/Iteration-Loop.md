---
title: Iteration Loop
description: How a change moves from local edit to a running Beelink deploy.
---

# Iteration Loop

The repo follows a "backend first, then frontend" change flow with a single-command deploy script targeting the homelab ([CLAUDE.md:113-118](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L113-L118), [deploy.sh:1-23](https://github.com/Jeffrey-Keyser/myrrs/blob/main/deploy.sh#L1-L23)).

```mermaid
sequenceDiagram
  participant Dev as Developer
  participant Server as src/server
  participant Client as src/client
  participant Git as main branch
  participant Box as Beelink (systemd)

  Dev->>Server: add service / repo / route
  Dev->>Server: npm test (jest)
  Dev->>Client: add component + RTK Query slice
  Dev->>Client: npm test (vitest)
  Dev->>Git: commit + push to main
  Dev->>Box: ./deploy.sh
  Box->>Git: git pull origin main
  Box->>Server: npm ci --production && npm run build
  Box->>Client: npm ci --production && npm run build
  Box->>Box: systemctl --user restart myrrs-api myrrs-frontend
```

## Step-by-step

1. **Schema first when needed.** New table or column lands as a migration in `src/server/db/migrations/`, then TS types in `src/server/types/`, then repositories and mappers ([CLAUDE.md:131-135](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L131-L135)).
2. **Backend feature.** Service logic → repository call → route handler under `src/server/routes/` mounted in `app.ts` ([src/server/app.ts:123-132](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/app.ts#L123-L132)).
3. **Backend tests.** Jest with `ts-jest`; full-build smoke when tests behave oddly: `rm -rf dist && npm run build && npm test` ([src/server/package.json:13](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/package.json#L13), [CLAUDE.md:64-66](https://github.com/Jeffrey-Keyser/myrrs/blob/main/CLAUDE.md#L64-L66)).
4. **Frontend integration.** Add RTK Query endpoints in `src/client/src/reducers/*Api.ts`, wire to a component under `src/client/src/components/` and a page under `src/client/src/pages/` ([src/client/src/reducers](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/client/src/reducers), [src/client/src/pages](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/client/src/pages)).
5. **Frontend tests.** Vitest + React Testing Library: `npm test` inside `src/client` ([src/client/package.json:35](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/client/package.json#L35)).
6. **Local end-to-end check.** Dev servers: client `vite` on :3002, API `ts-node ./bin/www.ts` ([src/client/package.json:32](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/client/package.json#L32), [src/server/package.json:8](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/package.json#L8), [src/server/app.ts:54-55](https://github.com/Jeffrey-Keyser/myrrs/blob/main/src/server/app.ts#L54-L55)).
7. **Ship.** Push to `main`, run `deploy.sh` on the Beelink — it pulls, builds both workspaces, restarts systemd units ([deploy.sh:5-21](https://github.com/Jeffrey-Keyser/myrrs/blob/main/deploy.sh#L5-L21)).

There is no separate staging environment in-repo; `main` is the deploy branch.
