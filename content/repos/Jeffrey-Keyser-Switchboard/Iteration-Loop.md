---
title: Iteration Loop
description: How a code change moves from branch to production in Switchboard, from local dev through CI to Terraform/Lambda deploy.
---

# Iteration Loop

Switchboard ships through GitHub branches into a Lambda + CloudFront stack managed by Terraform. The change cycle is structured around `develop` → `main` with automated CI and a manual-trigger Terraform job ([.github/workflows/ci-cd-pipeline.yml:1-7](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/.github/workflows/ci-cd-pipeline.yml#L1-L7), [README.md:540-552](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L540-L552)).

## Cycle

```mermaid
sequenceDiagram
  autonumber
  participant Dev as Developer
  participant Local as Local (server+client)
  participant GH as GitHub PR
  participant CI as ci-cd-pipeline.yml
  participant Main as main branch
  participant TF as terraform_deploy.yml
  participant Lam as AWS Lambda + S3/CloudFront

  Dev->>Local: npm run dev (server :3001, client :3000)
  Dev->>Local: npm test / npm run lint
  Dev->>GH: open PR to main
  GH->>CI: run test-frontend on PR
  CI-->>GH: coverage + status
  Dev->>Main: merge PR
  Main->>CI: push to main triggers build/deploy job
  CI->>Lam: build Docker image, push to ECR, update Lambda; sync client to S3, invalidate CloudFront
  Dev->>TF: gh workflow run terraform_deploy.yml (manual)
  TF->>Lam: apply infra changes if any
  Dev->>Lam: ./scripts/smoke-tests.sh
```

## Steps

1. **Local dev** — `npm run dev` in `server/` starts ts-node on `PORT` (defaults from `env.ts`), `npm run dev` in `client/` runs Vite at `http://localhost:3000`; API docs at `/api-docs` ([server/package.json:6-13](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/package.json#L6-L13), [README.md:447-459](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L447-L459)).
2. **Pre-commit checks** — `npm run lint` (ESLint v9 flat config) and `npm test` (Jest in server, Vitest in client) ([server/eslint.config.js](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/eslint.config.js), [CLAUDE.md:451-457](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L451-L457)).
3. **PR to main** — PRs trigger `test-frontend` in `ci-cd-pipeline.yml`, which runs `npm run coverage` in `client/` and posts coverage on failure ([.github/workflows/ci-cd-pipeline.yml:10-57](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/.github/workflows/ci-cd-pipeline.yml#L10-L57)).
4. **Merge to main / develop** — push triggers the build+deploy jobs in the same workflow: builds the server Docker image, pushes to ECR, updates Lambda; builds client and syncs to S3; invalidates CloudFront ([.github/workflows/ci-cd-pipeline.yml](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/.github/workflows/ci-cd-pipeline.yml), [README.md:540-552](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L540-L552)).
5. **Infra changes** — `terraform_deploy.yml` is workflow-dispatch only; run `gh workflow run terraform_deploy.yml --field auto-apply=true` to apply ([.github/workflows/terraform_deploy.yml](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/.github/workflows/terraform_deploy.yml), [README.md:548-552](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L548-L552)).
6. **Post-deploy validation** — `./scripts/validate-deployment.sh` then `./scripts/smoke-tests.sh` with `ADMIN_JWT` env ([scripts/](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/scripts), [README.md:554-571](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/README.md#L554-L571)).
7. **DB schema changes** — separate path: edit SQL in `server/db/`, run `cd server/db && ./deploy.sh`; migrations also supported via Sequelize CLI ([server/db/deploy.sh](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/server/db/deploy.sh), [CLAUDE.md:81-100](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L81-L100)).

## Conventions

- Branch names follow `feature/...`, `dev-inbox/...`; recent merges show this style in git log (e.g., `Merge branch 'dev-inbox/06de974b-feat/audit-trail-feature-toggle-service'`).
- AWS auth in CI uses **OIDC** by default — workflows assume `AWS_ROLE_ARN` rather than holding static keys ([CLAUDE.md:478-510](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L478-L510)).
- New shell scripts must have the executable bit set in git index (`git update-index --chmod=+x`) ([CLAUDE.md:619-642](https://github.com/Jeffrey-Keyser/Switchboard/blob/main/CLAUDE.md#L619-L642)).
