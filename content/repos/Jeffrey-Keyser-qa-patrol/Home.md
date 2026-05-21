---
title: QA Patrol
description: QA-as-a-Service for the Jeffrey-Keyser ecosystem — Playwright-driven workflow execution with evidence capture and structured reports.
---

# QA Patrol

QA Patrol executes structured Playwright workflows against ecosystem apps, captures evidence (screenshots, console errors, network errors), and returns structured reports. Agents and humans send step arrays + a target app; QA Patrol resolves the app from Pay's registry, runs the steps, and emits completion events ([README.md:3](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L3)).

## At a glance

- **Stack**: Express 5 + TypeScript, PostgreSQL 17, Playwright + system Chrome, RabbitMQ ([CLAUDE.md:7-11](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L7-L11)).
- **Port**: 3042, systemd user unit `qa-patrol.service` ([README.md:55-58](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L55-L58)).
- **Public URL**: https://qa-patrol.jeffreykeyser.net (Cloudflare Tunnel) ([README.md:58](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L58)).
- **Database**: `qa_patrol` DB, `qa` schema, user `jeff`. Two tables: `qa.runs`, `qa.workflows` ([CLAUDE.md:47-48](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L47-L48)).
- **No local app registry** — Pay is the source of truth, proxied at `/api/v1/apps` ([README.md:73](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L73)).
- **Synchronous execution** — runs block until Playwright finishes; no async queue yet ([README.md:175](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L175)).
- **Dashboard**: `/dashboard` server-rendered UI with SSE updates ([README.md:254-264](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L254-L264)).

## Who uses it

- **Agents** (Agency HQ, dev-inbox post-merge hook) POST run requests with explicit steps or natural-language `instructions` ([README.md:227-231](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L227-L231)).
- **cron-service** triggers scheduled workflows + the daily 3am evidence cleanup ([CLAUDE.md:55](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L55)).
- **Downstream consumers** subscribe to the `qa.events` RabbitMQ exchange for `run.completed` / `run.failed` ([CLAUDE.md:34](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L34)).

## How work moves through it

1. Caller `POST /api/v1/runs` with `app` (or `url`) + `steps` ([runs.ts](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/src/routes/versions/v1/runs.ts)).
2. Server resolves app via Pay, persists `qa.runs` row, hands off to `playwright-runner` ([CLAUDE.md:26-28](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L26-L28)).
3. Playwright executes step-by-step against system Chrome under `DISPLAY=:99` ([CLAUDE.md:9](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L9)).
4. Completion hooks fire-and-forget: RabbitMQ → webhook → Telegram → GitHub issues → evidence cleanup ([CLAUDE.md:54](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/CLAUDE.md#L54)).
5. Caller polls `GET /api/v1/runs/:id` or `…/report` for results ([README.md:80-82](https://github.com/Jeffrey-Keyser/qa-patrol/blob/main/README.md#L80-L82)).

## Wiki pages

- [Architecture](./architecture/) — module layout and component diagram.
- [Iteration Loop](./iteration-loop/) — change cycle for this repo.
- [Services and Dependencies](./services-and-dependencies/) — inbound + outbound integrations.
- [Operations](./operations/) — deploy, runtime, observability.
- [Glossary](./glossary/) — repo-specific terms.
