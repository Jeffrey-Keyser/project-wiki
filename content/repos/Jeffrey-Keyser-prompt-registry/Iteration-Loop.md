---
title: Iteration Loop
description: How a change moves from local edit to running on the homelab.
---

# Iteration loop

The loop is short because there's no cloud infra and no auth surface to coordinate.

```mermaid
sequenceDiagram
  participant Dev as Developer
  participant Local as Local server (npm run dev)
  participant CI as GitHub Actions
  participant Box as Beelink homelab
  participant CF as Cloudflare Tunnel

  Dev->>Local: edit server/** + run npm run dev
  Local-->>Dev: Swagger at /api-docs, hot ts-node reload
  Dev->>Dev: npm test, npm run lint
  Dev->>CI: open PR to main
  CI-->>Dev: install + lint + tests on PR
  Dev->>Box: merge to main, pull, npm run build
  Dev->>Box: sudo systemctl restart prompt-registry
  Box->>CF: app listens on PORT 3001
  CF-->>Dev: live at prompt-api.jeffreykeyser.net
```

## Steps

1. **Edit & run locally.** `cd server && npm run dev` boots ts-node against `bin/www.ts`, reading `.env` ([CLAUDE.md:19-22](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L19-L22), [server/package.json:7](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/package.json#L7)).
2. **Apply schema changes.** New SQL goes under `server/db/schema/` and is applied via `./deploy.sh` or the `db-deploy` CLI ([CLAUDE.md:36-43](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L36-L43)).
3. **Test.** `npm test`, `npm run test:watch`, or `npm run test:coverage`; suites live in `server/tests/__tests__/` ([CLAUDE.md:29-32](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L29-L32)).
4. **Lint and typecheck.** `npm run lint` (ESLint v9 flat config) and `npm run build` (tsc) ([server/package.json:8-10](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/server/package.json#L8-L10)).
5. **Open a PR.** CI runs the node-build composite action against `main/server` on every PR to `main` ([.github/workflows/ci-cd-pipeline.yml:9-40](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/.github/workflows/ci-cd-pipeline.yml#L9-L40)).
6. **Merge and deploy.** Pull on the homelab, `npm run build`, then `sudo systemctl restart prompt-registry`; Cloudflare Tunnel keeps the public URL pointed at it ([CLAUDE.md:218-220](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L218-L220), [prompt-registry.service:6-13](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/prompt-registry.service#L6-L13)).
7. **Observe.** `sudo journalctl -u prompt-registry -f` for live logs ([CLAUDE.md:15-17](https://github.com/Jeffrey-Keyser/prompt-registry/blob/main/CLAUDE.md#L15-L17)).

There is no canary, no blue/green, no staging environment in repo — a single systemd unit is the deployment target.
