---
title: Solo Vault — Repo Overview
description: Self-hosted secrets management service (server + CLI) for the Jeffrey-Keyser ecosystem.
---

# Solo Vault

Solo Vault is a lightweight, self-hosted secrets manager built for the Jeffrey-Keyser ecosystem. It stores encrypted secrets in PostgreSQL behind a REST API and ships a companion CLI for developers and CI/CD ([README.md:1-16](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/README.md#L1-L16)).

## At a glance

- **Two deployables in one repo**: an Express/Lambda API server (`server/`) and a publishable npm CLI `@jeffrey-keyser/solo-vault-cli` (`cli/`) ([package.json:6-11](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/package.json#L6-L11), [cli/package.json:1-8](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/cli/package.json#L1-L8)).
- **Auth model**: scoped API keys formatted `sv_<project>_<random>.<secret>`, hashed (SHA-256) at rest, with `read|write|delete|admin` permissions and optional environment scoping ([CLAUDE.md:60-79](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/CLAUDE.md#L60-L79)).
- **Encryption at rest**: AES-256-GCM with per-secret IV/auth tag, key derived via scrypt from `VAULT_ENCRYPTION_KEY` ([server/services/encryption.ts:1-39](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/server/services/encryption.ts#L1-L39)).
- **Hosted at** `https://vault.jeffreykeyser.net/api/v1`; deployed as a Lambda fronted by API Gateway via the shared CI/CD pipeline ([README.md:64-89](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/README.md#L64-L89), [.github/workflows/ci-cd-pipeline.yml:73-119](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/.github/workflows/ci-cd-pipeline.yml#L73-L119)).
- **Datastore**: PostgreSQL `vault` schema — `secrets`, `api_keys`, `audit_log`, plus rotation/webhook/policy tables added by migrations ([server/db/schema](https://github.com/Jeffrey-Keyser/solo-vault/tree/main/server/db/schema), [server/db/migrations](https://github.com/Jeffrey-Keyser/solo-vault/tree/main/server/db/migrations)).

## Who uses it

- **Other services in the ecosystem** read their `.env` values from Solo Vault at deploy or runtime via the bulk endpoint ([README.md:80-89](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/README.md#L80-L89)).
- **Developers** use the CLI locally to `get`, `set`, `pull`, `rotate`, and inspect secrets ([cli/src/index.ts:1-34](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/cli/src/index.ts#L1-L34)).
- **CI/CD jobs** authenticate with environment-scoped keys to inject secrets into deploys ([README.md:286-316](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/README.md#L286-L316)).

## How work moves through it

A typical change touches the server routes/DAL (`server/routes`, `server/dal`), corresponding CLI command (`cli/src/commands`), and — when storage changes — a new SQL migration in `server/db/migrations`. PRs run backend + CLI tests; merges to `main` deploy the Lambda and publish the CLI to GitHub Packages ([.github/workflows/ci-cd-pipeline.yml:9-151](https://github.com/Jeffrey-Keyser/solo-vault/blob/main/.github/workflows/ci-cd-pipeline.yml#L9-L151)).

## Wiki pages

- [Architecture](./architecture/) — internal module layout, role contracts, Mermaid component map.
- [Iteration Loop](./iteration-loop/) — how a change goes from idea to merge to deploy.
- [Services and Dependencies](./services-and-dependencies/) — inbound/outbound integrations.
- [Operations](./operations/) — deploy, runtime, observability, on-call.
- [Glossary](./glossary/) — repo-specific terms with definitions.
