---
title: Iteration Loop
description: How code changes move from idea to merged + deployed inside feedback-registry — branch, test, CI, beelink-deploy webhook.
---

# Iteration Loop

The repo follows the standard Jeffrey-Keyser ecosystem cycle: feature branch → PR → CI checks (lint, unit tests, build) → merge to `main` → `beelink-deploy` webhook pulls and restarts the systemd unit on the homelab. There is no Lambda-based deploy in CI even though the repo was bootstrapped from `ServerlessWebTemplate` ([README.md:41-49](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L41-L49), [.github/workflows/ci-cd-pipeline.yml:9-10](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/.github/workflows/ci-cd-pipeline.yml#L9-L10)).

## Cycle

```mermaid
sequenceDiagram
  autonumber
  participant Dev as Developer
  participant Repo as feedback-registry (git)
  participant CI as GitHub Actions
  participant Hook as beelink-deploy webhook
  participant Box as Beelink homelab
  participant API as systemd: feedback-registry

  Dev->>Dev: npm run dev (server :3001)
  Dev->>Dev: npm test (jest) + npm run lint
  Dev->>Repo: push feature branch + open PR
  Repo->>CI: ci-cd-pipeline.yml on PR
  CI->>CI: test-backend (node 20)
  CI->>CI: test-frontend (node 20)
  Dev->>Repo: merge to main
  Repo->>CI: ci-cd-pipeline.yml on main
  CI->>Hook: curl -H Bearer trigger {service, ref}
  Hook->>Box: git pull + npm ci + build
  Hook->>API: systemctl restart feedback-registry
  API-->>Dev: /health green
```

## Step references

1. **Local dev**: `cd server && npm run dev` runs `ts-node ./bin/www.ts`, listening on `config.PORT` (default 3001). Tests via `npm test` (Jest + Supertest); lint via `npm run lint` (ESLint 9 flat config) ([server/package.json:7-15](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/package.json#L7-L15), [server/bin/www.ts:1-23](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/bin/www.ts#L1-L23)).
2. **Branch + PR**: standard GitHub flow. The repo also accepts a `thrash` maintenance action whose contract is "small, low-risk PR — improve docs, fix obvious quality issues, verify lint + tests + build before opening" ([README.md:17-25](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L17-L25)).
3. **CI checks**: `.github/workflows/ci-cd-pipeline.yml` runs `test-backend` and `test-frontend` jobs on Node 20, each checking out the shared `@jeffrey-keyser/github-actions` repo first ([.github/workflows/ci-cd-pipeline.yml:16-66](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/.github/workflows/ci-cd-pipeline.yml#L16-L66)).
4. **Merge to main**: triggers the `deploy-backend` job that POSTs `{"service":"feedback-registry","ref":"<sha>"}` to the `beelink-deploy` webhook with `BEELINK_DEPLOY_TOKEN` ([.github/workflows/ci-cd-pipeline.yml:73-85](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/.github/workflows/ci-cd-pipeline.yml#L73-L85)).
5. **Homelab pull + restart**: the webhook (managed outside this repo on the Beelink) pulls the new ref and restarts the systemd unit; the comment in CI explicitly says "Deployment is handled by beelink-deploy webhook service (not GitHub Actions)" ([.github/workflows/ci-cd-pipeline.yml:9-10](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/.github/workflows/ci-cd-pipeline.yml#L9-L10)).
6. **Widget release** (separate flow): `publish-feedback-widget.yml` publishes `@jeffrey-keyser/feedback-widget` when the package version bumps ([.github/workflows/publish-feedback-widget.yml](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/.github/workflows/publish-feedback-widget.yml)).
7. **Terraform changes**: `terraform_deploy.yml` is manual `workflow_dispatch`; infra is not auto-applied on merge ([.github/workflows/terraform_deploy.yml](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/.github/workflows/terraform_deploy.yml), [CLAUDE.md:289-294](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/CLAUDE.md#L289-L294)).

## Practical notes

- DB migrations live under `server/db` and are applied with `./deploy.sh` or `npx db-deploy …` against the Postgres schema `feedback` — run as part of the change cycle when the slice touches schema ([CLAUDE.md:95-112](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/CLAUDE.md#L95-L112), [README.md:354-359](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/README.md#L354-L359)).
- Pre-merge expectations: `npm run lint` + `npm test` must pass; type checking is implicit via `tsc` build in CI ([server/package.json:7-15](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/server/package.json#L7-L15)).
- Auth changes that touch Pay integration should be tested against the live Pay service URL — there is no local Pay mock ([CLAUDE.md:223-229](https://github.com/Jeffrey-Keyser/feedback-registry/blob/main/CLAUDE.md#L223-L229)).
