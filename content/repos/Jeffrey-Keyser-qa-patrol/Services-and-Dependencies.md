---
title: Services and Dependencies
description: Inbound and outbound integrations — what QA Patrol depends on and what consumes it.
---

# Services and Dependencies

## Depends on

### NPM packages

- `@jeffrey-keyser/express-server-factory` — server bootstrap, middleware, health checks ([package.json:16](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/package.json#L16)).
- `@jeffrey-keyser/database-base-config` — Postgres pool config ([package.json:15](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/package.json#L15)).
- `@jeffrey-keyser/github-error-issues` — console errors → GitHub issues ([package.json:17](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/package.json#L17)).
- `@jeffrey-keyser/message-contracts` — RabbitMQ event payload shapes ([package.json:18](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/package.json#L18)).
- `playwright` — browser automation engine ([package.json:24](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/package.json#L24)).
- `amqplib` — RabbitMQ client ([package.json:19](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/package.json#L19)).
- `pg` + `node-pg-migrate` — Postgres driver + migration tool ([package.json:22-23](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/package.json#L22-L23)).

### System services

- **PostgreSQL 17** — `qa_patrol` DB, schema `qa`, user `jeff` ([CLAUDE.md:8](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L8)).
- **System Chrome** — `/usr/bin/google-chrome` driven via Playwright; runs under Xvfb `DISPLAY=:99` ([CLAUDE.md:9](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L9)).
- **RabbitMQ** — `qa.events` exchange for publish; inbound consumer for cron triggers ([CLAUDE.md:34-35](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L34-L35)).
- **Cloudflare Tunnel** — exposes service at https://qa-patrol.jeffreykeyser.net ([README.md:208](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L208)).
- **systemd (user mode)** — `qa-patrol.service` ([CLAUDE.md:10](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L10)).

### Ecosystem services (outbound HTTP)

- **Pay** — app registry proxy at `localhost:3017/api/v1/apps` via `pay-client.ts` ([README.md:60](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L60), [CLAUDE.md:40](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L40)). See [Pay wiki](https://wiki.jeffreykeyser.net/repos/Jeffrey-Keyser-pay/).
- **cron-service** — workflow schedule registration via `cron-client.ts` ([CLAUDE.md:39](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L39)).
- **Solo Vault** — pulls `PAY_AUTH_EMAIL` / `PAY_AUTH_PASSWORD` for authenticated targets ([README.md:240-242](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L240-L242)).
- **AI Proxy** — LLM calls for step generation (gpt-4o) and vision analysis via `ai-proxy-client.ts` ([README.md:214-217](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L214-L217)).
- **Telegram** — failure alerts via `telegram-notifier.ts` (same bot as Agency HQ, CEO chat) ([README.md:229](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L229)).
- **GitHub** — auto-files console-error issues via `github-issues.ts` + `github-error-issues` package ([CLAUDE.md:37](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L37), [README.md:222](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L222)).

## Consumed by

- **Agency HQ** — morning briefing pulls QA summary from `/api/v1/summary` ([README.md:230](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L230), [src/routes/versions/v1/summary.ts](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/src/routes/versions/v1/summary.ts)).
- **dev-inbox** — post-merge hook calls `scripts/post-merge-qa.sh` after a PR lands ([README.md:231](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L231)).
- **cron-service** — fires scheduled workflows and the daily 3am evidence cleanup trigger (consumed by `rabbitmq-consumer.ts`) ([CLAUDE.md:35](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L35), [CLAUDE.md:55](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L55)).
- **NanoClaw** — surfaces a QA Patrol skill at `/home/jkeyser/nanoclaw/container/skills/qa-patrol/SKILL.md` so containerized agents can call the API ([CLAUDE.md:56](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L56)).
- **Arbitrary RabbitMQ subscribers** — anyone bound to `qa.events` receives `run.completed` / `run.failed` / `workflow.completed` ([README.md:223](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L223)).
- **Callers via callback** — request-supplied `callbackUrl` is POSTed on completion (SSRF-protected by `webhook-notifier.ts`) ([CLAUDE.md:38](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L38), [README.md:224](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L224)).

## Inbound API surface

- `/api/v1/apps` (read-only proxy), `/api/v1/runs`, `/api/v1/runs/:id/promote`, `/api/v1/workflows` ([README.md:67-94](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L67-L94)).
- `/dashboard` (server-rendered UI) and `/api/v1/dashboard/stream` (SSE) ([README.md:258-264](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L258-L264)).
- `/evidence/runs/:runId/:filename` (static screenshots) ([README.md:151](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L151)).
- `/health` (DB + RabbitMQ liveness) ([app.ts:84-92](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/src/app.ts#L84-L92)).
