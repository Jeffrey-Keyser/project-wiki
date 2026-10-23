---
title: "QA Patrol"
description: "Overview of QA Patrol, the Playwright-based QA-as-a-Service for the Jeffrey-Keyser ecosystem: at-a-glance facts, callers, the main run flow, and links to deeper pages."
---

# QA Patrol

QA Patrol is QA-as-a-Service for the Jeffrey-Keyser ecosystem. Callers send structured workflow steps and a target app. The service executes them with Playwright, captures evidence such as screenshots, console errors, and network errors, and returns structured reports ([README.md:L3](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/README.md#L3)).

The README labels the project "Phase 2 — Live and operational" ([README.md:L5](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/README.md#L5)). This wiki describes the attached source snapshot and does not verify live runtime state. See [Operations](../operations/).

## At a glance

- **Server**: Express 5 with TypeScript ([package.json:L22](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/package.json#L22)), started from `src/bin/www.ts` ([src/bin/www.ts:L13](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/bin/www.ts#L13)).
- **Browser**: Playwright launching headless Chrome from `/usr/bin/google-chrome` ([src/services/playwright-runner.ts:L155-L158](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/playwright-runner.ts#L155-L158)).
- **Database**: PostgreSQL via `pg` ([package.json:L24](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/package.json#L24)), schema `qa` ([database.json:L2](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/database.json#L2)), with tables `qa.runs` and `qa.workflows` ([CLAUDE.md:L46-L47](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/CLAUDE.md#L46-L47)).
- **Default port**: 3042 ([src/config/env.ts:L24](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/config/env.ts#L24)).
- **Health**: `GET /health` reports database and RabbitMQ checks ([src/app.ts:L85-L91](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/app.ts#L85-L91)).
- **App registry**: no local app storage; Pay is the source of truth ([README.md:L73](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/README.md#L73)).
- **Execution**: synchronous; the request blocks until Playwright finishes ([README.md:L183](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/README.md#L183)).

## Who uses it

Confirmed as route or consumer handlers in source (the actual caller identities are not visible):

- HTTP clients of `/api/v1/runs` and `/api/v1/workflows` ([src/routes/versions/v1/runs.ts:L19](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/runs.ts#L19), [src/routes/versions/v1/workflows.ts:L16](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/workflows.ts#L16)).
- Cron-triggered messages on RabbitMQ queues that the service consumes ([src/services/rabbitmq-consumer.ts:L92-L109](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/services/rabbitmq-consumer.ts#L92-L109)).

Documented but not verified in the attached excerpts:

- Agency HQ, which reads a 24-hour QA summary ([README.md:L238](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/README.md#L238)).
- The dev-inbox post-merge hook ([README.md:L239](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/README.md#L239)).
- A NanoClaw skill file ([CLAUDE.md:L55](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/CLAUDE.md#L55)).

## Main flow

1. A caller posts to `/api/v1/runs` with `steps` or `instructions`, plus `app` or `url` ([src/routes/versions/v1/runs.ts:L23-L28](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/runs.ts#L23-L28), [src/routes/versions/v1/runs.ts:L35-L60](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/runs.ts#L35-L60)).
2. An app name resolves through Pay, and auth type is auto-detected unless `options.authType` is set ([src/routes/versions/v1/runs.ts:L35-L48](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/runs.ts#L35-L48)).
3. When `instructions` are given, steps are generated through the AI proxy ([src/routes/versions/v1/runs.ts:L66-L81](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/runs.ts#L66-L81)).
4. A run record is created and marked running ([src/routes/versions/v1/runs.ts:L84-L95](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/runs.ts#L84-L95)).
5. Steps execute, and overall status is pass, partial, or fail. An execution crash is recorded as error ([src/routes/versions/v1/runs.ts:L98-L114](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/runs.ts#L98-L114), [src/routes/versions/v1/runs.ts:L129-L147](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/runs.ts#L129-L147)).
6. The caller receives a 201 with the updated run. Completion hooks start after the response ([src/routes/versions/v1/runs.ts:L116-L128](https://github.com/Jeffrey-Keyser/qa-patrol/blob/f9b3dd00ba79e6fc176957326134666ddbb039b5/src/routes/versions/v1/runs.ts#L116-L128)).

## Read next

- [Architecture](../architecture/): components, contracts, and the run path diagram.
- [Iteration Loop](../iteration-loop/): scripts, migrations, and the change cycle.
- [Services and Dependencies](../services-and-dependencies/): what QA Patrol depends on and what consumes it.
- [Operations](../operations/): start, deploy, health, and observability.
- [Glossary](../glossary/): project-specific terms.
