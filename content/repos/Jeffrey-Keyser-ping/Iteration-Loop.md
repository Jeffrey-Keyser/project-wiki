---
title: Ping Iteration Loop
description: How a change moves from idea to merge to running on the Beelink.
---

# Iteration Loop

Ping single-developer repo. Workflow optimized for fast Shortcut-to-prod loop on self-hosted host.

```mermaid
sequenceDiagram
  participant Dev as Jeff (local)
  participant Repo as GitHub main
  participant Hook as beelink-deploy webhook
  participant Box as Beelink
  participant Sys as systemd (ping / ping-frontend)

  Dev->>Dev: edit server/ or client/, run npm test
  Dev->>Dev: agents:verify block (build + test + import lint)
  Dev->>Repo: git push origin main
  Repo->>Hook: push webhook
  Hook->>Box: ssh + run deploy.sh
  Box->>Box: git pull, npm install, npm run build (server + client)
  Box->>Sys: systemctl restart ping, ping-frontend
  Sys-->>Dev: /health 200, Shortcuts resume
```

## Steps

1. **Local dev** — Docker compose stack or manual `npm run dev` per workspace (server on :3001, client on :3002) ([README.md:49-59](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L49-L59)).
2. **Tests** — `npx vitest run` for server, `vitest --run` for client; integration suite has its own config ([server/package.json:14-17](https://github.com/Jeffrey-Keyser/ping/blob/main/server/package.json#L14-L17), [client/package.json:40-41](https://github.com/Jeffrey-Keyser/ping/blob/main/client/package.json#L40-L41)).
3. **Agent-enforced verification** — Any coding agent editing the repo must run the machine-extracted block in `AGENTS.md` (pay-auth version pin, no private subpath imports, single `PayAuth` instance, host-installed dependency check, `npm run build && npm test`) ([AGENTS.md:30-53](https://github.com/Jeffrey-Keyser/ping/blob/main/AGENTS.md#L30-L53)). The private-subpath check matches only `import`, `from`, or `require` statements that reference `@jeffrey-keyser/pay-auth-integration/dist` or `/internal`, and only in `.ts`, `.tsx`, `.js`, and `.jsx` files under `src`, `client`, `server`, and `cli`. Plain mentions of those paths in other text do not trip it ([AGENTS.md:43](https://github.com/Jeffrey-Keyser/ping/blob/main/AGENTS.md#L43)).
4. **Push to `main`** — No PR-review gate enforced in this repo (solo dev); merge straight to `main`. Recent history shows direct merges and review-feedback commits ([git log: `Merge branch 'plan/a54548c2'`, `Fix: address review feedback`](https://github.com/Jeffrey-Keyser/ping/commits/main)).
5. **Auto-deploy** — `beelink-deploy` webhook service receives the push and runs `deploy.sh` on the Beelink: pull, install, build server, build client, `systemctl restart ping && systemctl restart ping-frontend` ([README.md:61-63](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L61-L63), [deploy.sh:1-29](https://github.com/Jeffrey-Keyser/ping/blob/main/deploy.sh#L1-L29)).
6. **Verify live** — `/health` endpoint plus database health check ([server/app.ts:201-209](https://github.com/Jeffrey-Keyser/ping/blob/main/server/app.ts#L201-L209)). Shortcuts resume calling `/api/v1/*` on next trigger.

## Notes on the loop

- Terraform path (Lambda/RDS/S3/CloudFront) still exists as fallback but is **not** the production deploy ([README.md:113-116](https://github.com/Jeffrey-Keyser/ping/blob/main/README.md#L113-L116)).
- `GITHUB_TOKEN` is required for dependency installs wherever a `package.json` depends on `@jeffrey-keyser/*`. Once the host bootstrap has installed `client/` and `server/`, builds and tests run without it. The agents:verify block checks for installed binaries instead of the token ([AGENTS.md:20-28](https://github.com/Jeffrey-Keyser/ping/blob/main/AGENTS.md#L20-L28), [AGENTS.md:49-53](https://github.com/Jeffrey-Keyser/ping/blob/main/AGENTS.md#L49-L53)). `.npmrc` lookup is project-then-user, not parent-dir.
- For migrations, follow `server/db` deploy flow described in `CLAUDE.md` ([CLAUDE.md:74-93](https://github.com/Jeffrey-Keyser/ping/blob/main/CLAUDE.md#L74-L93)).
