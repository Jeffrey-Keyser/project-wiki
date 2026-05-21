---
title: Agency HQ
description: Dev-strategy layer for the Jeffrey-Keyser agent ecosystem — CEO agent, meetings, scrum board, dispatch.
---

# Agency HQ

Agency HQ is the **dev-strategy layer** of the Jeffrey-Keyser agent ecosystem. A CEO agent talks to the human via Telegram, delegates to department leads, and runs structured meetings (brainstorm, standup, retro, backlog grooming). A PostgreSQL-backed scrum board tracks sprints and tasks; tactical execution is handed off to [dev-inbox](https://wiki.jeffreykeyser.net/repos/Jeffrey-Keyser-dev-inbox/) ([README.md:1-9](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/README.md#L1-L9)).

It runs alongside [business-hq](https://github.com/Jeffrey-Keyser/business-hq) — agency-hq decides *what* to build; business-hq tracks *whether it earns* ([README.md:9](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/README.md#L9)).

## At a glance

- **Stack:** Express 5 + TypeScript, PostgreSQL 17 (`agency` schema), RabbitMQ, systemd ([README.md:28-33](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/README.md#L28-L33)).
- **Port:** 3040, served by the systemd user unit `agency-hq.service` ([agency-hq.service:19](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/agency-hq.service#L19)).
- **Entry point:** `src/app.ts` wires the express-server-factory with health, rate limiting, versioning, and v1 routes ([src/app.ts:91-95](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/app.ts#L91-L95)).
- **API root:** `/api/v1/` covering tasks, sprints, meetings, decisions, dashboard, CEO, webhook, memory, autonomy, notifications, directives, artifacts, services ([README.md:37-53](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/README.md#L37-L53)).
- **Who uses it:** the human operator (via Telegram CEO interface) and dev-inbox runners (via dispatch + completion callbacks) ([src/execution/dispatcher.ts:28](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/src/execution/dispatcher.ts#L28)).
- **How work moves:** human directive → CEO message → PM directive → task → dispatch → dev-inbox → completion callback → review → done ([CLAUDE.md:36-58](https://github.com/Jeffrey-Keyser/agency-hq/blob/main/CLAUDE.md#L36-L58)).

## Wiki pages

- [Architecture](./architecture/) — internal modules, services, and how they talk.
- [Iteration Loop](./iteration-loop/) — typical change cycle from idea to merged task.
- [Services & Dependencies](./services-and-dependencies/) — inbound/outbound integrations.
- [Operations](./operations/) — deploy, runtime, observability.
- [Glossary](./glossary/) — repo-specific terminology.
